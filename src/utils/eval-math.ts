import * as types from '@/src/types';

export function evalMath(
    condition = '',
    values: types.ScreenEntryValue[],
) {
    if( condition.match(/MATH\(([^)]+)\)/)){
        return evaluateFormula(condition,values)
    }

    condition = condition.toLowerCase();

    if (condition.toLowerCase().includes('sum')) {
        condition = condition
            .replace(/sum/gi, '')
            .replaceAll(',', '+');
    }

    if (condition.toLowerCase().includes('multiply')) {
        condition = condition
            .replace(/multiply/gi, '')
            .replaceAll(',', '*');
    }

    if (condition.toLowerCase().includes('divide')) {
        condition = condition
            .replace(/divide/gi, '')
            .replaceAll(',', '/');
    }

    if (condition.toLowerCase().includes('subtract')) {
        condition = condition
            .replace(/subtract/gi, '')
            .replaceAll(',', '-');
    }

    const getValue = (key: string, op: 'sum' | 'subtract' | 'multiply' | 'divide') => {
        key = `${key || ''}`.toLowerCase()
            .replaceAll('__', '')
            .replaceAll('_plus', '')
            .replaceAll('_minus', '')
            .replaceAll('_multiply', '')
            .replaceAll('_divide', '')
            .replaceAll('- ', '')
            .replaceAll('+ ', '')
            .replaceAll('/ ', '')
            .replaceAll('* ', '');

        const entry = values.filter(v => v.key?.toLowerCase?.() == key?.toLowerCase?.())[0];

        const valueIsValidNumber = !entry || (entry?.value === null) || isNaN(Number(entry?.value)) ? false : true;
        let value: number | null = valueIsValidNumber ? Number(entry?.value!) : null;

        switch (op) {
            case 'sum':
                if (value === null) value = 0;
                break;

            case 'subtract':
                if (value === null) value = 0;
                break;

            case 'multiply':
                if (value === null) value = 0;
                break;

            case 'divide':
                if (value === null) value = 0;
                break;
        
            default:
                break;
        }

        return value || 0;
    };
    let parsedCondition = condition
        .replaceAll('+', ' _plus ')
        .replaceAll('-', ' _minus ')
        .replaceAll('*', ' _multiply ')
        .replaceAll('/', ' _divide ')
        .replace(/\s+/g, " ")
        .replaceAll('$', '__');

    parsedCondition = parsedCondition
        .replaceAll(' _plus ', '_plus ')
        .replaceAll(' _minus ', '_minus ')
        .replaceAll(' _multiply ', '_multiply ')
        .replaceAll(' _divide ', '_divide ')

    let parsed = parsedCondition;

    if (parsed.match(/__\w+_plus/gi)) {
        parsed.match(/__\w+_plus/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, getValue(key, 'sum') + ' +');
        })
    }

    if (parsed.match(/__\w+_minus/gi)) {
        parsed.match(/__\w+_minus/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, getValue(key, 'subtract') + ' -');
        })
    }

    if (parsed.match(/__\w+_divide/gi)) {
        parsed.match(/__\w+_divide/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, getValue(key, 'divide') + ' /');
        })
    }

    if (parsed.match(/__\w+_multiply/gi)) {
        parsed.match(/__\w+_multiply/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, getValue(key, 'multiply') + ' *');
        })
    }

    parsed = parsed.replaceAll('_minus', ' -');
    parsed = parsed.replaceAll('_plus', ' +');
    parsed = parsed.replaceAll('_multiply', ' *');
    parsed = parsed.replaceAll('_divide', ' /');

    if (parsed.match(/\+ __\w+/gi)) {
        parsed.match(/\+ __\w+/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, '+ ' + getValue(key, 'sum'));
        })
    }

    if (parsed.match(/\- __\w+/gi)) {
        parsed.match(/\- __\w+/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, '- ' + getValue(key, 'subtract'));
        })
    }

    if (parsed.match(/\* __\w+/gi)) {
        parsed.match(/\* __\w+/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, '* ' + getValue(key, 'multiply'));
        })
    }

    if (parsed.match(/\/ __\w+/gi)) {
        parsed.match(/\/ __\w+/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, '/ ' + getValue(key, 'divide'));
        })
    }

    parsed = parsed.replaceAll('/ 0', '/ 1');

    let result: number | null = null;
    let error: null | string = null;

    try {
        result = eval(parsed);
    } catch(e: any) {
        error = e.message;
    }

    return {
        expresion: parsed,
        result,
        error,
    };
}

function evaluateFormula(formula: string, values: types.ScreenEntryValue[]) {
  let safeExpression = '';
  
  try {
    // Remove "MATH(" from beginning and ")" from end
    if (!formula.startsWith('MATH(') || !formula.endsWith(')')) {
      throw new Error('Invalid formula format');
    }
    
    // Extract everything between MATH( and the final )
    let expression = formula.substring(5, formula.length - 1);
    safeExpression = expression;
    const variableSet = new Set<string>();
    const variableMatches = expression.match(/\$[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    
    variableMatches.forEach(fullVar => {
      variableSet.add(fullVar);
    });
    
    // Process each variable
    const variables: Record<string, number> = {};
    
    for (const fullVar of Array.from(variableSet)) {
      const varName = fullVar.substring(1); // Remove $ prefix
      
      const entry = values.find(v => v?.key?.toLowerCase() === varName.toLowerCase());
      
      if (!entry) {
        throw new Error(`Variable ${varName} not found in values array`);
      }
       let value = Number(entry.value);
      if(entry.type=='period'){
        value=entry.exportValue
      }
      
      if (isNaN(value)) {
        throw new Error(`Invalid number value for variable ${varName}`);
      }
      
      variables[fullVar] = value;
    }

    // Replace all variables with their values
    for (const [variable, value] of Object.entries(variables)) {
  
      const regex = new RegExp(`\\${variable}\\b`, 'g');
      safeExpression = safeExpression.replace(regex, String(value));
    }
    
    console.log("AFTER REPLACEMENT:", safeExpression);
    
    let result: number;

    // Validate expression safety
    const allowedChars = /^[0-9+\-*/().\sMath\.floor|Math\.round|%]+$/;
    const testExpression = safeExpression.replace(/Math\./g, '');
    
    if (!allowedChars.test(testExpression)) {
      throw new Error('Formula contains unsafe characters or functions');
    }

    result = new Function(`return ${safeExpression}`)();
    
    if (isNaN(result) || !isFinite(result)) {
      throw new Error('Formula evaluation resulted in invalid number');
    }
    
    return {
      expression: safeExpression,
      result: result,
      error: null
    };
    
  } catch (error: any) {
    return {
      result: null,
      error: error.message,
      expression: safeExpression,
    };
  }    
}
