/**
 * Restricted, hand-rolled expression interpreter used in place of eval()/
 * new Function() for evaluating script condition/formula strings.
 *
 * By the time a condition or formula string reaches this evaluator, every
 * `$key` reference has already been substituted by the caller with a literal
 * value (number, string, boolean, null or array), so this only ever needs to
 * interpret a self-contained literal expression - never resolve identifiers
 * against outer scope. That means we can parse the string into our own AST
 * with a strict grammar whitelist, then evaluate that AST using real JS
 * operators (so coercion/comparison semantics match `eval` exactly) without
 * ever handing attacker-influenced text to `eval`, `Function`, or any other
 * dynamic-code-execution primitive.
 *
 * Supported grammar:
 *   - literals: numbers, 'single' or "double" quoted strings, true, false, null
 *   - array literals: [expr, expr, ...]
 *   - grouping: ( expr )
 *   - unary: ! - +
 *   - arithmetic: + - * / %
 *   - relational: > >= < <=
 *   - equality: == === != !==
 *   - logical: && ||
 *   - method calls restricted to:
 *       <array-or-string-expr>.includes(expr)
 *       Math.floor(expr)
 *       Math.round(expr)
 *
 * Anything outside this grammar throws, matching eval()'s throw-on-invalid-
 * syntax behavior, so existing try/catch fallbacks at call sites see the
 * same outcome as before.
 */

type Token =
    | { type: 'number'; value: number }
    | { type: 'string'; value: string }
    | { type: 'ident'; value: string }
    | { type: 'punct'; value: string }
    | { type: 'eof' };

type Node =
    | { kind: 'lit'; value: any }
    | { kind: 'array'; items: Node[] }
    | { kind: 'ident'; name: 'Math' }
    | { kind: 'unary'; op: '!' | '-' | '+'; arg: Node }
    | { kind: 'binary'; op: string; left: Node; right: Node }
    | { kind: 'logical'; op: '&&' | '||'; left: Node; right: Node }
    | { kind: 'call'; target: Node; method: string; args: Node[] };

// Longest-match-first so e.g. '===' is not tokenized as '==' followed by '='.
const PUNCTUATION = [
    '===', '!==', '==', '!=', '>=', '<=', '&&', '||',
    '(', ')', '[', ']', ',', '.', '!', '+', '-', '*', '/', '%', '<', '>',
];

const ESCAPES: Record<string, string> = {
    n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '"': '"', '\'': '\'', '\\': '\\', '/': '/',
};

function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    const n = input.length;
    let i = 0;

    while (i < n) {
        const ch = input[i];

        if (/\s/.test(ch)) { i++; continue; }

        if (ch === '\'' || ch === '"') {
            const quote = ch;
            let j = i + 1;
            let out = '';
            while (j < n && input[j] !== quote) {
                if (input[j] === '\\' && j + 1 < n) {
                    const esc = input[j + 1];
                    if (esc === 'u' && j + 5 < n) {
                        const hex = input.slice(j + 2, j + 6);
                        out += String.fromCharCode(parseInt(hex, 16));
                        j += 6;
                        continue;
                    }
                    out += ESCAPES[esc] !== undefined ? ESCAPES[esc] : esc;
                    j += 2;
                    continue;
                }
                out += input[j];
                j++;
            }
            if (j >= n) throw new Error('Unterminated string literal in expression');
            tokens.push({ type: 'string', value: out });
            i = j + 1;
            continue;
        }

        if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(input[i + 1] || ''))) {
            let j = i;
            while (j < n && /[0-9]/.test(input[j])) j++;
            if (input[j] === '.') {
                j++;
                while (j < n && /[0-9]/.test(input[j])) j++;
            }
            if (input[j] === 'e' || input[j] === 'E') {
                let k = j + 1;
                if (input[k] === '+' || input[k] === '-') k++;
                if (/[0-9]/.test(input[k] || '')) {
                    j = k;
                    while (j < n && /[0-9]/.test(input[j])) j++;
                }
            }
            tokens.push({ type: 'number', value: Number(input.slice(i, j)) });
            i = j;
            continue;
        }

        if (/[A-Za-z_]/.test(ch)) {
            let j = i;
            while (j < n && /[A-Za-z0-9_]/.test(input[j])) j++;
            tokens.push({ type: 'ident', value: input.slice(i, j) });
            i = j;
            continue;
        }

        const punct = PUNCTUATION.find(p => input.startsWith(p, i));
        if (!punct) throw new Error(`Unexpected character "${ch}" in expression`);
        tokens.push({ type: 'punct', value: punct });
        i += punct.length;
    }

    tokens.push({ type: 'eof' });
    return tokens;
}

class ExpressionParser {
    private tokens: Token[];
    private pos = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peek(): Token {
        return this.tokens[this.pos];
    }

    private isPunct(value: string): boolean {
        const t = this.peek();
        return t.type === 'punct' && t.value === value;
    }

    private expectPunct(value: string) {
        if (!this.isPunct(value)) throw new Error(`Expected "${value}" in expression`);
        this.pos++;
    }

    parseExpression(): Node {
        return this.parseLogicalOr();
    }

    end(): boolean {
        return this.peek().type === 'eof';
    }

    private parseLogicalOr(): Node {
        let left = this.parseLogicalAnd();
        while (this.isPunct('||')) {
            this.pos++;
            left = { kind: 'logical', op: '||', left, right: this.parseLogicalAnd() };
        }
        return left;
    }

    private parseLogicalAnd(): Node {
        let left = this.parseEquality();
        while (this.isPunct('&&')) {
            this.pos++;
            left = { kind: 'logical', op: '&&', left, right: this.parseEquality() };
        }
        return left;
    }

    private parseEquality(): Node {
        let left = this.parseRelational();
        while (this.isPunct('==') || this.isPunct('!=') || this.isPunct('===') || this.isPunct('!==')) {
            const op = this.tokens[this.pos++] as { type: 'punct'; value: string };
            left = { kind: 'binary', op: op.value, left, right: this.parseRelational() };
        }
        return left;
    }

    private parseRelational(): Node {
        let left = this.parseAdditive();
        while (this.isPunct('>') || this.isPunct('>=') || this.isPunct('<') || this.isPunct('<=')) {
            const op = this.tokens[this.pos++] as { type: 'punct'; value: string };
            left = { kind: 'binary', op: op.value, left, right: this.parseAdditive() };
        }
        return left;
    }

    private parseAdditive(): Node {
        let left = this.parseMultiplicative();
        while (this.isPunct('+') || this.isPunct('-')) {
            const op = this.tokens[this.pos++] as { type: 'punct'; value: string };
            left = { kind: 'binary', op: op.value, left, right: this.parseMultiplicative() };
        }
        return left;
    }

    private parseMultiplicative(): Node {
        let left = this.parseUnary();
        while (this.isPunct('*') || this.isPunct('/') || this.isPunct('%')) {
            const op = this.tokens[this.pos++] as { type: 'punct'; value: string };
            left = { kind: 'binary', op: op.value, left, right: this.parseUnary() };
        }
        return left;
    }

    private parseUnary(): Node {
        if (this.isPunct('!') || this.isPunct('-') || this.isPunct('+')) {
            const op = this.tokens[this.pos++] as { type: 'punct'; value: '!' | '-' | '+' };
            return { kind: 'unary', op: op.value, arg: this.parseUnary() };
        }
        return this.parsePostfix();
    }

    private parsePostfix(): Node {
        let node = this.parsePrimary();
        while (this.isPunct('.')) {
            this.pos++;
            const t = this.peek();
            if (t.type !== 'ident') throw new Error('Expected method name after "." in expression');
            this.pos++;
            this.expectPunct('(');
            const args: Node[] = [];
            if (!this.isPunct(')')) {
                args.push(this.parseExpression());
                while (this.isPunct(',')) {
                    this.pos++;
                    args.push(this.parseExpression());
                }
            }
            this.expectPunct(')');
            node = { kind: 'call', target: node, method: t.value, args };
        }
        return node;
    }

    private parsePrimary(): Node {
        const t = this.peek();

        if (t.type === 'number') {
            this.pos++;
            return { kind: 'lit', value: t.value };
        }

        if (t.type === 'string') {
            this.pos++;
            return { kind: 'lit', value: t.value };
        }

        if (t.type === 'ident') {
            this.pos++;
            const lower = t.value.toLowerCase();
            if (lower === 'true') return { kind: 'lit', value: true };
            if (lower === 'false') return { kind: 'lit', value: false };
            if (lower === 'null') return { kind: 'lit', value: null };
            if (lower === 'math') return { kind: 'ident', name: 'Math' };
            throw new Error(`Unknown identifier "${t.value}" in expression`);
        }

        if (this.isPunct('(')) {
            this.pos++;
            const expr = this.parseExpression();
            this.expectPunct(')');
            return expr;
        }

        if (this.isPunct('[')) {
            this.pos++;
            const items: Node[] = [];
            if (!this.isPunct(']')) {
                items.push(this.parseExpression());
                while (this.isPunct(',')) {
                    this.pos++;
                    items.push(this.parseExpression());
                }
            }
            this.expectPunct(']');
            return { kind: 'array', items };
        }

        throw new Error(
            `Unexpected token "${t.type === 'eof' ? 'end of input' : (t as any).value}" in expression`
        );
    }
}

const MATH_NAMESPACE = Symbol('MathNamespace');

function evaluateNode(node: Node): any {
    switch (node.kind) {
        case 'lit':
            return node.value;

        case 'array':
            return node.items.map(evaluateNode);

        case 'ident':
            return MATH_NAMESPACE;

        case 'unary': {
            const value = evaluateNode(node.arg);
            if (node.op === '!') return !value;
            if (node.op === '-') return -value;
            return +value;
        }

        case 'binary': {
            const left = evaluateNode(node.left);
            const right = evaluateNode(node.right);
            switch (node.op) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return left / right;
                case '%': return left % right;
                case '==': return left == right; // eslint-disable-line eqeqeq
                case '!=': return left != right; // eslint-disable-line eqeqeq
                case '===': return left === right;
                case '!==': return left !== right;
                case '>': return left > right;
                case '>=': return left >= right;
                case '<': return left < right;
                case '<=': return left <= right;
                default: throw new Error(`Unsupported operator "${node.op}" in expression`);
            }
        }

        case 'logical': {
            const left = evaluateNode(node.left);
            if (node.op === '&&') return left ? evaluateNode(node.right) : left;
            return left ? left : evaluateNode(node.right);
        }

        case 'call': {
            const target = evaluateNode(node.target);
            const method = node.method.toLowerCase();

            if (target === MATH_NAMESPACE) {
                const arg = Number(evaluateNode(node.args[0]));
                if (method === 'floor') return Math.floor(arg);
                if (method === 'round') return Math.round(arg);
                throw new Error(`Unsupported Math method "${node.method}" in expression`);
            }

            if (method === 'includes' && (Array.isArray(target) || typeof target === 'string')) {
                const arg = evaluateNode(node.args[0]);
                return (target as any[] | string).includes(arg as never);
            }

            throw new Error(`Unsupported method call "${node.method}" in expression`);
        }

        default:
            throw new Error('Unsupported expression node');
    }
}

/**
 * Parses and evaluates a fully-literal expression string. Throws on any
 * syntax outside the supported grammar - callers should keep their existing
 * try/catch around this, exactly as they did around eval()/new Function().
 */
export function evaluateSafeExpression(source: string): any {
    const tokens = tokenize(source ?? '');
    const parser = new ExpressionParser(tokens);
    const ast = parser.parseExpression();
    if (!parser.end()) throw new Error('Unexpected trailing input in expression');
    return evaluateNode(ast);
}
