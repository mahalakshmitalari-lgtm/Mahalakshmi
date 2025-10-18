// Function to convert an array of objects to a CSV string.
// It handles nested data, proper quoting, and escaping of double quotes.
export const convertToCSV = (data: any[], headers: { key: string; label: string }[]): string => {
    const headerRow = headers.map(h => `"${h.label}"`).join(',');
    const rows = data.map(row => {
        return headers.map(header => {
            let cellData = row[header.key];
            if (cellData === null || cellData === undefined) {
                cellData = '';
            }
            // Escape double quotes by doubling them, and wrap the entire cell in double quotes.
            const escapedData = String(cellData).replace(/"/g, '""');
            return `"${escapedData}"`;
        }).join(',');
    });
    return [headerRow, ...rows].join('\n');
};

// Function to trigger a file download in the browser.
export const downloadCSV = (csvString: string, filename: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
