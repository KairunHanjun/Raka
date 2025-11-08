
// place files you want to import through the `$lib` alias in this folder.
export function toExcelLocalTime(dateStr: string) {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        // Subtract timezone offset so Excel shows correct local time
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date;
    }