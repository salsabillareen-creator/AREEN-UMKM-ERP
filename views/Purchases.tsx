
import React, { useState, useMemo, useRef } from 'react';
import DataTable from '../components/DataTable';
import { MOCK_BILLS, MOCK_PURCHASE_ORDERS } from '../constants';
import { Bill, BillStatus, PurchaseOrder, PurchaseOrderStatus, PurchaseOrderItem } from '../types';
import { exportToCsv } from '../utils/exportUtils';
import { formatCurrency } from '../utils/formatting';
import { ExportIcon, PlusIcon, EditIcon, TrashIcon, ScanIcon } from '../components/icons';
import { geminiService } from '../services/geminiService';

// --- Helper Functions and Type-Specific Components ---
const getBillStatusBadge = (status: BillStatus) => {
  const baseClasses = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
  switch (status) {
    case BillStatus.Paid:
      return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`}>Paid</span>;
    case BillStatus.Pending:
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`}>Pending</span>;
    case BillStatus.Upcoming:
      return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`}>Upcoming</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
  }
};

const getPOStatusBadge = (status: PurchaseOrderStatus) => {
  const baseClasses = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
  switch (status) {
    case PurchaseOrderStatus.Fulfilled:
      return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`}>Fulfilled</span>;
    case PurchaseOrderStatus.Sent:
      return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`}>Sent</span>;
    case PurchaseOrderStatus.Draft:
      return <span className={`${baseClasses} bg-gray-200 text-gray-800 dark:bg-stone-700 dark:text-stone-300`}>Draft</span>;
    case PurchaseOrderStatus.Cancelled:
        return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`}>Cancelled</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
  }
};

interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
            isActive
                ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 border-b-2 border-transparent'
        }`}
    >
        {label}
    </button>
);

// --- Purchase Order Editor Component ---
interface POEditorProps {
    po: PurchaseOrder;
    onSave: (po: PurchaseOrder) => void;
    onCancel: () => void;
    aiRationale?: string;
}

const POEditor: React.FC<POEditorProps> = ({ po: initialPO, onSave, onCancel, aiRationale }) => {
    const [po, setPO] = useState<PurchaseOrder>(JSON.parse(JSON.stringify(initialPO)));

    const calculatedTotal = useMemo(() => 
        po.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
        [po.items]
    );

    const handleHeaderChange = (field: keyof Omit<PurchaseOrder, 'items' | 'id' | 'totalAmount' | 'status'>, value: string) => {
        setPO(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (itemProductId: string, field: keyof PurchaseOrderItem, value: string | number) => {
        const numericValue = (field === 'quantity' || field === 'unitPrice') && typeof value === 'string' ? parseFloat(value) || 0 : value;
        setPO(prev => ({
            ...prev,
            items: prev.items.map(item => 
                item.productId === itemProductId ? { ...item, [field]: numericValue } : item
            ),
        }));
    };

    const handleAddItem = () => {
        const newItem: PurchaseOrderItem = { productId: `new-${Date.now()}`, productName: '', quantity: 1, unitPrice: 0 };
        setPO(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const handleRemoveItem = (itemProductId: string) => {
        setPO(prev => ({ ...prev, items: prev.items.filter(item => item.productId !== itemProductId) }));
    };

    const handleSave = () => {
        onSave({ ...po, totalAmount: calculatedTotal });
    };

    const isNewPO = initialPO.vendor === '';
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-stone-800 dark:text-stone-200";

    return (
        <div className="p-6">
           <div className="bg-white dark:bg-stone-800 shadow-lg rounded-xl p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b dark:border-stone-700 pb-4 gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-stone-800 dark:text-rose-100">
                           {isNewPO ? 'Create New Purchase Order' : `Edit Purchase Order #${po.id}`}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onCancel} className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow-sm hover:bg-rose-50 dark:hover:bg-stone-600">Cancel</button>
                        <button onClick={handleSave} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90">Save PO</button>
                    </div>
                </div>

                {/* AI Rationale Display */}
                {aiRationale && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fade-in-up">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                                <ScanIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Automated Data Extraction</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{aiRationale}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Details Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                    <div>
                        <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Vendor</label>
                        <input type="text" value={po.vendor} onChange={(e) => handleHeaderChange('vendor', e.target.value)} className={inputClass} placeholder="Vendor Name"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Order Date</label>
                           <input type="date" value={po.date} onChange={(e) => handleHeaderChange('date', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                           <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Expected Delivery</label>
                           <input type="date" value={po.expectedDeliveryDate} onChange={(e) => handleHeaderChange('expectedDeliveryDate', e.target.value)} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <h4 className="text-lg font-semibold text-stone-700 dark:text-stone-200 mb-4">Order Items</h4>
                <div className="overflow-x-auto rounded-lg border dark:border-stone-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-stone-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">Unit Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">Subtotal</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-stone-800 divide-y divide-gray-200 dark:divide-stone-700">
                            {po.items.map(item => (
                                <tr key={item.productId}>
                                    <td className="px-6 py-4"><input type="text" value={item.productName} onChange={e => handleItemChange(item.productId, 'productName', e.target.value)} className={inputClass} placeholder="Product Name"/></td>
                                    <td className="px-6 py-4"><input type="number" value={item.quantity} onChange={e => handleItemChange(item.productId, 'quantity', e.target.value)} className={`${inputClass} w-20 text-right`}/></td>
                                    <td className="px-6 py-4"><input type="number" value={item.unitPrice} onChange={e => handleItemChange(item.productId, 'unitPrice', e.target.value)} className={`${inputClass} w-28 text-right`}/></td>
                                    <td className="px-6 py-4 font-medium text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                                    <td className="px-6 py-4 text-right"><button onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-5 h-5"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4">
                    <button onClick={handleAddItem} className="bg-green-500 text-white px-3 py-1.5 rounded-lg shadow hover:bg-green-600 flex items-center gap-2 text-sm"><PlusIcon className="w-4 h-4"/> Add Item</button>
                </div>
                {/* Total Amount */}
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

// --- Main Purchases Component ---
const Purchases: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bills' | 'po'>('po');
  const [bills] = useState<Bill[]>(MOCK_BILLS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [aiScanning, setAiScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanRationale, setScanRationale] = useState<string | undefined>(undefined);

  const billColumns: { header: string; accessor: keyof Bill | ((item: Bill) => React.ReactNode) }[] = [
    { header: 'Bill ID', accessor: 'id' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Date', accessor: 'date' },
    { header: 'Due Date', accessor: 'dueDate' },
    { header: 'Amount', accessor: (item: Bill) => formatCurrency(item.amount) },
    { header: 'Status', accessor: (item: Bill) => getBillStatusBadge(item.status) },
  ];
  
  const poColumns: { header: string; accessor: keyof PurchaseOrder | ((item: PurchaseOrder) => React.ReactNode) }[] = [
    { header: 'PO ID', accessor: 'id' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Date', accessor: 'date' },
    { header: 'Total Amount', accessor: (item: PurchaseOrder) => formatCurrency(item.totalAmount) },
    { header: 'Status', accessor: (item: PurchaseOrder) => getPOStatusBadge(item.status) },
     {
        header: 'Actions',
        accessor: (item: PurchaseOrder) => (
            <button onClick={() => { setEditingPO(item); setScanRationale(undefined); }} className="text-[var(--color-primary)] hover:underline text-sm font-medium">
                View / Edit
            </button>
        )
    }
  ];

  const handleBillExport = () => {
    const dataToExport = bills.map(({ id, vendor, date, dueDate, amount, status }) => ({ billId: id, vendor, date, dueDate, amount, status }));
    exportToCsv('purchase_bills.csv', dataToExport);
  };
  
  const handlePOExport = () => {
    const dataToExport = purchaseOrders.map(({ id, vendor, date, expectedDeliveryDate, totalAmount, status, items }) => ({ poId: id, vendor, date, expectedDeliveryDate, totalAmount, status, itemCount: items.length }));
    exportToCsv('purchase_orders.csv', dataToExport);
  };
  
  const handleNewPurchaseOrder = () => {
    const newPOTemplate: PurchaseOrder = {
        id: `new-${Date.now()}`, // temp ID
        vendor: '',
        date: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ productId: 'new-1', productName: '', quantity: 1, unitPrice: 0 }],
        totalAmount: 0,
        status: PurchaseOrderStatus.Draft,
    };
    setScanRationale(undefined);
    setEditingPO(newPOTemplate);
  };

  const handleSavePO = (poToSave: PurchaseOrder) => {
    setPurchaseOrders(prevPOs => {
        const isNew = !prevPOs.some(po => po.id === poToSave.id);
        if (isNew) {
            const finalPO = { ...poToSave, id: `PO-00${prevPOs.length + 1}`};
            return [finalPO, ...prevPOs];
        } else {
            return prevPOs.map(po => po.id === poToSave.id ? poToSave : po);
        }
    });
    setEditingPO(null);
  };

  const handleCancelEdit = () => {
      setEditingPO(null);
  };

  const handleScanInvoice = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAiScanning(true);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data url prefix
        const base64Data = base64String.split(',')[1];

        try {
            const extractedData = await geminiService.parseInvoiceImage(base64Data);
            
            // Map structured output to PurchaseOrder
            const newPO: PurchaseOrder = {
                id: extractedData.invoice_id || `INV-${Date.now()}`,
                vendor: extractedData.vendor_name || 'Unknown Vendor',
                date: extractedData.invoice_date || new Date().toISOString().split('T')[0],
                expectedDeliveryDate: extractedData.due_date || new Date().toISOString().split('T')[0],
                status: PurchaseOrderStatus.Draft,
                totalAmount: extractedData.total_amount || 0,
                items: extractedData.line_items.map((item: any, index: number) => ({
                    productId: `scan-${index}`,
                    productName: `${item.description} (GL: ${item.recommended_gl_account})`,
                    quantity: 1, // Default to 1 if not parsed, usually invoice lines are total line amount
                    unitPrice: item.amount // Using line amount as unit price for simplicity
                }))
            };
            
            setScanRationale("Data extracted successfully from image. GL Accounts have been recommended for review.");
            setEditingPO(newPO);
            setActiveTab('po');
        } catch (error) {
            console.error("Scanning failed", error);
            alert("Failed to scan invoice. Please try a clearer image.");
        } finally {
            setAiScanning(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsDataURL(file);
  };

  if (editingPO) {
      return <POEditor po={editingPO} onSave={handleSavePO} onCancel={handleCancelEdit} aiRationale={scanRationale} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-stone-800 dark:text-rose-100">
          {activeTab === 'bills' ? 'Vendor Bills' : 'Purchase Orders'}
        </h2>
        <div className="flex items-center gap-2">
             {/* AI Scan Button */}
             <input type="file" ref={fileInputRef} onChange={handleScanInvoice} accept="image/*" className="hidden" />
             <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={aiScanning}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors flex items-center gap-2">
              {aiScanning ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ScanIcon />
              )}
              <span>{aiScanning ? 'Scanning...' : 'Scan Invoice (AI)'}</span>
            </button>

            <button 
                onClick={activeTab === 'bills' ? handleBillExport : handlePOExport}
                className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow hover:bg-rose-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center gap-2">
              <ExportIcon />
              <span>Export CSV</span>
            </button>
            {activeTab === 'bills' ? (
                <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center gap-2">
                    <PlusIcon />
                    New Bill
                </button>
            ) : (
                <button onClick={handleNewPurchaseOrder} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center gap-2">
                    <PlusIcon />
                    New Purchase Order
                </button>
            )}
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-stone-700">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <TabButton label="Purchase Orders" isActive={activeTab === 'po'} onClick={() => setActiveTab('po')} />
              <TabButton label="Bills" isActive={activeTab === 'bills'} onClick={() => setActiveTab('bills')} />
          </nav>
      </div>

      <div>
        {activeTab === 'bills' ? (
          <DataTable columns={billColumns} data={bills} />
        ) : (
          <DataTable columns={poColumns} data={purchaseOrders} />
        )}
      </div>
    </div>
  );
};

export default Purchases;
