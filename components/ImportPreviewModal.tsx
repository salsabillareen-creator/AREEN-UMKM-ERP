import React, { useState } from 'react';
import { Invoice } from '../types';
import { WarningIcon } from './icons';
import { formatCurrency } from '../utils/formatting';

interface ImportPreviewModalProps {
    invoices: Invoice[];
    errors: string[];
    onConfirm: (invoices: Invoice[]) => void;
    onCancel: () => void;
}

const calculateTotalAmount = (items: Invoice['items']) => items.reduce((sum, item) => sum + item.quantity * item.price, 0);

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({ invoices, errors, onConfirm, onCancel }) => {
    const [editableInvoices, setEditableInvoices] = useState<Invoice[]>(() => JSON.parse(JSON.stringify(invoices)));

    const handleFieldChange = (invoiceId: string, field: 'customer' | 'date', value: string) => {
        setEditableInvoices(prev => 
            prev.map(inv => 
                inv.id === invoiceId ? { ...inv, [field]: value } : inv
            )
        );
    };

    const hasInvoices = editableInvoices.length > 0;
    const hasErrors = errors.length > 0;
    const inputClass = "w-full bg-white dark:bg-stone-700/50 border border-transparent hover:border-stone-300 dark:hover:border-stone-600 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] rounded-md px-2 py-1 text-sm transition-colors text-stone-800 dark:text-stone-200";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl w-full max-w-4xl border border-[var(--color-primary)]/20 dark:border-stone-700/50 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-stone-700">
                    <h2 className="text-xl font-bold text-stone-800 dark:text-rose-100">Import Preview & Edit</h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Review and edit the data before importing. Changes are saved for this import session only.</p>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                    {hasErrors && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-r-lg">
                            <div className="flex items-start">
                                <WarningIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-red-800 dark:text-red-200">{errors.length} Error(s) Found</h3>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                        Some rows in your file could not be imported. Please fix them and try again.
                                    </p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-red-600 dark:text-red-300">
                                        {errors.slice(0, 5).map((error, index) => <li key={index}>{error}</li>)}
                                        {errors.length > 5 && <li>...and {errors.length - 5} more.</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {hasInvoices ? (
                        <div>
                            <h3 className="font-semibold text-stone-700 dark:text-stone-200">Ready to Import ({editableInvoices.length} Invoices)</h3>
                            <div className="mt-2 border dark:border-stone-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-stone-700">
                                    <thead className="bg-gray-50 dark:bg-stone-700/50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase">Invoice ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase w-1/3">Customer</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase">Date</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase">Items</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-stone-800 divide-y divide-gray-200 dark:divide-stone-700">
                                        {editableInvoices.map(inv => (
                                            <tr key={inv.id}>
                                                <td className="px-4 py-2 text-sm font-medium text-stone-800 dark:text-stone-200">{inv.id}</td>
                                                <td className="px-4 py-1">
                                                     <input 
                                                        type="text" 
                                                        value={inv.customer} 
                                                        onChange={(e) => handleFieldChange(inv.id, 'customer', e.target.value)}
                                                        className={inputClass}
                                                    />
                                                </td>
                                                <td className="px-4 py-1">
                                                     <input 
                                                        type="date" 
                                                        value={inv.date} 
                                                        onChange={(e) => handleFieldChange(inv.id, 'date', e.target.value)}
                                                        className={inputClass}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-sm text-stone-600 dark:text-stone-300 text-right">{inv.items.length}</td>
                                                <td className="px-4 py-2 text-sm font-semibold text-stone-800 dark:text-stone-200 text-right">{formatCurrency(calculateTotalAmount(inv.items))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                         <div className="text-center py-10">
                            <h3 className="text-lg font-medium text-stone-700 dark:text-stone-200">No Invoices to Import</h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                                {hasErrors ? "No valid invoices were found after accounting for errors." : "The selected file does not contain any valid invoice data."}
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-4 flex justify-end gap-4 bg-rose-50/50 dark:bg-stone-900/50 rounded-b-xl border-t dark:border-stone-700">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 border border-stone-300 dark:border-stone-600 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => onConfirm(editableInvoices)} disabled={!hasInvoices} className="px-4 py-2 rounded-lg text-white bg-[var(--color-primary)] hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Confirm & Import {editableInvoices.length} Invoices
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportPreviewModal;
