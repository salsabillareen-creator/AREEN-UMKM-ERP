import React, { useState, useMemo } from 'react';
import { AccountType, LedgerEntry } from '../types';
import { PlusCircleIcon } from './icons';

interface JournalEntryModalProps {
    onClose: () => void;
    onSave: (entries: Omit<LedgerEntry, 'id'>[]) => void;
}

interface LineItem {
    id: number;
    account: string;
    debit: string;
    credit: string;
}

const JournalEntryModal: React.FC<JournalEntryModalProps> = ({ onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: 1, account: '', debit: '', credit: '' },
        { id: 2, account: '', debit: '', credit: '' },
    ]);
    const [error, setError] = useState('');
    
    const inputStyle = "w-full bg-transparent border-0 border-b border-stone-300 dark:border-stone-600 p-1 focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] transition-colors";

    const handleLineItemChange = (id: number, field: keyof Omit<LineItem, 'id'>, value: string) => {
        setLineItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const addLineItem = () => {
        setLineItems(prev => [...prev, { id: Date.now(), account: '', debit: '', credit: '' }]);
    };

    const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
        const totalDebit = lineItems.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
        const totalCredit = lineItems.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0);
        return {
            totalDebit,
            totalCredit,
            isBalanced: totalDebit > 0 && totalDebit === totalCredit,
        };
    }, [lineItems]);

    const handleSave = () => {
        if (!isBalanced) {
            setError('Total debits must equal total credits and cannot be zero.');
            return;
        }
        if (lineItems.some(item => !item.account)) {
            setError('All line items must have an account name.');
            return;
        }
        
        setError('');

        const newLedgerEntries: Omit<LedgerEntry, 'id'>[] = lineItems
            .filter(item => (parseFloat(item.debit) || 0) > 0 || (parseFloat(item.credit) || 0) > 0)
            .map(item => {
                const amount = parseFloat(item.debit) || parseFloat(item.credit);
                const type = parseFloat(item.debit) > 0 ? AccountType.Expense : AccountType.Revenue; // Simplified logic
                return { date, account: `${item.account} (${description})`, type, amount };
            });

        onSave(newLedgerEntries);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-lg rounded-xl shadow-2xl w-full max-w-2xl border border-[var(--color-primary)]/20 dark:border-stone-700/50" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-stone-700">
                    <h2 className="text-xl font-bold text-stone-800 dark:text-rose-100">New Journal Entry</h2>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`mt-1 block ${inputStyle}`} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Description</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Monthly office supplies purchase" className={`mt-1 block ${inputStyle}`} />
                        </div>
                    </div>

                    {/* Table for line items */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b dark:border-stone-600">
                                    <th className="py-2 text-left text-sm font-semibold text-stone-600 dark:text-stone-300">Account</th>
                                    <th className="py-2 text-right text-sm font-semibold text-stone-600 dark:text-stone-300">Debit</th>
                                    <th className="py-2 text-right text-sm font-semibold text-stone-600 dark:text-stone-300">Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.map(item => (
                                    <tr key={item.id}>
                                        <td><input type="text" value={item.account} onChange={e => handleLineItemChange(item.id, 'account', e.target.value)} placeholder="e.g., Office Supplies" className={inputStyle} /></td>
                                        <td><input type="number" value={item.debit} onChange={e => handleLineItemChange(item.id, 'debit', e.target.value)} placeholder="0.00" className={`${inputStyle} text-right`} /></td>
                                        <td><input type="number" value={item.credit} onChange={e => handleLineItemChange(item.id, 'credit', e.target.value)} placeholder="0.00" className={`${inputStyle} text-right`} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={addLineItem} className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:brightness-90 dark:text-[var(--color-primary)] dark:hover:brightness-110 font-medium">
                        <PlusCircleIcon /> Add Line
                    </button>
                    
                    {/* Totals */}
                    <div className="flex justify-end gap-6 pt-4 border-t dark:border-stone-600">
                        <div className="text-right">
                            <p className="text-sm text-stone-500 dark:text-stone-400">Total Debit</p>
                            <p className="font-semibold text-stone-800 dark:text-stone-200">${totalDebit.toFixed(2)}</p>
                        </div>
                         <div className="text-right">
                            <p className="text-sm text-stone-500 dark:text-stone-400">Total Credit</p>
                            <p className="font-semibold text-stone-800 dark:text-stone-200">${totalCredit.toFixed(2)}</p>
                        </div>
                    </div>
                     {!isBalanced && totalDebit > 0 && (
                        <p className="text-right text-sm text-red-500">Totals do not balance.</p>
                     )}
                     {error && <p className="text-center text-sm text-red-500 pt-2">{error}</p>}
                </div>
                <div className="p-6 flex justify-end gap-4 bg-rose-50/50 dark:bg-stone-900/50 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 border border-stone-300 dark:border-stone-600 transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={!isBalanced} className="px-4 py-2 rounded-lg text-white bg-[var(--color-primary)] hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Save Journal</button>
                </div>
            </div>
        </div>
    );
};

export default JournalEntryModal;
