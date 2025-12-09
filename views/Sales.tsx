import React, { useState, useMemo, useRef } from 'react';
import DataTable from '../components/DataTable';
import { MOCK_INVOICES, MOCK_PRODUCTS } from '../constants';
import { Invoice, InvoiceStatus, InvoiceItem } from '../types';
import { exportToCsv } from '../utils/exportUtils';
import { parseInvoicesFromCSV } from '../utils/importUtils';
import { formatCurrency } from '../utils/formatting';
import { ExportIcon, PlusIcon, EditIcon, TrashIcon, ImportIcon } from '../components/icons';
import ImportPreviewModal from '../components/ImportPreviewModal';

const getStatusBadge = (status: InvoiceStatus) => {
  const baseClasses = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
  switch (status) {
    case InvoiceStatus.Paid:
      return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`}>Paid</span>;
    case InvoiceStatus.Due:
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`}>Due</span>;
    case InvoiceStatus.Overdue:
      return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`}>Overdue</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
  }
};

const calculateTotalAmount = (items: InvoiceItem[]) => items.reduce((sum, item) => sum + item.quantity * item.price, 0);

interface InvoiceEditorProps {
    invoice: Invoice;
    onSave: (updatedInvoice: Invoice) => void;
    onCancel: () => void;
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ invoice: initialInvoice, onSave, onCancel }) => {
    const [invoice, setInvoice] = useState<Invoice>(JSON.parse(JSON.stringify(initialInvoice)));
    
    const calculatedTotal = useMemo(() => calculateTotalAmount(invoice.items), [invoice.items]);

    const handleSave = () => {
        onSave(invoice);
    };
    
    const handleHeaderChange = (field: keyof Omit<Invoice, 'items' | 'id' | 'status'>, value: string) => {
        setInvoice(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (itemId: string | number, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
        const numericValue = (field === 'quantity' || field === 'price') && typeof value === 'string' ? parseFloat(value) || 0 : value;
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId ? { ...item, [field]: numericValue } : item
            )
        }));
    };

    const handleProductSelect = (itemId: string | number, selectedProductId: string) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id !== itemId) return item;

                const product = MOCK_PRODUCTS.find(p => p.id === selectedProductId);
                if (!product) { // This handles deselection or invalid product
                    return { ...item, productId: null, sku: 'N/A' };
                }

                return {
                    ...item,
                    productId: product.id,
                    description: product.name,
                    sku: product.sku,
                    price: product.price,
                };
            })
        }));
    };

    const handleAddItem = () => {
        const newItem: InvoiceItem = { id: `new-${Date.now()}`, productId: null, description: '', sku: '', quantity: 1, price: 0 };
        setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const handleRemoveItem = (itemId: string | number) => {
        setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) }));
    };
    
    const isNewInvoice = initialInvoice.customer === '';
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-stone-800 dark:text-stone-200";

    return (
        <div className="p-6">
           <div className="bg-white dark:bg-stone-800 shadow-lg rounded-xl p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b dark:border-stone-700 pb-4 gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-stone-800 dark:text-rose-100">
                            {isNewInvoice ? 'Create New Invoice' : `Edit Invoice #${invoice.id}`}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onCancel} className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow-sm hover:bg-rose-50 dark:hover:bg-stone-600">Cancel</button>
                        <button onClick={handleSave} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90">Save Changes</button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Customer</label>
                        <input type="text" value={invoice.customer} onChange={(e) => handleHeaderChange('customer', e.target.value)} className={inputClass} placeholder="Customer Name"/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Invoice Date</label>
                             <input type="date" value={invoice.date} onChange={(e) => handleHeaderChange('date', e.target.value)} className={inputClass} />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Due Date</label>
                             <input type="date" value={invoice.dueDate} onChange={(e) => handleHeaderChange('dueDate', e.target.value)} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <h4 className="text-lg font-semibold text-stone-700 dark:text-stone-200 mb-4">Invoice Items</h4>
                <div className="overflow-x-auto rounded-lg border dark:border-stone-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-stone-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Unit Price</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Subtotal</th>
                                <th className="px-4 py-3 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-stone-800 divide-y divide-gray-200 dark:divide-stone-700">
                            {invoice.items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2 w-48"><select value={item.productId || ''} onChange={e => handleProductSelect(item.id, e.target.value)} className={inputClass}><option value="">Select a product...</option>{MOCK_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
                                    <td className="px-4 py-2"><input type="text" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className={inputClass} placeholder="Item description"/></td>
                                    <td className="px-4 py-2 w-24"><input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className={`${inputClass} w-20 text-right`} /></td>
                                    <td className="px-4 py-2 w-32"><input type="number" value={item.price} onChange={e => handleItemChange(item.id, 'price', e.target.value)} className={`${inputClass} w-28 text-right`} /></td>
                                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.quantity * item.price)}</td>
                                    <td className="px-4 py-2 text-right"><button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-5 h-5"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4">
                    <button onClick={handleAddItem} className="bg-green-500 text-white px-3 py-1.5 rounded-lg shadow hover:bg-green-600 flex items-center gap-2 text-sm"><PlusIcon className="w-4 h-4"/> Add Item</button>
                </div>
                {/* Total */}
                 <div className="flex justify-end mt-6">
                    <div className="w-full max-w-sm">
                        <div className="flex justify-between items-center bg-gray-100 dark:bg-stone-900/50 p-4 rounded-lg">
                            <span className="text-lg font-bold text-stone-800 dark:text-rose-100">Total Amount</span>
                            <span className="text-xl font-bold text-[var(--color-primary)]">{formatCurrency(calculatedTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Sales: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [salesTarget, setSalesTarget] = useState(2000000000);
  const [editingTarget, setEditingTarget] = useState(salesTarget);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // For CSV Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [invoicesToImport, setInvoicesToImport] = useState<Invoice[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImportModalOpen, setImportModalOpen] = useState(false);


  const totalPaid = useMemo(() => 
    invoices
        .filter(inv => inv.status === InvoiceStatus.Paid)
        .reduce((sum, inv) => sum + calculateTotalAmount(inv.items), 0),
    [invoices]
  );
  
  const progressPercentage = useMemo(() => (totalPaid / salesTarget) * 100, [totalPaid, salesTarget]);

  const handleNewInvoice = () => {
    const newInvoiceTemplate: Invoice = {
      id: `new-${Date.now()}`, // Temporary ID
      customer: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ id: 1, productId: null, description: '', sku: '', quantity: 1, price: 0 }],
      status: InvoiceStatus.Due,
    };
    setEditingInvoice(newInvoiceTemplate);
  };
  
  const handleEditInvoice = (invoice: Invoice) => {
      setEditingInvoice(invoice);
  };
  
  const handleSaveInvoice = (invoiceToSave: Invoice) => {
      setInvoices(prevInvoices => {
          const isNew = !prevInvoices.some(inv => inv.id === invoiceToSave.id);
          if (isNew) {
              const finalInvoice = { ...invoiceToSave, id: `INV-${String(prevInvoices.length + 1).padStart(3, '0')}` };
              return [finalInvoice, ...prevInvoices];
          } else {
              return prevInvoices.map(inv => (inv.id === invoiceToSave.id ? invoiceToSave : inv));
          }
      });
      setEditingInvoice(null);
  };
  
  const handleCancelEdit = () => {
      setEditingInvoice(null);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const { invoices: parsedInvoices, errors } = parseInvoicesFromCSV(text);
            setInvoicesToImport(parsedInvoices);
            setImportErrors(errors);
            setImportModalOpen(true);
        } catch (error) {
            setInvoicesToImport([]);
            setImportErrors(['An unexpected error occurred while parsing the file. Please ensure it is a valid CSV.']);
            setImportModalOpen(true);
        }
    };
    reader.readAsText(file);
    // Reset file input value to allow re-uploading the same file
    if(event.target) event.target.value = '';
  };

  const handleConfirmImport = (finalInvoices: Invoice[]) => {
    setInvoices(prev => [...finalInvoices, ...prev]);
    setImportModalOpen(false);
    setInvoicesToImport([]);
    setImportErrors([]);
  };

  const columns: { header: string; accessor: keyof Invoice | ((item: Invoice) => React.ReactNode); }[] = [
    { header: 'Invoice ID', accessor: 'id' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Date', accessor: 'date' },
    { header: 'Amount', accessor: (item: Invoice) => formatCurrency(calculateTotalAmount(item.items)) },
    { header: 'Status', accessor: (item: Invoice) => getStatusBadge(item.status) },
    { header: 'Actions', accessor: (item: Invoice) => (
        <button onClick={() => handleEditInvoice(item)} className="text-[var(--color-primary)] hover:underline text-sm font-medium">
            View / Edit
        </button>
      )
    },
  ];

  const handleExport = () => {
    const dataToExport = invoices.map(({ id, customer, date, dueDate, items, status }) => ({
      invoiceId: id,
      customer,
      date,
      dueDate,
      amount: calculateTotalAmount(items),
      status,
    }));
    exportToCsv('sales_invoices.csv', dataToExport);
  };
  
  const handleSaveTarget = () => {
      setSalesTarget(editingTarget);
      setIsEditingTarget(false);
  };

  if (editingInvoice) {
      return <InvoiceEditor invoice={editingInvoice} onSave={handleSaveInvoice} onCancel={handleCancelEdit} />
  }

  return (
    <>
      <div className="p-6 space-y-6">
       <div className="bg-white dark:bg-stone-800 shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-stone-800 dark:text-rose-100">Monthly Sales Target</h3>
                {!isEditingTarget ? (
                    <button onClick={() => setIsEditingTarget(true)} className="flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline">
                        <EditIcon className="w-4 h-4" /> Edit Target
                    </button>
                ) : (
                     <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            value={editingTarget}
                            onChange={(e) => setEditingTarget(Number(e.target.value))}
                            className="px-2 py-1 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                        />
                        <button onClick={handleSaveTarget} className="text-sm bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600">Save</button>
                        <button onClick={() => { setIsEditingTarget(false); setEditingTarget(salesTarget); }} className="text-sm">Cancel</button>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-stone-600 dark:text-stone-300">
                    <span>Progress</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-stone-700 rounded-full h-2.5">
                    <div className="bg-[var(--color-primary)] h-2.5 rounded-full" style={{ width: `${Math.min(progressPercentage, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-sm text-stone-500 dark:text-stone-400">
                    <span>{formatCurrency(totalPaid)}</span>
                    <span>Target: {formatCurrency(salesTarget)}</span>
                </div>
            </div>
        </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-stone-800 dark:text-rose-100">All Invoices</h2>
        <div className="flex items-center gap-2">
           <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow hover:bg-rose-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center gap-2">
            <ImportIcon />
            <span>Import CSV</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".csv" />
          <button 
              onClick={handleExport}
              className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow hover:bg-rose-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center gap-2">
            <ExportIcon />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={handleNewInvoice}
            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center gap-2">
            <PlusIcon />
            <span>New Invoice</span>
          </button>
        </div>
      </div>
      <DataTable columns={columns} data={invoices} />
    </div>
    {isImportModalOpen && (
        <ImportPreviewModal
            invoices={invoicesToImport}
            errors={importErrors}
            onConfirm={handleConfirmImport}
            onCancel={() => setImportModalOpen(false)}
        />
    )}
    </>
  );
};

export default Sales;