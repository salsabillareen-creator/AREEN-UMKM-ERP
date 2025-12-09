
// views/Dashboard.tsx
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import { 
    MOCK_INVOICES,
    MOCK_BILLS,
    MOCK_LEDGER_DATA,
    MOCK_INCOME_VS_EXPENSE_CHART,
} from '../constants';
import { InvoiceStatus, BillStatus, AccountType } from '../types';
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon, CalendarIcon, WarningIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/formatting';

// Blueprint Component: Scorecard
interface ScorecardProps {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: React.ReactNode;
    onClick?: () => void;
}

const Scorecard: React.FC<ScorecardProps> = ({ title, value, trend, trendUp, icon, onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-stone-700 flex flex-col justify-between h-full ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] transition-transform duration-200' : ''}`}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {icon}
            </div>
        </div>
        <div className="mt-4 flex items-center">
            <span className={`text-xs font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
            </span>
            <span className="text-xs text-gray-400 ml-2">vs last month</span>
        </div>
    </div>
);

// Blueprint Component: Control Layer
const ControlLayer: React.FC = () => (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-stone-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-stone-700 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 md:mb-0">Financial Health Monitor</h2>
        <div className="flex gap-3">
             <div className="relative">
                <select className="appearance-none bg-gray-50 dark:bg-stone-700 border border-gray-200 dark:border-stone-600 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[var(--color-primary)] text-sm">
                    <option>This Month</option>
                    <option>Last Quarter</option>
                    <option>Year to Date</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
            <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:brightness-95">
                Refresh Data
            </button>
        </div>
    </div>
);

interface DashboardProps {
    setCurrentView: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentView }) => {
    const { primaryColor } = useTheme();

    const { totalCash, arOverdue, netIncome } = useMemo(() => {
        const totalRevenue = MOCK_LEDGER_DATA.filter(e => e.type === AccountType.Revenue).reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = MOCK_LEDGER_DATA.filter(e => e.type === AccountType.Expense).reduce((sum, item) => sum + item.amount, 0);
        const netIncome = totalRevenue - totalExpenses;
        
        // Simulating Cash Balance (simplified)
        const totalCash = 125000000 + netIncome; 
        
        const arOverdue = MOCK_INVOICES
            .filter(i => i.status === InvoiceStatus.Overdue)
            .reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + (i.quantity * i.price), 0), 0);

        return { totalCash, arOverdue, netIncome };
    }, []);

    // Mock Data for Expense Allocation (Blueprint: Right Side Detail)
    const expenseAllocation = [
        { name: 'Marketing', value: 25000000 },
        { name: 'Salaries', value: 45000000 },
        { name: 'Operations', value: 15000000 },
        { name: 'COGS', value: 30000000 },
    ];

    return (
        <div className="p-6 bg-gray-50/50 min-h-full">
            <ControlLayer />

            {/* Top Row: Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Scorecard 
                    title="Total Cash & Bank" 
                    value={formatCurrency(totalCash)} 
                    trend="+12.5%" 
                    trendUp={true} 
                    icon={<DollarSignIcon className="w-6 h-6"/>} 
                    onClick={() => setCurrentView('cash-flow')}
                />
                <Scorecard 
                    title="Net Income (MoM)" 
                    value={formatCurrency(netIncome)} 
                    trend="+5.2%" 
                    trendUp={true} 
                    icon={<TrendingUpIcon className="w-6 h-6"/>} 
                    onClick={() => setCurrentView('reports')}
                />
                <Scorecard 
                    title="Total AR Overdue" 
                    value={formatCurrency(arOverdue)} 
                    trend="+2.1%" 
                    trendUp={false} 
                    icon={<WarningIcon className="w-6 h-6"/>} 
                    onClick={() => setCurrentView('sales')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Center: Trend Analysis (Time Series) */}
                <div className="lg:col-span-2 bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-stone-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Financial Performance Trend</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_INCOME_VS_EXPENSE_CHART} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(val) => `${val/1000}k`} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="income" name="Revenue" stroke={primaryColor} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Side: Expense Allocation (Bar Chart) */}
                <div className="bg-white dark:bg-stone-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-stone-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Expense Allocation</h3>
                    <div className="h-72 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={expenseAllocation} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={60} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', fontSize: '12px' }} />
                                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Data Compliance & Audit Trail */}
             <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-gray-100 dark:border-stone-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-stone-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">AI-Processed Transaction Log (Audit Trail)</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">XAI Enabled</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-stone-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Transaction ID</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">GL Account</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3">AI Rationale</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white border-b dark:bg-stone-800 dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-700/50">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">INV-AI-2025001</td>
                                <td className="px-6 py-4">2023-10-25</td>
                                <td className="px-6 py-4">5100 - Office Supplies</td>
                                <td className="px-6 py-4 text-right">Rp 450.000</td>
                                <td className="px-6 py-4 italic text-xs">"Classified as Office Supplies based on line item 'Printer Paper' and 'Stapler' detection."</td>
                            </tr>
                            <tr className="bg-white border-b dark:bg-stone-800 dark:border-stone-700 hover:bg-gray-50 dark:hover:bg-stone-700/50">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">INV-AI-2025002</td>
                                <td className="px-6 py-4">2023-10-26</td>
                                <td className="px-6 py-4">5200 - Utilities</td>
                                <td className="px-6 py-4 text-right">Rp 1.250.000</td>
                                <td className="px-6 py-4 italic text-xs">"Classified as Utilities due to vendor name 'PLN (Persero)' and keywords 'Listrik'."</td>
                            </tr>
                            <tr className="bg-white dark:bg-stone-800 hover:bg-gray-50 dark:hover:bg-stone-700/50">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">INV-AI-2025003</td>
                                <td className="px-6 py-4">2023-10-27</td>
                                <td className="px-6 py-4">1500 - Equipment</td>
                                <td className="px-6 py-4 text-right">Rp 15.000.000</td>
                                <td className="px-6 py-4 italic text-xs">"High value item 'MacBook Pro' detected; categorized as Asset/Equipment rather than Expense."</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
