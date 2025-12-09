import React, { useState, useMemo } from 'react';
import { geminiService } from '../services/geminiService';
import { MOCK_CHART_DATA, MOCK_LEDGER_DATA } from '../constants';
import { AccountType, LedgerEntry } from '../types';
import JournalEntryModal from '../components/JournalEntryModal';
import { formatCurrency } from '../utils/formatting';

const ProfitAndLossStatement: React.FC<{ ledgerData: LedgerEntry[] }> = ({ ledgerData }) => {
    const { revenue, expenses, netIncome } = useMemo(() => {
        const revenue = ledgerData.filter(e => e.type === AccountType.Revenue);
        const expenses = ledgerData.filter(e => e.type === AccountType.Expense);
        const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        const netIncome = totalRevenue - totalExpenses;
        return { revenue, expenses, netIncome };
    }, [ledgerData]);

    const renderSection = (title: string, items: LedgerEntry[], isTotal: boolean = false) => (
        <>
            <tr className="bg-rose-50 dark:bg-stone-700/50">
                <th colSpan={2} className="px-6 py-3 text-left text-sm font-semibold text-stone-700 dark:text-stone-200">{title}</th>
            </tr>
            {items.map(item => (
                <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600 dark:text-stone-300">{item.account}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-800 dark:text-stone-200 text-right">{formatCurrency(item.amount)}</td>
                </tr>
            ))}
            {isTotal && (
                <tr className="border-t-2 border-stone-300 dark:border-stone-600">
                    <td className="px-6 py-4 text-sm font-bold text-stone-800 dark:text-rose-100">Total {title}</td>
                    <td className="px-6 py-4 text-sm font-bold text-stone-800 dark:text-rose-100 text-right">{formatCurrency(items.reduce((sum, item) => sum + item.amount, 0))}</td>
                </tr>
            )}
        </>
    );

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-stone-700">
                <tbody className="bg-white dark:bg-stone-800 divide-y divide-gray-200 dark:divide-stone-700">
                    {renderSection('Revenue', revenue, true)}
                    <tr className="h-4"></tr>
                    {renderSection('Expenses', expenses, true)}
                     <tr className="h-4"></tr>
                    <tr className="bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/20 border-t-4 border-double dark:border-[var(--color-primary)]">
                        <td className="px-6 py-4 text-md font-extrabold text-stone-800 dark:text-white">Net Income</td>
                        <td className={`px-6 py-4 text-md font-extrabold text-right ${netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(netIncome)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};


const Reports: React.FC = () => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>(MOCK_LEDGER_DATA);

  const handleAddJournalEntries = (entries: Omit<LedgerEntry, 'id'>[]) => {
    const newEntries = entries.map((entry, index) => ({
        ...entry,
        id: `LED-${Date.now()}-${index}`
    }));
    setLedgerData(prevData => [...prevData, ...newEntries]);
  };


  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError('');
    setSummary('');
    try {
      const result = await geminiService.generateFinancialSummary(MOCK_CHART_DATA);
      setSummary(result);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <h4 key={index} className="text-md font-semibold text-stone-800 dark:text-stone-200 mt-3 mb-1">{line.substring(2, line.length - 2)}</h4>;
        }
        if (line.startsWith('*')) {
            return <li key={index} className="list-disc ml-6 text-stone-600 dark:text-stone-300">{line.substring(2)}</li>;
        }
        return <p key={index} className="text-stone-600 dark:text-stone-300 mb-2">{line}</p>;
      })
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="bg-white dark:bg-stone-800 shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
              <div>
                  <h2 className="text-xl font-semibold text-stone-800 dark:text-rose-100">Financial Statements</h2>
                  <p className="text-stone-600 dark:text-stone-400 mt-2">
                    Review standard financial reports for your business.
                  </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105">
                  New Journal Entry
              </button>
          </div>
          <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">Profit & Loss Statement</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">For the period ending October 31, 2023</p>
              <ProfitAndLossStatement ledgerData={ledgerData} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-stone-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-stone-800 dark:text-rose-100">AI Financial Analyst</h2>
          <p className="text-stone-600 dark:text-stone-400 mt-2">
            Use our Gemini-powered assistant to generate an insightful summary of your financial data.
          </p>
          <div className="mt-4">
            <button
              onClick={handleGenerateSummary}
              disabled={isLoading}
              className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Q1-Q3 Summary'}
            </button>
          </div>

          {isLoading && (
            <div className="mt-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
              <p className="ml-3 text-stone-600 dark:text-stone-300">Analyzing data...</p>
            </div>
          )}

          {error && <p className="mt-6 text-red-500">{error}</p>}

          {summary && (
            <div className="mt-6 border-t dark:border-stone-700 pt-6">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">Generated Summary</h3>
              <div className="prose prose-sm dark:prose-invert mt-4 max-w-none">
                {renderMarkdown(summary)}
              </div>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && <JournalEntryModal onClose={() => setIsModalOpen(false)} onSave={handleAddJournalEntries} />}
    </>
  );
};

export default Reports;