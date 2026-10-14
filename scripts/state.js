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

/*  7. Dashboard stats  */
// All amounts here are in the BASE currency.

// Avoids float problems like 0.1 + 0.2 = 0.30000000000000004
function round2(number) {
  return Math.round(number * 100) / 100;
}

// Sum of every record's amount
export function totalAmount(records) {
  return round2(records.reduce((sum, record) => sum + record.amount, 0));
}

// The category with the highest total spent.
// Returns { name, total } or null when there are no records.
export function topCategory(records) {
  if (records.length === 0) return null;

  const totals = {};
  for (const record of records) {
    totals[record.category] = (totals[record.category] || 0) + record.amount;
  }

  let best = null;
  for (const [name, total] of Object.entries(totals)) {
    if (!best || total > best.total) best = { name, total: round2(total) };
  }
  return best;
}

// Builds "YYYY-MM-DD" from local date parts (not toISOString,
// which uses UTC and can shift the day).
function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Returns 7 items, oldest first, ending with today:
// [{ date: "2026-10-05", label: "Mon", total: 12.5 }, ...]
export function trendLastSevenDays(records, today = new Date()) {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = dateKey(day);

    const total = records
      .filter((record) => record.date === key)
      .reduce((sum, record) => sum + record.amount, 0);

    days.push({
      date: key,
      label: day.toLocaleDateString(undefined, { weekday: 'short' }),
      total: round2(total),
    });
  }
  return days;
}

// Returns { state, amount, cap }
// state is "none" (no cap), "under" (cap not exceeded) or "over".
// amount is what is remaining (under) or the overage (over).
export function capStatus(total, cap) {
  if (!cap || cap <= 0) {
    return { state: 'none', amount: 0, cap: 0 };
  }

  const difference = round2(cap - total);

  if (difference >= 0) {
    return { state: 'under', amount: difference, cap };
  }
  return { state: 'over', amount: -difference, cap };
}

// Builds the sentence. fmt turns a base amount into text,
// for example (n) => formatMoney(n, settings).
export function capMessage(status, fmt) {
  if (status.state === 'none') {
    return 'No spending cap set. Add one in Settings.';
  }
  if (status.state === 'under') {
    return `${fmt(status.amount)} remaining of your ${fmt(status.cap)} cap.`;
  }
  return `You are ${fmt(status.amount)} over your ${fmt(status.cap)} cap.`;
}
