/*   storage.js */

import { validateSettingsObject, validateStoredRecord } from './validators.js';


/* ---------- 1. KEYS AND DEFAULTS ---------- */
const RECORDS_KEY = 'sft:records';
const SETTINGS_KEY = 'sft:settings';

export const DEFAULT_SETTINGS = {
  baseCurrency: 'USD',
  currencies: ['USD', 'EUR', 'RWF'],
  rates: { EUR: 0.92, RWF: 1450 },
  displayCurrency: 'USD',
  cap: 500,
  categories: ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'],
};


/* ---------- 2. RECORDS ---------- */

// Returns the saved records, or null when nothing usable is saved.
// null means "first visit or broken data", so the app loads seed.json.
// Records that fail validation are dropped.
export function loadRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (raw === null) return null;

    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return null;

    return data.filter((record) => validateStoredRecord(record).length === 0);
  } catch (err) {
    console.error('Could not read saved records', err);
    return null;
  }
}

// Returns true when saved, false when the browser refused
export function saveRecords(records) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    return true;
  } catch (err) {
    console.error('Could not save records', err);
    return false;
  }
}


/* ---------- 3. SETTINGS ---------- */

// Returns saved settings, or a copy of the defaults if missing or broken
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw === null) return structuredClone(DEFAULT_SETTINGS);

    const data = JSON.parse(raw);
    if (validateSettingsObject(data).length > 0) return structuredClone(DEFAULT_SETTINGS);
    return data;
  } catch (err) {
    console.error('Could not read saved settings', err);
    return structuredClone(DEFAULT_SETTINGS);
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('Could not save settings', err);
    return false;
  }
}


/* ---------- 4. RESET ---------- */
export function clearStored() {
  try {
    localStorage.removeItem(RECORDS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch (err) {
    console.error('Could not clear saved data', err);
  }
}


/* ---------- 5. SEED FILE ---------- */

// Loads the sample records from seed.json (valid ones only)
export async function fetchSeed() {
  try {
    const response = await fetch('seed.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.filter((record) => validateStoredRecord(record).length === 0);
  } catch (err) {
    console.error('Could not load seed.json', err);
    return [];
  }
}


/* ---------- 6. EXPORT ---------- */

// Text for the exported .json file
export function exportJson(records, settings) {
  return JSON.stringify(
    {
      app: 'student-finance-tracker',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      records,
    },
    null,
    2
  );
}