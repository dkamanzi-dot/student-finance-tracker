/* 1. The Data */
let records = [];
let nextNumber = 1;


/* Settings */
let settings = {
    baseCurrency: 'USD',
    currencies: ['USD', 'EUR', 'RWF'],
    rates: { EUR: 0.92, RWF: 1450},
    displayCurrency: 'USD',
    cap: 500,
    categories: ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other']
};

export function getSettings() {
    return settings;
}

export function setSettings(changes) {
    settings = { ...settings, ...changes };
}


/* 2. Load A List */
export function setRecords(list) {
  records = list;

    const numbers = records.map((r) => {
        const match = /^txn_(\d+)$/.exec(r.id);
        return match ? Number(match[1]) : 0;
    });
    nextNumber = Math.max(0, ...numbers) +1;
}



    /* 3. Read */
    export function getRecords() {
        return records;
    }
    export function getRecord(id) {
        return records.find((r) => r.id === id);
    }


    /* 4. Add, Update, Delect */

    function makeID() {
        const id = 'txn_' + String(nextNumber).padStart(4, '0');
        nextNumber +=1;
        return id;
    }

    export function addRecord(data) {
        const now = new Date().toISOString();
        const record = {
            id: makeID(),
            description: data.description,
            amount: data.amount,
            category: data.category,
            date: data.date,
            createdAt: now,
            updatedAt: now,
        };
        records.push(record);
        return record;
    }

    export function updateRecord(id, changes) {
        const record = getRecord(id);
        if (!record) return null;

        record.description = changes.description;
        record.amount = changes.amount;
        record.category = changes.category;
        record.date = changes.date;
        record.updatedAt = new Date().toISOString();
        return record;
        }

        export function deleteRecord(id) {
            records = records.filter((r) => r.id !== id);
        }


        /*  5. Sort */

    export function sortRecords(list, sortValue) {
        const [key, direction] = sortValue.split('-');
        const factor = direction === 'asc' ? 1 : -1;

        return [...list].sort((a, b) => {
            if (key === 'amount') {
                return (a.amount - b.amount) * factor;
            }
            if (key === 'description') {
                return (
                    a.description.localeCompare(b.description, undefined, {sensitivity:'base'}) * factor
                );
            }

            return a.date.localeCompare(b.date) *factor;
        });
    }

    /*  6. Currency  */
// Amounts are stored in the base currency and only converted when shown.
// A rate means 1 base unit = N units of that currency.

const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', RWF: 'RWF ' };

// Rate for a currency code. The base currency is always 1.
export function getRate(settings, code) {
  if (code === settings.baseCurrency) return 1;
  const rate = settings.rates[code];
  return typeof rate === 'number' && rate > 0 ? rate : 1;
}

// Base amount -> amount in the display currency (a number)
export function convert(amountBase, settings, code = settings.displayCurrency) {
  return amountBase * getRate(settings, code);
}

// The symbol (or code) shown before numbers: "$", "€", "RWF "
export function currencySymbol(settings) {
  const code = settings.displayCurrency;
  return SYMBOLS[code] ?? `${code} `;
}

// Number only, 2 decimals: "18125.00"
export function displayNumber(amountBase, settings) {
  return convert(amountBase, settings).toFixed(2);
}

// Symbol + number: "$12.50"
export function formatMoney(amountBase, settings) {
  return currencySymbol(settings) + displayNumber(amountBase, settings);
}
