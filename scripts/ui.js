/*  1. IMPORTS  */
import {
  validateDescription,
  validateAmount,
  validateCategory,
  validateDate,
  checkDuplicateWords,
  validateRecord,
  normalizeDescription,
} from './validators.js';


import { compileRegex, recordMatches, highlightInto } from './search.js';
import {
  setRecords,
  getRecords,
  getRecord,
  getSettings,
  addRecord,
  updateRecord,
  deleteRecord,
  sortRecords,
  displayNumber,
  currencySymbol,
  formatMoney,
  getRate,
  totalAmount,
  topCategory,
  trendLastSevenDays,
  capStatus,
  capMessage,
} from './state.js';


/*  2. PAGE ELEMENTS  */
const form = document.querySelector('#record-form');
const formStatus = document.querySelector('#form-status');
const clearBtn = document.querySelector('#clear-btn');
const amountCurrency = document.querySelector('#amount-currency');

const searchInput = document.querySelector('#search-input');
const caseBox = document.querySelector('#search-case');
const sortSelect = document.querySelector('#sort-select');
const searchStatus = document.querySelector('#search-status');
const tbody = document.querySelector('#records-body');


// Dashboard elements
const countEl = document.querySelector('#stat-count');
const totalEl = document.querySelector('#stat-total');
const topEl = document.querySelector('#stat-top');
const chartEl = document.querySelector('#trend-chart');
const noteEl = document.querySelector('#display-note');
const capPolite = document.querySelector('#cap-message');   // role="status", polite
const capAlert = document.querySelector('#cap-alert');      // role="alert", assertive

// Cap setting elements
const settingsForm = document.querySelector('#settings-form');
const capInput = document.querySelector('#cap-input');
const capError = document.querySelector('#cap-input-error');
const settingsStatus = document.querySelector('#settings-status');

const fieldNames = ['description', 'amount', 'category', 'date'];

const validators = {
  description: validateDescription,
  amount: validateAmount,
  category: validateCategory,
  date: validateDate,
};

let editingId = null;
let draft = null;


/*  3. FIELD MESSAGES */

function refs(name, editing) {
  if (editing) {
    return {
      input: document.querySelector(`#edit-${name}`),
      errorEl: document.querySelector(`#edit-${name}-error`),
    };
  }
  return { input: form.elements[name], errorEl: document.querySelector(`#${name}-error`) };
}


function wrapperOf(input) {
  return input.closest('.field') || input.closest('td');
}

function showError(name, message, editing = false) {
  const { input, errorEl } = refs(name, editing);
  if (!input) return;
  errorEl.textContent = message;
  errorEl.classList.remove('warning');
  input.setAttribute('aria-invalid', 'true');
  wrapperOf(input).classList.add('field-invalid');
}

function showWarning(name, message, editing = false) {
  const { input, errorEl } = refs(name, editing);
  if (!input) return;
  errorEl.textContent = message;
  errorEl.classList.add('warning');
  input.removeAttribute('aria-invalid');
  wrapperOf(input).classList.remove('field-invalid');
}

function clearError(name, editing = false) {
  const { input, errorEl } = refs(name, editing);
  if (!input) return;
  errorEl.textContent = '';
  errorEl.classList.remove('warning');
  input.removeAttribute('aria-invalid');
  wrapperOf(input).classList.remove('field-invalid');
}


/*  4. VALIDATE FIELDS  */

function validateField(name, editing = false) {
  const value = editing ? draft[name] : form.elements[name].value;
  const result = validators[name](value);

  if (!result.valid) {
    showError(name, result.message, editing);
    return false;
  }


  if (name === 'description') {
    const warning = checkDuplicateWords(value);
    if (warning) {
      showWarning(name, warning, editing);
      return true;
    }
  }

  clearError(name, editing);
  return true;
}


function checkAll(fields, editing) {
  const { valid, errors, warnings } = validateRecord(fields);

  fieldNames.forEach((name) => {
    if (errors[name]) showError(name, errors[name], editing);
    else if (warnings[name]) showWarning(name, warnings[name], editing);
    else clearError(name, editing);
  });

  return { valid, errors };
}

fieldNames.forEach((name) => {
  const input = form.elements[name];
  input.addEventListener('input', () => validateField(name));
  input.addEventListener('change', () => validateField(name));
});

/*  5. CATEGORY DROPDOWNS AND CURRENCY LABEL  */

// Fills a <select> with the categories from Settings.
// A category that is no longer in Settings but is used by a record is kept.
function fillCategorySelect(select, selected, withPlaceholder) {
  const names = [...getSettings().categories];
  if (selected && !names.includes(selected)) names.push(selected);

  select.replaceChildren();

  if (withPlaceholder) {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choose a category';
    select.append(placeholder);
  }

  names.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.append(option);
  });

  select.value = selected || '';
}

// Keeps the Add form in step with Settings
function refreshFormOptions() {
  const select = form.elements.category;
  fillCategorySelect(select, select.value, true);
  amountCurrency.textContent = getSettings().baseCurrency;
}


/*  6. RENDER THE RECORDS TABLE */

function render(extraMessage = '') {
  renderDashboard();
  const settings = getSettings();
  const { re, error } = compileRegex(searchInput.value, caseBox.checked);
  const all = getRecords();

 
  const matching = all.filter(
    (record) =>
      record.id === editingId ||
      recordMatches(record, re, displayNumber(record.amount, settings))
  );
  const visible = sortRecords(matching, sortSelect.value);

  let message;
  if (error) {
    message = `Invalid pattern: ${error}. Showing all records.`;
  } else if (searchInput.value) {
    message = `${visible.length} of ${all.length} records match.`;
  } else {
    message = `${all.length} ${all.length === 1 ? 'record' : 'records'}`;
  }
  searchStatus.textContent = extraMessage + message;

  // Mark the search box invalid when the pattern is broken
  if (error) searchInput.setAttribute('aria-invalid', 'true');
  else searchInput.removeAttribute('aria-invalid');


  tbody.replaceChildren();

  if (visible.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.className = 'empty';
    td.textContent =
      all.length === 0
        ? 'No records yet. Add one using the form below.'
        : 'No records match your search.';
    tr.append(td);
    tbody.append(tr);
    return;
  }

  visible.forEach((record) => {
    tbody.append(
      record.id === editingId ? buildEditRow(record, settings) : buildRow(record, re, settings)
    );
  });
}


function buildCell(label) {
  const td = document.createElement('td');
  td.dataset.label = label;
  return td;
}


function buildButton(text, action, record, className, ariaLabel) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = text;
  button.dataset.action = action;
  button.dataset.id = record.id;
  button.setAttribute('aria-label', ariaLabel);
  return button;
}

function buildRow(record, re, settings) {
  const tr = document.createElement('tr');

  const descCell = buildCell('Description');
  highlightInto(descCell, record.description, re);

  const catCell = buildCell('Category');
  highlightInto(catCell, record.category, re);

  const dateCell = buildCell('Date');
  highlightInto(dateCell, record.date, re);

  const amountCell = buildCell('Amount');
  amountCell.append(currencySymbol(settings));
  highlightInto(amountCell, displayNumber(record.amount, settings), re);

  const actionsCell = buildCell('Actions');
  actionsCell.classList.add('actions');
  actionsCell.append(
    buildButton('Edit', 'edit', record, 'btn btn-small', `Edit ${record.description}`),
    buildButton('Delete', 'delete', record, 'btn btn-small btn-danger', `Delete ${record.description}`)
  );

  tr.append(descCell, catCell, dateCell, amountCell, actionsCell);
  return tr;
}

/*  7. INLINE EDIT
    The Edit button turns the row into inputs. Enter saves, Escape cancels.  */

// A row made of inputs
function buildEditRow(record, settings) {
  const tr = document.createElement('tr');
  tr.className = 'editing';
  tr.dataset.id = record.id;

  const labels = {
    description: 'Description',
    category: 'Category',
    date: 'Date',
    amount: `Amount (${settings.baseCurrency})`,
  };

  ['description', 'category', 'date', 'amount'].forEach((name) => {
    const td = buildCell(labels[name]);

    let input;
    if (name === 'category') {
      input = document.createElement('select');
      fillCategorySelect(input, draft.category, true);
    } else {
      input = document.createElement('input');
      input.type = name === 'date' ? 'date' : 'text';
      if (name === 'amount') input.inputMode = 'decimal';
      input.value = draft[name];
    }

    input.id = `edit-${name}`;
    input.setAttribute('aria-label', labels[name]);
    input.setAttribute('aria-describedby', `edit-${name}-error`);

    const errorEl = document.createElement('p');
    errorEl.className = 'error';
    errorEl.id = `edit-${name}-error`;

    // Keep the draft up to date and check as the user types
    const onInput = () => {
      draft[name] = input.value;
      validateField(name, true);
    };
    input.addEventListener('input', onInput);
    input.addEventListener('change', onInput);

    // Keyboard: Enter saves, Escape cancels
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        saveEdit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelEdit();
      }
    });

    td.append(input, errorEl);
    tr.append(td);
  });

  const actionsCell = buildCell('Actions');
  actionsCell.classList.add('actions');
  actionsCell.append(
    buildButton('Save', 'save', record, 'btn btn-small', `Save changes to ${record.description}`),
    buildButton('Cancel', 'cancel', record, 'btn btn-small btn-secondary', `Cancel editing ${record.description}`)
  );
  tr.append(actionsCell);

  return tr;
}

function startEdit(record) {
  editingId = record.id;
  draft = {
    description: record.description,
    amount: String(record.amount),
    category: record.category,
    date: record.date,
  };
  render(`Editing "${record.description}". Press Enter to save or Escape to cancel. `);
  document.querySelector('#edit-description')?.focus();
}

function saveEdit() {
  const { valid, errors } = checkAll(draft, true);

  if (!valid) {
    const count = Object.keys(errors).length;
    searchStatus.textContent =
      count === 1 ? 'There is 1 error. Fix it and save again.' : `There are ${count} errors. Fix them and save again.`;
    const firstBad = fieldNames.find((name) => errors[name]);
    document.querySelector(`#edit-${firstBad}`).focus();
    return;
  }

  const id = editingId;
  const data = {
    description: normalizeDescription(draft.description),
    amount: Number(draft.amount),
    category: draft.category,
    date: draft.date,
  };

  updateRecord(id, data);
  editingId = null;
  draft = null;
  render(`Updated "${data.description}". `);
  tbody.querySelector(`button[data-action="edit"][data-id="${id}"]`)?.focus();
}

function cancelEdit() {
  const id = editingId;
  editingId = null;
  draft = null;
  render('Edit cancelled. ');
  tbody.querySelector(`button[data-action="edit"][data-id="${id}"]`)?.focus();
}


/*  8. ADD FORM  */
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const fields = {
    description: form.elements.description.value,
    amount: form.elements.amount.value,
    category: form.elements.category.value,
    date: form.elements.date.value,
  };

  const { valid, errors } = checkAll(fields, false);

  if (!valid) {
    const errorCount = Object.keys(errors).length;
    formStatus.textContent =
      errorCount === 1
        ? 'There is 1 error. Fix it and save again.'
        : `There are ${errorCount} errors. Fix them and save again.`;

    // Move keyboard focus to the first field with an error
    const firstBad = fieldNames.find((name) => errors[name]);
    form.elements[firstBad].focus();
    return;
  }

  // Valid: build clean data (double spaces collapsed, amount as a number)
  const data = {
    description: normalizeDescription(fields.description),
    amount: Number(fields.amount),
    category: fields.category,
    date: fields.date,
  };

  addRecord(data);
  form.reset();
  fieldNames.forEach((name) => clearError(name));
  formStatus.textContent = `Added "${data.description}".`;
  render();
});

clearBtn.addEventListener('click', () => {
  form.reset();
  fieldNames.forEach((name) => clearError(name));
  formStatus.textContent = '';
});


/*  9. TABLE BUTTONS
    One listener on the table body handles every button.  */
tbody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  const record = getRecord(button.dataset.id);
  if (!record) return;

  if (action === 'edit') startEdit(record);
  if (action === 'save') saveEdit();
  if (action === 'cancel') cancelEdit();

  if (action === 'delete') {
    if (confirm(`Delete "${record.description}"?`)) {
      // If you delete the row you are editing, stop editing
      if (editingId === record.id) {
        editingId = null;
        draft = null;
      }
      deleteRecord(record.id);
      render(`Deleted "${record.description}". `);
      searchInput.focus();
    }
  }
});

/*  10. SEARCH AND SORT CONTROLS  */
searchInput.addEventListener('input', () => render());
caseBox.addEventListener('change', () => render());
sortSelect.addEventListener('change', () => render());

/*  11. DASHBOARD
    Stat boxes, 7-day chart and the cap message.  */

// Remember the last chart so it only redraws when the data changes
let lastChartKey = '';

/* --- stat boxes --- */
function renderStats(records, total, settings) {
  countEl.textContent = records.length;
  totalEl.textContent = formatMoney(total, settings);

  const top = topCategory(records);
  topEl.textContent = top ? `${top.name} (${formatMoney(top.total, settings)})` : 'None yet';

  noteEl.textContent =
    settings.displayCurrency === settings.baseCurrency
      ? `Amounts are shown in ${settings.displayCurrency}.`
      : `Amounts are shown in ${settings.displayCurrency}. They are stored in ${settings.baseCurrency}.`;
}


/* --- 7-day chart --- */
function renderChart(records, settings) {
  const trend = trendLastSevenDays(records);

  // Skip the redraw if nothing changed (keeps the animation calm)
  const key = JSON.stringify({
    trend,
    code: settings.displayCurrency,
    rate: getRate(settings, settings.displayCurrency),
  });
  if (key === lastChartKey) return;
  lastChartKey = key;

  // The chart is role="img", so the numbers go in its label for screen readers
  const summary = trend.map((d) => `${d.label} ${formatMoney(d.total, settings)}`).join(', ');
  chartEl.setAttribute('aria-label', `Spending for the last 7 days: ${summary}.`);

  chartEl.replaceChildren();
  const max = Math.max(...trend.map((d) => d.total));

  trend.forEach((day) => {
    const col = document.createElement('div');
    col.className = 'bar-col';
    col.title = `${day.label}: ${formatMoney(day.total, settings)}`;

    const amount = document.createElement('span');
    amount.className = 'bar-amount';
    amount.textContent = day.total > 0 ? formatMoney(day.total, settings) : '';

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.setProperty('--ratio', '0');   // start empty, then grow

    const label = document.createElement('span');
    label.className = 'bar-day';
    label.textContent = day.label;

    col.append(amount, bar, label);
    chartEl.append(col);

    // Next frame: set the real height so the bar animates up
    const ratio = max > 0 ? day.total / max : 0;
    requestAnimationFrame(() => bar.style.setProperty('--ratio', String(ratio)));
  });
}


/* --- cap message ---
   Under the cap  -> polite region (waits for the user to pause)
   Over the cap   -> assertive region (interrupts right away)
   Text is only changed when it is different, so screen readers
   are not spammed with repeats. */
function setText(element, text) {
  if (element.textContent !== text) element.textContent = text;
}

function renderCap(total, settings) {
  const status = capStatus(total, settings.cap);
  const message = capMessage(status, (amount) => formatMoney(amount, settings));

  if (status.state === 'over') {
    setText(capAlert, message);
    setText(capPolite, '');
  } else {
    setText(capPolite, message);
    setText(capAlert, '');
  }
}


/* --- draw the whole dashboard --- */
function renderDashboard() {
  const records = getRecords();
  const settings = getSettings();
  const total = totalAmount(records);

  renderStats(records, total, settings);
  renderChart(records, settings);
  renderCap(total, settings);
}


/*  12. CAP SETTING
    For now "Save settings" only saves the cap.
    Currency, rates and categories are added in a later milestone.  */
settingsForm.addEventListener('submit', (event) => {
  event.preventDefault();   // stop the page from reloading

  const value = capInput.value.trim();
  const result = validateAmount(value);   // same number rule as the amount field

  if (!result.valid) {
    capError.textContent = result.message;
    capInput.setAttribute('aria-invalid', 'true');
    capInput.closest('.field').classList.add('field-invalid');
    settingsStatus.textContent = 'Fix the cap and save again.';
    capInput.focus();
    return;
  }

  // Valid: clear the error, save, update the dashboard
  capError.textContent = '';
  capInput.removeAttribute('aria-invalid');
  capInput.closest('.field').classList.remove('field-invalid');

  setSettings({ cap: Number(value) });
  settingsStatus.textContent =
    Number(value) === 0 ? 'Cap removed.' : `Cap saved: ${formatMoney(Number(value), getSettings())}.`;
  renderDashboard();
});


/*  13. START THE APP */

async function init() {
  try {
    const response = await fetch('seed.json');
    setRecords(await response.json());
  } catch (err) {
    console.error('Could not load seed.json', err);
    setRecords([]);
  }

  refreshFormOptions();
  capInput.value = String(getSettings().cap)
  render();
}

init();