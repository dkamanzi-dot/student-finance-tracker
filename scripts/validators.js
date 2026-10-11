/*The REGEX Patterns*/

export const patterns = {
    description: /^\S(?:.*\S)?$/,
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    date:/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWord: /\b(\w+)\s+\1\b/i,
};

/*Helper*/

export function
normalizeDescription(value) {
    return value.replace(/\s{2,}/g, ' ');
}

export function isRealDate(value) {
    const [year, month, day] =
 value.split('-').map(Number);
    const d = new Date(year, month -1, day);
    return (
        d.getFullYear() === year &&
        d.getMonth() === month - 1 &&
        d.getDate() === day
    );
}

/*validator*/

export function
validateDescription(value) {
    if (value === '') {
        return { valid: false, message:
            'Enter a description.' };
    }
    if (!patterns.description.test(normalizeDescription(value))) {
        return{
            valid: false,
            message: 'Remove the spaces at the start or end of the description.',
        };
    }
    return { valid: true};
}

export function validateAmount(value) {
    if (value === '') {
        return { valid: false, message:
            'Enter an amount.' };
        }
        if (!patterns.amount.test(value)) {
            return {
                valid: false,
                message: 'Use a number like 12 or 12.50 (no leading zeros, up to 2 decimals).',
            };
    }
    return { valid: true};
}

export function validateDate(value) {
    if (value === '') {
        return { valid: false, message:
            'Enter a date.' };
        }
        if (!patterns.date.test(value)  || !
        isRealDate(value)) {
            return { valid: false, message: 'Use a real date in the format YYYY-MM-DD.' };
        }
        return { valid: true };
    }

    export function validateCategory(value)
    {
        if (value === '') {
            return { valid: false, message:
                'Choose a category.' };
            }
            if (!patterns.category.test(value)) {
                return {
                    valid: false,
                    message: 'Use letters, with single spaces or hyphens between words.',
                };
            }
            return { valid: true };
            }

  /*Duplicate word warning*/

  export function
  checkDuplicateWords(value) {
    const match =
  normalizeDescription(value).match(patterns.duplicateWord);
    if (!match) return null;
    return `The word "${match[1]}" appears twice in a row. Is that a typo?`;
}

/*Validate Record*/

export function validateRecord(fields) {
    const results = {
        description: validateDescription(fields.description),
        amount: validateAmount(fields.amount),
        category: validateCategory(fields.category),
        date: validateDate(fields.date),
    };

    const errors = {};
    for (const [name, result] of Object.entries(results)) {
        if (!result.valid) errors[name] = result.message;
    }  
    
    
    const warnings = {};
    const dup = checkDuplicate(fields.description);
    if (dup) warnings.description = dup;

    return { valid: Object.keys(errors).length === 0, errors, warnings };
}


        

    
