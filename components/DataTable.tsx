import React, { useState, useMemo } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  itemsPerPage?: number;
}

const DataTable = <T extends { id: string | number },>({
  columns,
  data,
  itemsPerPage = 5,
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="bg-white dark:bg-stone-800 shadow-md rounded-lg overflow-hidden">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
          }}
          className="w-full md:w-1/3 px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-stone-800 dark:text-stone-200"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-stone-700">
          <thead className="bg-gray-50 dark:bg-stone-700">
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.header)}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-stone-800 divide-y divide-gray-200 dark:divide-stone-700">
            {paginatedData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-stone-700/50">
                {columns.map(col => (
                  <td
                    key={`${item.id}-${String(col.header)}`}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-stone-700 dark:text-stone-300 ${col.className || ''}`}
                  >
                    {typeof col.accessor === 'function'
                      ? col.accessor(item)
                      : String(item[col.accessor as keyof T])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 flex items-center justify-between border-t dark:border-stone-700">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Showing <span className="font-medium">{paginatedData.length}</span> of <span className="font-medium">{filteredData.length}</span> results
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-stone-700 dark:text-stone-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-stone-300 dark:border-stone-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;