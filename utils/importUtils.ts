import { Invoice, InvoiceItem, InvoiceStatus, Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';

const productMap = new Map<string, Product>(MOCK_PRODUCTS.map(p => [p.id, p]));

interface CsvRow {
    InvoiceID: string;
    Customer: string;
    Date: string;
    DueDate: string;
    ProductID: string;
    Quantity: string;
    PriceOverride?: string;
}

export const parseInvoicesFromCSV = (csvText: string): { invoices: Invoice[], errors: string[] } => {
    const lines = csvText.trim().replace(/\r/g, "").split('\n');
    if (lines.length < 2) {
        return { invoices: [], errors: ['CSV file is empty or contains only a header.'] };
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['InvoiceID', 'Customer', 'Date', 'DueDate', 'ProductID', 'Quantity'];
    for (const header of requiredHeaders) {
        if (!headers.includes(header)) {
            return { invoices: [], errors: [`CSV is missing required header: ${header}. Expected headers are ${requiredHeaders.join(', ')}.`] };
        }
    }
    
    const rows = lines.slice(1);
    const errors: string[] = [];

    const invoiceDataMap = new Map<string, Omit<Invoice, 'items' | 'status'> & { items: Omit<InvoiceItem, 'id'>[] }>();

    rows.forEach((rowStr, index) => {
        if (!rowStr.trim()) return;
        const values = rowStr.split(',').map(v => v.trim());
        const row: Partial<CsvRow> = Object.fromEntries(headers.map((header, i) => [header, values[i]]));

        if (!row.InvoiceID || !row.Customer || !row.ProductID || !row.Quantity || !row.Date || !row.DueDate) {
            errors.push(`Row ${index + 2}: Missing one or more required fields.`);
            return;
        }

        const product = productMap.get(row.ProductID);
        if (!product) {
            errors.push(`Row ${index + 2}: Product with ID "${row.ProductID}" not found in inventory.`);
            return;
        }
        
        const quantity = parseInt(row.Quantity, 10);
        const price = row.PriceOverride ? parseFloat(row.PriceOverride) : product.price;

        if (isNaN(quantity) || quantity <= 0 || isNaN(price) || price < 0) {
             errors.push(`Row ${index + 2}: Invalid number for Quantity or Price. Quantity must be positive.`);
            return;
        }

        const newItem: Omit<InvoiceItem, 'id'> = {
            productId: product.id,
            description: product.name,
            sku: product.sku,
            quantity,
            price,
        };

        if (invoiceDataMap.has(row.InvoiceID)) {
            invoiceDataMap.get(row.InvoiceID)!.items.push(newItem);
        } else {
            invoiceDataMap.set(row.InvoiceID, {
                id: row.InvoiceID,
                customer: row.Customer,
                date: row.Date,
                dueDate: row.DueDate,
                items: [newItem],
            });
        }
    });

    const invoices: Invoice[] = Array.from(invoiceDataMap.values()).map(invData => ({
        ...invData,
        status: InvoiceStatus.Due, // Default status for imported invoices
        items: invData.items.map((item, index) => ({...item, id: `${invData.id}-${index + 1}`})),
    }));
    
    return { invoices, errors };
};
