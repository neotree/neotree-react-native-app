/**
 * Restricted evaluator for calculated-field arithmetic (`MATH(...)` formulas and the
 * SUM/MULTIPLY/DIVIDE/SUBTRACT shorthand), replacing `new Function` and `expr-eval`
 * (NEOAPP-1556, NEOAPP-1484).
 *
 * Both of those ran an author-supplied string as code. `new Function` was guarded only by
 * a character-class check that accepted any word spelled from the letters of
 * "Math.floor|Math.round", and expr-eval 2.0.2 has an unpatched code-execution flaw.
 *
 * The grammar here is exactly what a formula needs and nothing else:
 *   numbers, + - * / % **, unary - and +, parentheses, Math.floor(x), Math.round(x).
 * There are no identifiers, no property access and no other functions, so a formula can
 * produce a wrong number but never run code. Precedence and associativity follow
 * JavaScript, which is what `new Function` used; as in JavaScript, `-2 ** 2` without
 * parentheses is rejected rather than guessed at.
 */

export class MathSyntaxError extends Error {}

type Token = { kind: 'num'; value: number } | { kind: 'punct'; value: string } | { kind: 'fn'; value: string };

// Longest first, so '**' is not read as two '*'. '--' and '++' are listed only so they
// are recognised and rejected: in JavaScript they are increment/decrement, so `5 --3`
// was a syntax error under `new Function`, and reading it as `5 - -3` would quietly
// change what an existing formula produces.
const PUNCTUATION = ['**', '--', '++', '+', '-', '*', '/', '%', '(', ')', ','];
const FUNCTIONS: Record<string, (x: number) => number> = {
    'Math.floor': Math.floor,
    'Math.round': Math.round,
};

/**
 * Which evaluator's reading of an ambiguous formula to keep. `MATH(...)` formulas ran
 * under JavaScript (`new Function`); the SUM/MULTIPLY/DIVIDE/SUBTRACT shorthand ran under
 * expr-eval. The two disagree in exactly two places, and each path keeps its own answer:
 *   - `--` / `++`: a JavaScript syntax error; repeated signs under expr-eval, so `--3` is 3.
 *   - `**`: JavaScript exponentiation; a syntax error in expr-eval.
 */
export type ArithmeticDialect = 'javascript' | 'expr-eval';

function tokenize(src: string, dialect: ArithmeticDialect): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < src.length) {
        const ch = src[i];

        if (/\s/.test(ch)) { i += 1; continue; }

        if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] || ''))) {
            const match = /^[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?/.exec(src.slice(i));
            if (!match) throw new MathSyntaxError('bad number');
            tokens.push({ kind: 'num', value: Number(match[0]) });
            i += match[0].length;
            continue;
        }

        if (/[A-Za-z]/.test(ch)) {
            const match = /^[A-Za-z]+(?:\.[A-Za-z]+)?/.exec(src.slice(i))!;
            if (!Object.prototype.hasOwnProperty.call(FUNCTIONS, match[0])) {
                throw new MathSyntaxError(`${match[0]} is not allowed in a formula`);
            }
            tokens.push({ kind: 'fn', value: match[0] });
            i += match[0].length;
            continue;
        }

        const punct = PUNCTUATION.find(p => src.startsWith(p, i));
        if (!punct) throw new MathSyntaxError(`unexpected character ${JSON.stringify(ch)}`);
        if (punct === '--' || punct === '++') {
            if (dialect === 'javascript') throw new MathSyntaxError(`${punct} is not allowed in a formula`);
            // expr-eval reads them as two signs.
            tokens.push({ kind: 'punct', value: punct[0] }, { kind: 'punct', value: punct[1] });
            i += 2;
            continue;
        }
        if (punct === '**' && dialect === 'expr-eval') throw new MathSyntaxError('** is not allowed in this calculation');
        tokens.push({ kind: 'punct', value: punct });
        i += punct.length;
    }

    return tokens;
}

class Parser {
    private pos = 0;
    private readonly tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private atPunct(...values: string[]) {
        const t = this.tokens[this.pos];
        return !!t && t.kind === 'punct' && values.includes(t.value);
    }

    private take(): Token {
        const t = this.tokens[this.pos];
        if (!t) throw new MathSyntaxError('unexpected end of formula');
        this.pos += 1;
        return t;
    }

    private expect(value: string) {
        if (!this.atPunct(value)) throw new MathSyntaxError(`expected ${value}`);
        this.pos += 1;
    }

    evaluate(): number {
        const value = this.additive();
        if (this.pos !== this.tokens.length) throw new MathSyntaxError('trailing input');
        return value;
    }

    private additive(): number {
        let left = this.multiplicative();
        while (this.atPunct('+', '-')) {
            const op = (this.take() as { value: string }).value;
            const right = this.multiplicative();
            left = op === '+' ? left + right : left - right;
        }
        return left;
    }

    private multiplicative(): number {
        let left = this.exponent();
        while (this.atPunct('*', '/', '%')) {
            const op = (this.take() as { value: string }).value;
            const right = this.exponent();
            left = op === '*' ? left * right : op === '/' ? left / right : left % right;
        }
        return left;
    }

    // `**` is right-associative and, as in JavaScript, cannot take a bare unary operand
    // on its left: `-2 ** 2` is ambiguous and rejected; `(-2) ** 2` is fine.
    private exponent(): number {
        if (this.atPunct('-', '+')) {
            const value = this.unary();
            if (this.atPunct('**')) throw new MathSyntaxError('parenthesise a negative base before **');
            return value;
        }
        const base = this.primary();
        if (this.atPunct('**')) {
            this.pos += 1;
            return base ** this.exponent();
        }
        return base;
    }

    private unary(): number {
        if (this.atPunct('-', '+')) {
            const op = (this.take() as { value: string }).value;
            const value = this.unary();
            return op === '-' ? -value : +value;
        }
        return this.primary();
    }

    private primary(): number {
        const token = this.take();

        if (token.kind === 'num') return token.value;

        if (token.kind === 'fn') {
            this.expect('(');
            const argument = this.additive();
            this.expect(')');
            return FUNCTIONS[token.value](argument);
        }

        if (token.value === '(') {
            const value = this.additive();
            this.expect(')');
            return value;
        }

        throw new MathSyntaxError(`unexpected ${JSON.stringify(token.value)}`);
    }
}

/**
 * Evaluates an arithmetic formula whose variables have already been replaced by numbers.
 * Throws MathSyntaxError for anything outside the grammar; callers report that as a
 * formula error, the way they reported an exception from the evaluators this replaces.
 */
export function evaluateArithmetic(expression: string, dialect: ArithmeticDialect = 'javascript'): number {
    return new Parser(tokenize(expression, dialect)).evaluate();
}
