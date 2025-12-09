export const exportToCsv = <T extends object>(filename: string, data: T[]): void => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = Object.keys(data[0]) as (keyof T)[];
    
    // Sanitize headers (e.g., capitalize first letter)
    const sanitizedHeaders = headers.map(header => {
        const str = String(header).replace(/([A-Z])/g, ' $1'); // Add space before uppercase letters
        return str.charAt(0).toUpperCase() + str.slice(1);
    });

    const csvRows = [
        sanitizedHeaders.join(','),
        ...data.map(row =>
            headers
                .map(header => {
                    const cell = row[header];
                    // Escape commas and quotes
                    let value = cell === null || cell === undefined ? '' : String(cell);
                    if (/[",\n]/.test(value)) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                })
                .join(',')
        ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
