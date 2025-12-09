// views/DataGenerator.tsx
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { exportToCsv } from '../utils/exportUtils';
import { SparklesIcon } from '../components/icons';

interface ColumnMapping {
    original: string;
    key: string;
}

const DataGenerator: React.FC = () => {
    const [module, setModule] = useState<string>('Inventory');
    const [columns, setColumns] = useState<string>('ID Barang/SKU, Nama Barang, Kategori, Kuantitas Stok, Harga Beli, Harga Jual, Lokasi Gudang, Nama Supplier');
    const [rowCount, setRowCount] = useState<number>(50);
    const [rules, setRules] = useState<string>("ID Barang harus diawali 'SKU-'. Kuantitas Stok harus antara 10 dan 1000. Kategori hanya boleh Elektronik, Pakaian, atau Makanan.");
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [fullData, setFullData] = useState<Record<string, any>[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);

    const handleGenerate = async () => {
        if (!columns.trim() || rowCount <= 0) {
            setError('Please provide column names and a valid number of rows.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setFullData([]);
        
        const columnList = columns.split(',').map(c => c.trim()).filter(Boolean);
        const mapping = columnList.map(col => ({
            original: col,
            key: col.replace(/[^a-zA-Z0-9_]/g, '_').replace(/\s+/g, '_'),
        }));
        setColumnMapping(mapping);

        try {
            const data = await geminiService.generateSyntheticData(module, columnList, rowCount, rules);
            setFullData(data);
        } catch (err: any) {
            console.error("Data generation error:", err);
            setError(`Failed to generate data. The model might be busy or the request is invalid. Details: ${err.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (fullData.length === 0) return;
        
        const dataToExport = fullData.map(row => {
            const newRow: Record<string, any> = {};
            columnMapping.forEach(map => {
                newRow[map.original] = row[map.key];
            });
            return newRow;
        });

        exportToCsv(`${module}_data_${rowCount}_rows.csv`, dataToExport);
    };

    const previewData = fullData.slice(0, 10);
    const inputClass = "block w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-stone-800 dark:text-stone-200";
    const labelClass = "block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1";

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-stone-800 shadow-md rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] p-3 rounded-lg">
                        <SparklesIcon className="w-8 h-8"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-stone-800 dark:text-rose-100">Synthetic Data Generator</h2>
                        <p className="text-stone-600 dark:text-stone-400 mt-1">
                            Generate realistic test data for any module using AI.
                        </p>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-rose-50/50 dark:bg-stone-900/50 rounded-lg border dark:border-stone-700">
                    <h3 className="font-bold text-stone-700 dark:text-stone-200">Halo! Saya adalah Generator Data Sintetis.</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                        Saya siap membantu Anda membuat data buatan. Sebelum saya dapat membuatkan data, saya wajib mengetahui spesifikasinya terlebih dahulu. Mohon berikan detail berikut:
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-stone-800 shadow-md rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-stone-800 dark:text-rose-100">1. Provide Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="module" className={labelClass}>Module Name</label>
                        <input id="module" type="text" value={module} onChange={e => setModule(e.target.value)} className={inputClass} placeholder="e.g., Inventory, Sales, Employees" />
                    </div>
                    <div>
                        <label htmlFor="rowCount" className={labelClass}>Number of Rows</label>
                        <input id="rowCount" type="number" value={rowCount} onChange={e => setRowCount(parseInt(e.target.value, 10) || 0)} className={inputClass} />
                    </div>
                </div>
                <div>
                    <label htmlFor="columns" className={labelClass}>Column Names (comma-separated)</label>
                    <textarea id="columns" value={columns} onChange={e => setColumns(e.target.value)} rows={3} className={inputClass} />
                </div>
                 <div>
                    <label htmlFor="rules" className={labelClass}>Aturan/Format Khusus (Special Rules/Formats)</label>
                    <textarea id="rules" value={rules} onChange={e => setRules(e.target.value)} rows={3} className={inputClass} />
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="w-full md:w-auto bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg shadow hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center justify-center gap-2">
                    {isLoading ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Generating Preview...</span></>) : ('Generate Preview')}
                </button>
            </div>
            
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>}
            
            {fullData.length > 0 && !isLoading && (
                <div className="bg-white dark:bg-stone-800 shadow-md rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-stone-800 dark:text-rose-100 mb-4">2. Preview & Download</h3>
                     <div className="overflow-x-auto rounded-lg border dark:border-stone-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-stone-700">
                            <thead className="bg-gray-50 dark:bg-stone-700/50">
                                <tr>
                                    {columnMapping.map(map => (
                                        <th key={map.key} className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">{map.original}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-stone-800 divide-y divide-gray-200 dark:divide-stone-700">
                                {previewData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {columnMapping.map(map => (
                                            <td key={`${rowIndex}-${map.key}`} className="px-4 py-2 whitespace-nowrap text-sm text-stone-700 dark:text-stone-300">{String(row[map.key])}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-stone-500 mt-2">Showing first {previewData.length} of {fullData.length} generated rows.</p>
                    <button onClick={handleDownload} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors">
                        Download Full CSV ({fullData.length} rows)
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataGenerator;
