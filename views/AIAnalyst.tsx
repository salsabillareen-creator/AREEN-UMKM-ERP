// views/AIAnalyst.tsx
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { MOCK_BILLS, MOCK_CONTACTS, MOCK_DEALS, MOCK_INVOICES, MOCK_PRODUCTS } from '../constants';
import { ProactiveInsight } from '../types';
import { AIAnalystIcon, SparklesIcon, WarningIcon } from '../components/icons';

// --- Sub-components for Tabbed Interface ---

interface InsightCardProps {
  insight: ProactiveInsight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const insightMeta = {
    Anomaly: { icon: <WarningIcon className="w-6 h-6"/>, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-500/30' },
    Opportunity: { icon: <SparklesIcon className="w-6 h-6"/>, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500/30' },
    Efficiency: { icon: <AIAnalystIcon className="w-6 h-6"/>, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-500/30' }
  };
  const meta = insightMeta[insight.type] || insightMeta.Opportunity;

  return (
    <div className={`p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${meta.bg} border ${meta.border}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-full ${meta.color} ${meta.bg}`}>
          {meta.icon}
        </div>
        <div>
            <h4 className={`font-bold ${meta.color}`}>{insight.title}</h4>
            <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">{insight.description}</p>
        </div>
      </div>
    </div>
  );
};

const ProactiveInsights: React.FC = () => {
    const [insights, setInsights] = useState<ProactiveInsight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoading(true);
            setError('');
            try {
                const contextData = { invoices: MOCK_INVOICES, bills: MOCK_BILLS, products: MOCK_PRODUCTS, deals: MOCK_DEALS };
                const result = await geminiService.getProactiveInsights(contextData);
                setInsights(result);
            } catch (err) {
                setError('Failed to fetch proactive insights. The AI model may be busy, please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInsights();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mb-4"></div>
                <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-200">Analyzing Your Business Data...</h3>
                <p className="text-stone-500 dark:text-stone-400">AI is looking for anomalies, opportunities, and efficiencies.</p>
            </div>
        );
    }

    if (error) {
        return <p className="mt-6 text-red-500 text-center">{error}</p>;
    }

    if (insights.length === 0) {
        return (
            <div className="text-center p-10 bg-gray-50 dark:bg-stone-800/50 rounded-lg">
                <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">All Clear!</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Our AI analyst didn't find any critical anomalies or urgent opportunities at this time. Keep up the great work!</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
            ))}
        </div>
    );
};

const AskQuestion: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError('Please enter a question to analyze.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResponse('');
    const contextData = { invoices: MOCK_INVOICES, bills: MOCK_BILLS, products: MOCK_PRODUCTS, deals: MOCK_DEALS, contacts: MOCK_CONTACTS };
    try {
      const result = await geminiService.analyzeDataWithQuestion(query, contextData); 
      setResponse(result);
    } catch (err) {
      setError('An error occurred while analyzing the data. Please try again.');
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
        if (line.startsWith('* ')) {
            return <li key={index} className="list-disc ml-6 text-stone-600 dark:text-stone-300">{line.substring(2)}</li>;
        }
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return <p key={index} className="text-stone-600 dark:text-stone-300 mb-2">
            {parts.map((part, i) => 
                part.startsWith('**') && part.endsWith('**') 
                ? <strong key={i}>{part.substring(2, part.length - 2)}</strong> 
                : part
            )}
        </p>;
      });
  };

  return (
    <div className="space-y-6">
        <div className="space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'Who are my top 3 customers by invoice amount?' or 'Which products are low in stock?'"
            className="w-full h-28 p-3 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
            rows={3}
          />
          <button onClick={handleAnalyze} disabled={isLoading} className="w-full md:w-auto bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg shadow hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors flex items-center justify-center gap-2">
            {isLoading ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Analyzing...</span></>) : ('Get Insights')}
          </button>
        </div>
        {error && <p className="mt-6 text-red-500">{error}</p>}
        {response && (
          <div className="mt-6 border-t dark:border-stone-700 pt-6">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Analysis Result</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-rose-50/50 dark:bg-stone-900/50 p-4 rounded-lg">{renderMarkdown(response)}</div>
          </div>
        )}
         <div className="bg-white dark:bg-stone-800 shadow-sm rounded-lg p-6 mt-6 border border-gray-200 dark:border-stone-700">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Example Questions</h3>
            <ul className="list-disc ml-5 space-y-2 text-stone-600 dark:text-stone-400">
                <li>What is the total value of overdue invoices?</li>
                <li>Which vendor do we owe the most money to?</li>
                <li>Summarize the performance of the 'Project Titan Server Upgrade' deal.</li>
            </ul>
        </div>
    </div>
  );
};


interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-semibold transition-colors ${
            isActive
                ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 border-b-2 border-transparent'
        }`}
    >
        {label}
    </button>
);


// --- Main AIAnalyst Component ---
const AIAnalyst: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'proactive' | 'ask'>('proactive');

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-stone-800 shadow-md rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] p-3 rounded-lg">
                        <AIAnalystIcon className="w-8 h-8"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-stone-800 dark:text-rose-100">AI Business Analyst</h2>
                        <p className="text-stone-600 dark:text-stone-400 mt-1">
                          Your automated business consultant, powered by Gemini.
                        </p>
                    </div>
                </div>

                <div className="border-b border-gray-200 dark:border-stone-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                         <TabButton label="Proactive Insights" isActive={activeTab === 'proactive'} onClick={() => setActiveTab('proactive')} />
                         <TabButton label="Ask a Question" isActive={activeTab === 'ask'} onClick={() => setActiveTab('ask')} />
                    </nav>
                </div>
                
                <div className="mt-6">
                    {activeTab === 'proactive' && <ProactiveInsights />}
                    {activeTab === 'ask' && <AskQuestion />}
                </div>

            </div>
        </div>
    );
};

export default AIAnalyst;