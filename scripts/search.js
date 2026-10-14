export function compileRegex(input, ignoreCase = true) {
    if (!input) return { re: null, error: null };

    try {
        const flags = ignoreCase ? 'gi' : 'g';
        return { re: new RegExp(input, flags), error: null};
     } catch (err) {
        return { re: null, error: err.message };
     }
    }


    /* 2. Does A Record Match? */

    export function recordMatches(record, re, amountText) {
        if (!re) return true;

        const texts = [
            record.desription,
            record.category,
            record.date,
            amountText,
        ];

        return texts.some((text) => {
            re.lastIndex = 0;
            return re.test(text);
        });
      }

      export function highlightInto(element, text, re) {
        if (!re) {
            element.append(text);
            return;
        }

        let last = 0;
        for (const match of text.matchAll(re)) {
            if (match[0] ==='') continue;

            element.append(text.slice(last, match.index));

            const mark = document.createElement('mark');
            mark.textContent = match[0];
            element.append(mark);

            last = match.index + match[0].length;
        }
        element.append(text.slice(last));
      }