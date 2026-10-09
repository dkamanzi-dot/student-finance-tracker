Student Finance Tracker: Spec (M1)

Student Finance Tracker is a vanilla HTML, CSS and JavaScript app where a student logs spending, searches it with regex and stays under a spending cap. It is deployed on GitHub Pages and saves everything in localStorage.

1. Purpose and pages

The app helps a student see where money goes, find transactions fast, and stay under a cap. It is a single-page app with five sections reached from one nav bar.

About: purpose of the app and contact details (GitHub, email).
Dashboard: total records, total spent, top category, last-7-days chart, and the cap message (remaining or overage).
Records: all transactions as a table on desktop and cards on mobile. The user can sort, regex-search, edit inline and delete with confirmation.
Add/Edit Form: description, amount, category and date fields with inline error messages.
Settings: base currency, two other currencies, manual exchange rates, spending cap, editable categories, and JSON import/export.
2. Data model

Every amount is stored in the base currency and converted only for display. Records and settings are stored under separate localStorage keys.

Transaction record

Stored as an array under the key sft:records.

id (string): txn_ plus a 4-digit number, unique
description (string): no leading or trailing spaces
amount (number): in the base currency, up to 2 decimals
category (string): letters, spaces and hyphens only
date (string): YYYY-MM-DD
createdAt (string): ISO timestamp, set once
updatedAt (string): ISO timestamp, refreshed on every edit
json
{
  "id": "txn_0001",
  "description": "Lunch at cafeteria",
  "amount": 12.5,
  "category": "Food",
  "date": "2025-09-25",
  "createdAt": "2025-09-25T12:30:00.000Z",
  "updatedAt": "2025-09-25T12:30:00.000Z"
}
Settings object

Stored under the key sft:settings.

json
{
  "baseCurrency": "USD",
  "currencies": ["USD", "EUR", "RWF"],
  "rates": { "EUR": 0.92, "RWF": 1450 },
  "cap": 300,
  "categories": ["Food", "Books", "Transport", "Entertainment", "Fees", "Other"]
}
Decisions
Ids: the next id is the highest existing number plus 1, computed on load. After deleting the highest id the number is reused, which is safe because the old record is gone.
Currency: amounts are stored in the base currency. A rate means 1 base unit equals N units of that currency. Rates are edited manually in Settings.
Cap: compared against the total of all records, in the base currency.
3. Regex rules

Five rules validate the form, one of them advanced. These examples become the test cases in tests.html.

Description (no leading or trailing spaces): /^\S(?:.*\S)?$/
Valid: Lunch at cafeteria
Invalid:  Lunch (leading space), Lunch  (trailing space)
Amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/
Valid: 12.50, 0, 89.99
Invalid: 012, 12.345, -5, abc
Date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
Valid: 2025-09-29
Invalid: 2025-13-01, 2025-9-5, 29/09/2025
Category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/
Valid: Food, Fast-food, Study Supplies
Invalid: Food2, -Food, Food--Bar
Advanced, duplicate word (back-reference): /\b(\w+)\s+\1\b/i
No warning: Coffee with friends
Warning shown: coffee coffee

The duplicate-word rule shows a warning, not a blocking error, because text like "that that" can be legitimate. Double spaces in descriptions are collapsed with .replace(/\s{2,}/g, ' ') before validation.

Search examples for the Records search box:

Cents present: /\.\d{2}\b/
Beverage keyword: /(coffee|tea)/i
Duplicate word: /\b(\w+)\s+\1\b/
4. Wireframes

Text sketches of each layout. Redraw them in Figma, Excalidraw or on paper and save the images to assets/wireframes/.

Mobile (360px): Records as cards
[Skip to content]
+--------------------------+
| Finance Tracker   [Menu] |
+--------------------------+
| Search: [regex...] [Aa]  |
| Sort: [Date v] [Asc/Desc]|
| (status message)         |
+--------------------------+
| Lunch at cafeteria       |
| Food - 2025-09-25        |
| $12.50      [Edit][Del]  |
+--------------------------+
| Chemistry textbook  ...  |
+--------------------------+
Desktop (1024px): Records as table
[Skip to content]
+--------------------------------------------------------------+
| Finance Tracker | About | Dashboard | Records | Add | Settings |
+--------------------------------------------------------------+
| Search: [regex.............] [Aa]   Sort: [Date v] [Asc/Desc]  |
| (status message: "12 matches")                                |
+--------------------------------------------------------------+
| Description        | Category | Date       | Amount | Actions  |
| Lunch at cafeteria | Food     | 2025-09-25 | 12.50  | Edit Del |
| Chemistry textbook | Books    | 2025-09-23 | 89.99  | Edit Del |
+--------------------------------------------------------------+
Dashboard
+----------+----------+----------+
| Records  | Total    | Top      |
|   24     | $410.20  | Food     |
+----------+----------+----------+
| Last 7 days:  ||  | ||| ||     |
+--------------------------------+
| Cap $500: $89.80 remaining     |   <- aria-live (polite / assertive)
+--------------------------------+
Form and Settings
Add transaction                 Settings
Description [..............]    Base currency   [USD v]
  (inline error)                Other currencies [EUR][RWF]
Amount      [......]            Rates  EUR [0.92]  RWF [1450]
Category    [Food v]            Spending cap    [500]
Date        [YYYY-MM-DD]        Categories      [edit list]
[Save] [Cancel]                 [Export JSON] [Import JSON]
(role=status feedback)          (role=status feedback)

Navigation sits at the top on desktop and collapses behind a menu button on mobile. Live message areas are the search status, the form feedback, the cap message, and the import/export feedback.