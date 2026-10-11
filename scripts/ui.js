
import {
  validateDescription,
  validateAmount,
  validateCategory,
  validateDate,
  checkDuplicateWords,
  validateRecord,
} from './validators.js';


/* ---------- 1. GRAB THE ELEMENTS ---------- */
const form = document.querySelector('#record-form');
const formStatus = document.querySelector('#form-status');
const cancelBtn = document.querySelector('#cancel-edit');

const fieldNames = ['description', 'amount', 'category', 'date'];

const validators = {
  description: validateDescription,
  amount: validateAmount,
  category: validateCategory,
  date: validateDate,
};


/* ---------- 2. SHOW AND CLEAR MESSAGES ---------- */

function showError(name, message) {
  const input = form.elements[name];
  const errorEl = document.querySelector(`#${name}-error`);

  errorEl.textContent = message;
  errorEl.classList.remove('warning');
  input.setAttribute('aria-invalid', 'true');
  input.closest('.field').classList.add('field-invalid');
}

function showWarning(name, message) {
  const input = form.elements[name];
  const errorEl = document.querySelector(`#${name}-error`);

  errorEl.textContent = message;
  errorEl.classList.add('warning');
  input.removeAttribute('aria-invalid');
  input.closest('.field').classList.remove('field-invalid');
}

function clearError(name) {
  const input = form.elements[name];
  const errorEl = document.querySelector(`#${name}-error`);

  errorEl.textContent = '';
  errorEl.classList.remove('warning');
  input.removeAttribute('aria-invalid');
  input.closest('.field').classList.remove('field-invalid');
}


/* ---------- 3. VALIDATE ONE FIELD (live feedback) ---------- */
function validateField(name) {
  const value = form.elements[name].value;
  const result = validators[name](value);

  if (!result.valid) {
    showError(name, result.message);
    return false;
  }

  if (name === 'description') {
    const warning = checkDuplicateWords(value);
    if (warning) {
      showWarning(name, warning);
      return true;
    }
  }

  clearError(name);
  return true;
}

fieldNames.forEach((name) => {
  const input = form.elements[name];
  input.addEventListener('input', () => validateField(name));
  input.addEventListener('change', () => validateField(name));
});


/* ---------- 4. SUBMIT ---------- */
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const fields = {
    description: form.elements.description.value,
    amount: form.elements.amount.value,
    category: form.elements.category.value,
    date: form.elements.date.value,
  };

  const { valid, errors, warnings } = validateRecord(fields);

  fieldNames.forEach((name) => {
    if (errors[name]) showError(name, errors[name]);
    else if (warnings[name]) showWarning(name, warnings[name]);
    else clearError(name);
  });

  if (!valid) {
    const errorCount = Object.keys(errors).length;
    formStatus.textContent =
      errorCount === 1
        ? 'There is 1 error. Fix it and save again.'
        : `There are ${errorCount} errors. Fix them and save again.`;

    const firstBad = fieldNames.find((name) => errors[name]);
    form.elements[firstBad].focus();
    return;
  }

  formStatus.textContent = 'All fields are valid. Saving comes in a later step.';
});


   /* ---------- 5. CANCEL ---------- */
cancelBtn.addEventListener('click', () => {
  form.reset();
  fieldNames.forEach(clearError);
  formStatus.textContent = '';
});