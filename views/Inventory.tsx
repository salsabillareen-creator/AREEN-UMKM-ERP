import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import { MOCK_PRODUCTS } from '../constants';
import { Product } from '../types';
import { exportToCsv } from '../utils/exportUtils';
import { formatCurrency } from '../utils/formatting';
import { ExportIcon, PlusIcon } from '../components/icons';


interface ProductEditorProps {
    product: Product;
    onSave: (product: Product) => void;
    onCancel: () => void;
}

const ProductEditor: React.FC<ProductEditorProps> = ({ product: initialProduct, onSave, onCancel }) => {
    const [product, setProduct] = useState<Product>(initialProduct);
    const isNew = initialProduct.name === '';
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-stone-800 dark:text-stone-200";

    const handleChange = (field: keyof Omit<Product, 'id'>, value: string) => {
        const isNumeric = field === 'stock' || field === 'price';
        setProduct(prev => ({ ...prev, [field]: isNumeric ? (parseFloat(value) || 0) : value }));
    };

    const handleSave = () => {
        onSave(product);
    };

    return (
        <div className="p-6">
            <div className="bg-white dark:bg-stone-800 shadow-lg rounded-xl p-8 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b dark:border-stone-700 pb-4">
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-rose-100">{isNew ? 'Add New Product' : 'Edit Product'}</h2>
                    <div className="flex gap-2">
                        <button onClick={onCancel} className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow-sm hover:bg-rose-50 dark:hover:bg-stone-600">Cancel</button>
                        <button onClick={handleSave} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90">Save Product</button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Product Name</label>
                        <input type="text" value={product.name} onChange={e => handleChange('name', e.target.value)} className={inputClass} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">SKU</label>
                           <input type="text" value={product.sku} onChange={e => handleChange('sku', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Category</label>
                            <input type="text" value={product.category} onChange={e => handleChange('category', e.target.value)} className={inputClass} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Stock Quantity</label>
                           <input type="number" value={product.stock} onChange={e => handleChange('stock', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Price</label>
                            <input type="number" value={product.price} onChange={e => handleChange('price', e.target.value)} className={inputClass} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleNewProduct = () => {
      const newProductTemplate: Product = {
          id: `new-${Date.now()}`,
          name: '',
          sku: '',
          category: '',
          stock: 0,
          price: 0,
      };
      setEditingProduct(newProductTemplate);
  };
  
  const handleEditProduct = (product: Product) => {
      setEditingProduct(product);
  };
  
  const handleSaveProduct = (productToSave: Product) => {
      setProducts(prevProducts => {
          const isNew = !prevProducts.some(p => p.id === productToSave.id);
          if (isNew) {
              const finalProduct = { ...productToSave, id: `PROD-${String(prevProducts.length + 1).padStart(2, '0')}`};
              return [finalProduct, ...prevProducts];
          } else {
              return prevProducts.map(p => p.id === productToSave.id ? productToSave : p);
          }
      });
      setEditingProduct(null);
  };
  
  const handleCancelEdit = () => {
      setEditingProduct(null);
  };

  const columns: { header: string; accessor: keyof Product | ((item: Product) => React.ReactNode) }[] = [
    { header: 'Product Name', accessor: 'name' },
    { header: 'Product ID', accessor: 'id' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Stock',
      accessor: (item: Product) => (
        <span className={item.stock < 10 ? 'text-red-500 font-semibold' : (item.stock < 50 ? 'text-yellow-500 font-semibold' : 'text-green-500')}>
          {item.stock} units
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: (item: Product) => formatCurrency(item.price),
    },
    {
        header: 'Actions',
        accessor: (item: Product) => (
            <button onClick={() => handleEditProduct(item)} className="text-[var(--color-primary)] hover:underline text-sm font-medium">
                Edit
            </button>
        )
    }
  ];

  const handleExport = () => {
    const dataToExport = products.map(({ id, name, sku, category, stock, price }) => ({
        productId: id, name, sku, category, stock, price,
    }));
    exportToCsv('product_inventory.csv', dataToExport);
  };

  if (editingProduct) {
      return <ProductEditor product={editingProduct} onSave={handleSaveProduct} onCancel={handleCancelEdit} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-stone-800 dark:text-rose-100">Product Inventory</h2>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleExport}
                className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow hover:bg-rose-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center gap-2">
              <ExportIcon />
              <span>Export CSV</span>
            </button>
            <button onClick={handleNewProduct} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center gap-2">
              <PlusIcon />
              Add Product
            </button>
        </div>
      </div>
      <DataTable columns={columns} data={products} itemsPerPage={10} />
    </div>
  );
};

export default Inventory;