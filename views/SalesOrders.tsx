
import React, { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import { MOCK_SALES_ORDERS } from '../constants';
import { SalesOrder, SalesOrderStatus, SalesOrderItem } from '../types';
import { exportToCsv } from '../utils/exportUtils';
import { formatCurrency } from '../utils/formatting';
import { ExportIcon, PlusIcon, TrashIcon } from '../components/icons';

// --- Helper Functions and Status Badges ---
const getSOStatusBadge = (status: SalesOrderStatus) => {
  const baseClasses = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
  switch (status) {
    case SalesOrderStatus.Shipped:
      return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`}>Shipped</span>;
    case SalesOrderStatus.Confirmed:
      return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`}>Confirmed</span>;
    case SalesOrderStatus.Invoiced:
        return <span className={`${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300`}>Invoiced</span>;
    case SalesOrderStatus.Draft:
      return <span className={`${baseClasses} bg-gray-200 text-gray-800 dark:bg-stone-700 dark:text-stone-300`}>Draft</span>;
    case SalesOrderStatus.Cancelled:
        return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`}>Cancelled</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
  }
};

// --- Sales Order Editor Component ---
interface SOEditorProps {
    so: SalesOrder;
    onSave: (so: SalesOrder) => void;
    onCancel: () => void;
}

const SOEditor: React.FC<SOEditorProps> = ({ so: initialSO, onSave, onCancel }) => {
    const [so, setSO] = useState<SalesOrder>(JSON.parse(JSON.stringify(initialSO)));

    const calculatedTotal = useMemo(() => 
        so.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
        [so.items]
    );

    const handleHeaderChange = (field: keyof Omit<SalesOrder, 'items' | 'id' | 'totalAmount' | 'status'>, value: string) => {
        setSO(prev => ({ ...prev, [field]: value }));
    };

    const handleStatusChange = (value: string) => {
        setSO(prev => ({ ...prev, status: value as SalesOrderStatus }));
    }

    const handleItemChange = (itemProductId: string, field: keyof SalesOrderItem, value: string | number) => {
        const numericValue = (field === 'quantity' || field === 'unitPrice') && typeof value === 'string' ? parseFloat(value) || 0 : value;
        setSO(prev => ({
            ...prev,
            items: prev.items.map(item => 
                item.productId === itemProductId ? { ...item, [field]: numericValue } : item
            ),
        }));
    };

    const handleAddItem = () => {
        const newItem: SalesOrderItem = { productId: `new-${Date.now()}`, productName: '', quantity: 1, unitPrice: 0 };
        setSO(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const handleRemoveItem = (itemProductId: string) => {
        setSO(prev => ({ ...prev, items: prev.items.filter(item => item.productId !== itemProductId) }));
    };

    const handleSave = () => {
        onSave({ ...so, totalAmount: calculatedTotal });
    };

    const isNewSO = initialSO.customer === '';
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-stone-800 dark:text-stone-200";

    return (
        <div className="p-6">
           <div className="bg-white dark:bg-stone-800 shadow-lg rounded-xl p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b dark:border-stone-700 pb-4 gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-stone-800 dark:text-rose-100">
                           {isNewSO ? 'Create New Sales Order' : `Edit Sales Order #${so.id}`}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onCancel} className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow-sm hover:bg-rose-50 dark:hover:bg-stone-600">Cancel</button>
                        <button onClick={handleSave} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90">Save Order</button>
                    </div>
                </div>

                {/* Details Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                    <div>
                        <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Customer</label>
                        <input type="text" value={so.customer} onChange={(e) => handleHeaderChange('customer', e.target.value)} className={inputClass} placeholder="Customer Name"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Status</label>
                        <select value={so.status} onChange={e => handleStatusChange(e.target.value)} className={inputClass}>
                            {Object.values(SalesOrderStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Order Date</label>
                           <input type="date" value={so.date} onChange={(e) => handleHeaderChange('date', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                           <label className="text-sm font-medium text-stone-500 dark:text-stone-400">Delivery Date</label>
                           <input type="date" value={so.expectedDeliveryDate} onChange={(e) => handleHeaderChange('expectedDeliveryDate', e.target.value)} className={inputClass} />
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
                            {so.items.map(item => (
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

// --- Main SalesOrders Component ---
const SalesOrders: React.FC = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(MOCK_SALES_ORDERS);
  const [editingSO, setEditingSO] = useState<SalesOrder | null>(null);

  const soColumns: { header: string; accessor: keyof SalesOrder | ((item: SalesOrder) => React.ReactNode) }[] = [
    { header: 'Order ID', accessor: 'id' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Date', accessor: 'date' },
    { header: 'Delivery Date', accessor: 'expectedDeliveryDate' },
    { header: 'Total Amount', accessor: (item: SalesOrder) => formatCurrency(item.totalAmount) },
    { header: 'Status', accessor: (item: SalesOrder) => getSOStatusBadge(item.status) },
     {
        header: 'Actions',
        accessor: (item: SalesOrder) => (
            <button onClick={() => setEditingSO(item)} className="text-[var(--color-primary)] hover:underline text-sm font-medium">
                View / Edit
            </button>
        )
    }
  ];

  const handleExport = () => {
    const dataToExport = salesOrders.map(({ id, customer, date, expectedDeliveryDate, totalAmount, status, items }) => ({ soId: id, customer, date, expectedDeliveryDate, totalAmount, status, itemCount: items.length }));
    exportToCsv('sales_orders.csv', dataToExport);
  };
  
  const handleNewSalesOrder = () => {
    const newSOTemplate: SalesOrder = {
        id: `new-${Date.now()}`,
        customer: '',
        date: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ productId: 'new-1', productName: '', quantity: 1, unitPrice: 0 }],
        totalAmount: 0,
        status: SalesOrderStatus.Draft,
    };
    setEditingSO(newSOTemplate);
  };

  const handleSaveSO = (soToSave: SalesOrder) => {
    setSalesOrders(prevSOs => {
        const isNew = !prevSOs.some(so => so.id === soToSave.id);
        if (isNew) {
            const finalSO = { ...soToSave, id: `SO-${String(prevSOs.length + 1).padStart(3, '0')}`};
            return [finalSO, ...prevSOs];
        } else {
            return prevSOs.map(so => so.id === soToSave.id ? soToSave : so);
        }
    });
    setEditingSO(null);
  };

  const handleCancelEdit = () => {
      setEditingSO(null);
  };

  if (editingSO) {
      return <SOEditor so={editingSO} onSave={handleSaveSO} onCancel={handleCancelEdit} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-stone-800 dark:text-rose-100">Sales Orders</h2>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleExport}
                className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow hover:bg-rose-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center gap-2">
              <ExportIcon />
              <span>Export CSV</span>
            </button>
            <button onClick={handleNewSalesOrder} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center gap-2">
                <PlusIcon />
                New Sales Order
            </button>
        </div>
      </div>

      <div>
          <DataTable columns={soColumns} data={salesOrders} />
      </div>
    </div>
  );
};

export default SalesOrders;
