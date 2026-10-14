/*The REGEX Patterns*/

export const patterns = {
    description: /^\S(?:.*\S)?$/,
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    date:/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWord: /\b(\w+)\s+\1\b/i,
    currencycode: /^[A-Z]{3}$/,
    rate: /^(?!0+(?:\.0+)?$)\d+(?:\.\d{1,6})?$/,
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


/*  Settings validators  */

export function validateCurrencyCode(value) {
  if (value === '') {
    return { valid: false, message: 'Enter a currency code.' };
  }
  if (!patterns.currencyCode.test(value)) {
    return { valid: false, message: 'Use exactly 3 capital letters, like USD.' };
  }
  return { valid: true };
}

export function validateRate(value) {
  if (value === '') {
    return { valid: false, message: 'Enter an exchange rate.' };
  }
  if (!patterns.rate.test(value)) {
    return {
      valid: false,
      message: 'Use a number above 0, like 0.92 (up to 6 decimals).',
    };
  }
  return { valid: true };
}

// Text like "Food, Books, Fast-food" -> { valid: true, list: [...] }
export function validateCategoriesText(text) {
  const list = [];
  const seen = new Set();

  for (const part of text.split(',')) {
    const name = part.trim().replace(/\s{2,}/g, ' ');
    if (name === '') continue;

    if (!patterns.category.test(name)) {
      return {
        valid: false,
        message: `"${name}" is not allowed. Use letters, spaces and hyphens only.`,
      };
    }

    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      list.push(name);
    }
  }

  if (list.length === 0) {
    return { valid: false, message: 'Enter at least one category.' };
  }
  return { valid: true, list };
}

/*  Stored data checks
    Used when loading from localStorage and when importing JSON.
    They return a list of problems. An empty list means the data is fine.  */

// Checks one record object
export function validateStoredRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return ['is not an object'];
  }

  const problems = [];

  if (typeof record.id !== 'string' || record.id.trim() === '') {
    problems.push('needs an id');
  }
  if (typeof record.description !== 'string' || !validateDescription(record.description).valid) {
    problems.push('has an invalid description');
  }
  if (
    typeof record.amount !== 'number' ||
    !Number.isFinite(record.amount) ||
    !validateAmount(String(record.amount)).valid
  ) {
    problems.push('has an invalid amount');
  }
  if (typeof record.category !== 'string' || !validateCategory(record.category).valid) {
    problems.push('has an invalid category');
  }
  if (typeof record.date !== 'string' || !validateDate(record.date).valid) {
    problems.push('has an invalid date');
  }
  for (const key of ['createdAt', 'updatedAt']) {
    if (typeof record[key] !== 'string' || Number.isNaN(Date.parse(record[key]))) {
      problems.push(`has an invalid ${key}`);
    }
  }

  return problems;
}

// Checks the settings object
export function validateSettingsObject(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return ['settings must be an object'];
  }

  const problems = [];
  const currencies = settings.currencies;

  if (typeof settings.baseCurrency !== 'string' || !patterns.currencyCode.test(settings.baseCurrency)) {
    problems.push('baseCurrency must be a 3-letter code like USD');
  }

  const currenciesOk =
    Array.isArray(currencies) &&
    currencies.length === 3 &&
    currencies.every((c) => typeof c === 'string' && patterns.currencyCode.test(c)) &&
    new Set(currencies).size === 3 &&
    currencies[0] === settings.baseCurrency;

  if (!currenciesOk) {
    problems.push('currencies must be 3 different codes, starting with the base currency');
  } else if (!settings.rates || typeof settings.rates !== 'object') {
    problems.push('rates are missing');
  } else {
    for (const code of currencies.slice(1)) {
      const rate = settings.rates[code];
      if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
        problems.push(`the rate for ${code} must be a number above 0`);
      }
    }
  }

  if (!currenciesOk || !currencies.includes(settings.displayCurrency)) {
    problems.push('displayCurrency must be one of the currencies');
  }

  if (typeof settings.cap !== 'number' || !Number.isFinite(settings.cap) || settings.cap < 0) {
    problems.push('cap must be a number, 0 or more');
  }

  if (
    !Array.isArray(settings.categories) ||
    settings.categories.length === 0 ||
    settings.categories.some((c) => typeof c !== 'string' || !patterns.category.test(c))
  ) {
    problems.push('categories must be a list of valid category names');
  }

  return problems;
}

export function validateImportData(data) {
  let records;
  let settings = null;

  if (Array.isArray(data)) {
    records = data;
  } else if (data && typeof data === 'object' && Array.isArray(data.records)) {
    records = data.records;
    settings = data.settings ?? null;
  } else {
    return {
      valid: false,
      errors: ['The file must be a list of records, or an object with a "records" list.'],
    };
  }

  const errors = [];
  const seenIds = new Set();

  records.forEach((record, index) => {
    const problems = validateStoredRecord(record);
    if (problems.length > 0) {
      errors.push(`Record ${index + 1} ${problems.join(', ')}.`);
    }
    if (record && typeof record.id === 'string') {
      if (seenIds.has(record.id)) errors.push(`Record ${index + 1} repeats the id "${record.id}".`);
      seenIds.add(record.id);
    }
  });

  if (settings !== null) {
    validateSettingsObject(settings).forEach((problem) => errors.push(`Settings: ${problem}.`));
  }

  return { valid: errors.length === 0, errors, records, settings };
}


        

    
