Accessibility Plan
. Landmarks and headings: a header with a nav,one main holding a section per page, and a footer. One h1 (the app name),an h2 per section, h3 below that, no skipped levels.
. Skip link: <a href="#main">Skip to content</a> is the first focusable element and becomes visible on focus.
. Forms: every input has a <label for>.Error sit in an element linked with aria-decribedby, and invalid fields get aria-invalid="true".
. Live regions: form feedback, import/export results and search match counts use role="status". The cap message uses aria-live="polite" while under the cap and switches to aria-live"assertive" (or role="status") once the cap is exceeded.
. Focus: a 3px outline with offset on every link,button and input,never removed. Focus moves to the form heading when editing starts, and back to the row after save or cancel
. keyboard:Tab and Shift+Tab move through everything,Enter or Space activates buttons,Escape cancels and edit and closes the delete confirmation.Search,sort,add,edit and delete all work without a mouse.
. Search highlights: matches are wrapped in <mark>, built with DOM text nodes (not raw innerHTML of user input), so reading order is unchanges and the text stays readable.
. Motions: transtions are short(under 300ms) and wrapped in prefers-reduced-motion so they switch off when the user asks.

### Palette and contrast

Text
-Body text #1a1a1a on #ffffff: 17.40:1
-Body text on panels #1a1a1a on #f2f5f9: 15.92:1
-Muted text #595959 on #ffffff: 7.00:1
-Muted text on panels #595959 on #f2f5f9: 6.41:1
-Links #146c43 on #ffffff: 6.67:1
-Nav links #146c43 on #f2f5f9: 6.10:1
-Button text #ffffff on #0b5cad: 6.67:1
-Delete button text #ffffff on #b00020: 7.33:1
-Error text #b00020 on #ffffff: 7.33:1
-Error text on an edit row #b00020 on #fff8e1: 6.89:1
-Warning text #7a4b00 on #ffffff: 7.41:1
-Search highlight #1a1a1a on #ffe0666: 13.35:1
-Skip link #ffffff on #1a1a1a: 17.40:1

Borders, focus ring and chart
-Input border #6b7785 on #ffffff: 4.56:1
-Focus ring #146c43 on #ffffff: 6.67:1
-Chart bars #146c43 on #f2f5f9: 6.10:1

Checked with a contrast formula (WCAG 2.x). Confirm a few pairs in the WedAIM Contrast Cheacker.
