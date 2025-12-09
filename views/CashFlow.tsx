// views/CashFlow.tsx

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_CASH_FLOW } from '../constants';
import { CashFlowForecast } from '../types';
import { geminiService } from '../services/geminiService';
import { WarningIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/formatting';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="label font-bold text-gray-800 dark:text-gray-200">{label}</p>
          <p className="text-green-600 dark:text-green-400">Cash In: {formatCurrency(payload[0].value)}</p>
          <p className="text-red-600 dark:text-red-400">Cash Out: {formatCurrency(payload[1].value)}</p>
        </div>
      );
    }
    return null;
};

const CashFlow: React.FC = () => {
    const [forecast, setForecast] = useState<CashFlowForecast | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { primaryColor } = useTheme();

    const handleGenerateForecast = async () => {
        setIsLoading(true);
        setForecast(null);
        try {
            const result = await geminiService.getCashFlowForecast(MOCK_CASH_FLOW);
            setForecast(result);
        } catch (error) {
            console.error("Failed to generate cash flow forecast", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-stone-800 shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-stone-800 dark:text-rose-100">Historical Cash Flow (6 Months)</h2>
                 <div style={{ width: '100%', height: 300 }} className="mt-4">
                    <ResponsiveContainer>
                        <AreaChart data={MOCK_CASH_FLOW} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCashIn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorCashOut" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke={document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280'} />
                            <YAxis stroke={document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280'} tickFormatter={(tick) => `${tick/1000000}jt`} />
                            <CartesianGrid strokeDasharray="3 3" stroke={document.body.classList.contains('dark') ? '#4b5563' : '#e5e7eb'} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="cashIn" stroke={primaryColor} fillOpacity={1} fill="url(#colorCashIn)" />
                            <Area type="monotone" dataKey="cashOut" stroke="#ef4444" fillOpacity={1} fill="url(#colorCashOut)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-stone-800 shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-stone-800 dark:text-rose-100">AI Cash Flow Forecast</h2>
                <p className="text-stone-600 dark:text-stone-400 mt-2">
                    Use AI to forecast your cash flow based on the last 6 months of historical data.
                </p>
                <div className="mt-4">
                    <button onClick={handleGenerateForecast} disabled={isLoading} className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg shadow hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors">
                        {isLoading ? 'Analyzing...' : 'Generate Cash Flow Forecast'}
                    </button>
                </div>

                {isLoading && (
                    <div className="mt-6 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                        <p className="ml-3 text-stone-600 dark:text-stone-300">AI is calculating the forecast...</p>
                    </div>
                )}
                
                {forecast && (
                    <div className="mt-6 border-t dark:border-stone-700 pt-6">
                        {forecast.warning && (
                             <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-6">
                                <div className="flex">
                                    <WarningIcon className="text-yellow-500 mr-3"/>
                                    <div>
                                        <p className="font-bold text-sm text-yellow-800 dark:text-yellow-300">Cash Flow Warning</p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">{forecast.warning}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="bg-gray-50 dark:bg-stone-700/50 p-4 rounded-lg">
                                <p className="text-sm text-stone-500 dark:text-stone-400">30-Day Forecast</p>
                                <p className={`text-2xl font-bold ${forecast.forecast30 >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(forecast.forecast30)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-stone-700/50 p-4 rounded-lg">
                                <p className="text-sm text-stone-500 dark:text-stone-400">60-Day Forecast</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(forecast.forecast60)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-stone-700/50 p-4 rounded-lg">
                                <p className="text-sm text-stone-500 dark:text-stone-400">90-Day Forecast</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(forecast.forecast90)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashFlow;