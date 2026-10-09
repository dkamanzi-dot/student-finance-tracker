Accessibility Plan
Landmarks and headings: a header with a nav, one main holding a section per page, and a footer. One h1 (the app name), an h2 per section, h3 below that, no skipped levels.
Skip link: <a href="#main">Skip to content</a> is the first focusable element and becomes visible on focus.
Forms: every input has a <label for>. Errors sit in an element linked with aria-describedby, and invalid fields get aria-invalid="true".
Live regions: form feedback, import/export results and search match counts use role="status". The cap message uses aria-live="polite" while under the cap and switches to aria-live="assertive" (or role="alert") once the cap is exceeded.
Focus: a 3px outline with offset on every link, button and input, never removed. Focus moves to the form heading when editing starts, and back to the row after save or cancel.
Keyboard: Tab and Shift+Tab move through everything, Enter or Space activates buttons, Escape cancels an edit and closes the delete confirmation. Search, sort, add, edit and delete all work without a mouse.
Search highlights: matches are wrapped in <mark>, built with DOM text nodes (not raw innerHTML of user input), so reading order is unchanged and the text stays readable.
Motion: transitions are short (under 300ms) and wrapped in prefers-reduced-motion so they switch off when the user asks.
Palette and contrast

Ratios are approximate. Confirm each pair in the WebAIM Contrast Checker and record the exact numbers in the README.

Body text 
#1a1a1a on 
#ffffff: about 17:1
Muted text 
#595959 on 
#ffffff: about 7:1
Links and buttons 
#0b5cad on 
#ffffff: about 6.7:1
Error text 
#b00020 on 
#ffffff: about 7.3:1
Highlight <mark>, 
#1a1a1a on 
#ffe066: about 13:1

All pairs clear the 4.5:1 minimum for normal text.