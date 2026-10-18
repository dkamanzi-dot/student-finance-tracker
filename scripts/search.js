
/* SAFE REGEX COMPILER */
export function compileRegex(input, ignoreCase = true) {
    if (!input) return { re: null, error: null};

    try{
        const flags = ignoreCase ? 'gi' : 'g';
        return { re: new RegExp(input, flags), error: null };
    }catch (err) {
        return { re: null, error: err.message };
    }
}


/* DOES A RECORD MATCH? */

export function recordMatches(record, re, amountText) {
    if (!re) return true;

    const texts = [record.description, record.category, record.date, amountText];

    return texts.some((text) => {
        re.lastIndex = 0;
        return re.text(text);
    });
}


/* SAFE HIGHLIGHT */

export function highlightInto(element, text, re) {
    if (!re) {
        element.append(text);
        return;
    }

    let last = 0;
    for (const match of text.matchALL(re)) {
        if (match[0] === '') continue;

        element.append(text.slice(last, match.index));

        const mark = document.createElement('mark');
        mark.textContent = match[0];
        element.append(mark);

        last = match.index + match[0].length;
    }
    element.append(text.slice(last));
}