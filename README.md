# Student Finance Tracker

A responsive, accessible finance tracker for students, built with plain HTML, CSS and JavaScript (no frameworks). Log transactions, search them with regular expressions, see simple stats, and stay under a spending cap. Everything is saved in your browser.

- **Theme:** Student Finance Tracker
- **Live site (GitHub Pages):** https://dkamanzi-dot.github.io/student-finance-tracker/
- **Demo video (unlisted):** https://www.loom.com/share/b593e9b46f3346d594af525336e503ec
- **Author:** Kamanzi Daniel Kenny, [github.com/dkamanzi-dot](https://github.com/dkamanzi-dot), d.kamanzi@alustudent.com

## Features

- **Five sections:** About, Dashboard, Records, Add form and Settings.
- **Records table:** a table on desktop, cards on phones. Sort by date, description (A to Z or Z to A) and amount (low to high or high to low).
- **Regex search:** type a pattern, matches are highlighted with `<mark>`, with an ignore-case toggle. A broken pattern never crashes the page and shows a message instead.
- **Add form:** every field is validated with regex and shows inline errors as you type.
- **Inline edit:** press Edit on a row to edit it in place. Enter saves, Escape cancels. `updatedAt` is refreshed on every edit.
- **Delete with confirmation.**
- **Dashboard:** total records, total spent, top category (by amount), a last-7-days bar chart (CSS and JavaScript), and a spending cap message.
- **Cap:** the message is announced politely while under the cap and assertively once it is exceeded.
- **Currency:** a base currency plus two others, with manual rates in Settings (no API). Amounts are stored in the base currency and converted only for display.
- **Categories:** editable in Settings. Defaults are Food, Books, Transport, Entertainment, Fees and Other.
- **Persistence:** all changes are saved to `localStorage` automatically. Broken saved data is skipped and never crashes the app.
- **JSON export and import:** the file is validated before anything is loaded. A bad file is rejected with a clear message and your data is left untouched.
- **Reset to sample data** from `seed.json` (14 records with edge dates, tiny and huge amounts, and tricky strings).

## Regex catalog

1. **Description (no leading or trailing spaces):** `/^\S(?:.*\S)?$/`
   - Valid: `Lunch at cafeteria`
   - Invalid: ` Lunch`, `Lunch `
2. **Amount:** `/^(0|[1-9]\d*)(\.\d{1,2})?$/`
   - Valid: `12.50`, `0`, `89.99`
   - Invalid: `012`, `12.345`, `-5`
3. **Date:** `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`
   - Valid: `2025-09-29`
   - Invalid: `2025-13-01`, `2025-9-5`
4. **Category:** `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`
   - Valid: `Food`, `Fast-food`
   - Invalid: `Food2`, `-Food`, `Food--Bar`
5. **Advanced: duplicate word (back-reference):** `/\b(\w+)\s+\1\b/i`
   - Warning shown: `coffee coffee`
   - No warning: `Coffee with friends`
6. **Currency code:** `/^[A-Z]{3}$/`
   - Valid: `USD`, `RWF`
   - Invalid: `usd`, `US`
7. **Advanced: exchange rate (negative lookahead):** `/^(?!0+(?:\.0+)?$)\d+(?:\.\d{1,6})?$/`
   - Valid: `0.92`, `1450`
   - Invalid: `0`, `0.00`, `-1`

The date rule also checks that the date really exists, so `2025-02-30` is rejected even though it matches the pattern. Double spaces in descriptions are collapsed before the description rule runs.

**Search examples** to try in the Records search box:

- `\.\d{2}\b` finds amounts with cents
- `(coffee|tea)` finds drinks
- `\b(\w+)\s+\1\b` finds a repeated word, such as "Coffee coffee run"
- `^Bus` finds descriptions that start with "Bus"
- `(` is a broken pattern and shows a message instead of crashing

## Keyboard map

- **Tab / Shift+Tab:** move forward and backward through links, fields and buttons
- **Skip link:** the first Tab stop on the page, press Enter to jump to the main content
- **Enter** (in a form field): submit the form
- **Enter** (on a button or link): activate it
- **Space:** activate a button, tick the "Ignore case" box
- **Arrow keys:** change the value of a dropdown
- **Enter** (in an edit row): save the row
- **Escape** (in an edit row): cancel the edit
- After saving or cancelling an edit, focus returns to that row's Edit button. After deleting, focus moves to the search box.

## Accessibility notes

- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`), one `h1`, and no skipped heading levels. Each section is a named landmark through `aria-labelledby`.
- Skip-to-content link, and a visible 3px focus ring on every interactive element.
- Every input has a bound `<label>`. Errors are linked with `aria-describedby`, and invalid fields get `aria-invalid="true"`.
- Live regions: `role="status"` for form feedback, search results, settings and import/export messages. For the cap there are two regions: a polite one (under the cap) and an assertive `role="alert"` one (over the cap). Only one has text at a time.
- Search highlights use real `<mark>` elements built from text nodes, so reading order does not change and HTML in a description cannot run as code.
- The chart is `role="img"` and its label lists the amount for each day.
- Edit and Delete buttons have `aria-label`s that name the record.
- Colour palette checked against the 4.5:1 contrast minimum (see `docs/a11y-plan.md`).
- Transitions are switched off for people who prefer reduced motion.
- Known limit: on phones, table rows are shown as cards with `display: block`, which some screen readers treat as a list instead of a table.
- - Lighthouse accessibility score: 100 on desktop and 100 on mobile, plus an axe-core automated check with 0 violations.

## Responsive design

Mobile-first CSS with breakpoints at about 360px (default styles), 768px and 1024px. Layout uses Flexbox. The chart bars and the nav links animate with CSS transitions.

## Project structure

```
index.html          the app
tests.html          browser tests
seed.json           14 sample records
styles/main.css     all styles
scripts/
  ui.js             page: render, forms, inline edit, dashboard, settings, backup
  state.js          records and settings in memory, sorting, currency, stats
  storage.js        localStorage, seed loading, JSON export
  validators.js     all regex rules and data checks
  search.js         safe regex compiler, matcher, highlighter
docs/
  spec.md           spec, data model, wireframes
  a11y-plan.md      accessibility plan
```

## Data model

```json
{
  "id": "txn_0001",
  "description": "Lunch at cafeteria",
  "amount": 12.5,
  "category": "Food",
  "date": "2025-09-25",
  "createdAt": "2025-09-25T12:30:00.000Z",
  "updatedAt": "2025-09-25T12:30:00.000Z"
}
```

Saved under the localStorage keys `sft:records` and `sft:settings`.

An export file looks like `{ "app", "version", "exportedAt", "settings", "records" }`. Importing also accepts a plain list of records, like `seed.json`.

## How to run

Browsers block JavaScript modules on `file://` pages, so use a local server:

1. Open the folder in VS Code and run the **Live Server** extension, or run `python -m http.server 8000` in the folder.
2. Open `http://localhost:8000` (or the Live Server address).

## How to run the tests

Open `tests.html` through the same local server. The summary at the top should read `0 failed`. The tests cover every regex rule (valid and invalid examples), import validation, stats and cap logic, currency conversion and the safe regex compiler.

## Notes

- The seed records are dated around early October 2026, so the last-7-days chart is empty for later dates. Add a few transactions dated this week to see it.
- Changing the base currency code only renames it. Stored amounts are not converted.
- Credits: the safe regex compiler and highlight idea are adapted from the starter snippets in the assignment brief, and the regex patterns follow the brief's examples. Contrast ratios use the WCAG 2.x formula. All other code is my own.
