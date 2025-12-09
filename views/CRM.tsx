// views/CRM.tsx

import React, { useState, useEffect } from 'react';
import { MOCK_DEALS, MOCK_PIPELINE_STAGES } from '../constants';
import { Deal, DealStatus } from '../types';
import { geminiService } from '../services/geminiService';
import { formatCurrency } from '../utils/formatting';
import { PlusIcon } from '../components/icons';

const stageColors: { [key in DealStatus]: string } = {
  [DealStatus.Prospect]: 'border-t-gray-400',
  [DealStatus.Qualification]: 'border-t-blue-500',
  [DealStatus.Negotiation]: 'border-t-yellow-500',
  [DealStatus.Won]: 'border-t-green-500',
  [DealStatus.Lost]: 'border-t-red-500',
};

interface DealCardProps {
    deal: Deal;
}

const DealCard: React.FC<DealCardProps> = ({ deal: initialDeal }) => {
    const [deal, setDeal] = useState(initialDeal);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchAIData = async () => {
            setIsLoading(true);
            const { score, action } = await geminiService.getLeadScoreAndNextAction(deal.name, deal.value);
            setDeal(prev => ({ ...prev, leadScore: score, nextAction: action }));
            setIsLoading(false);
        };
        fetchAIData();
    }, [initialDeal.id]);

    const leadScoreColor = deal.leadScore && deal.leadScore > 75 ? 'text-green-500' : deal.leadScore && deal.leadScore > 50 ? 'text-yellow-500' : 'text-gray-400';

    return (
        <div className="bg-white dark:bg-stone-800 p-4 rounded-lg shadow-md mb-4 border-l-4 border-gray-300 dark:border-stone-600 hover:shadow-lg transition-shadow">
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100">{deal.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{deal.company}</p>
            <p className="text-lg font-semibold text-[var(--color-primary)] mt-2">{formatCurrency(deal.value)}</p>
            {isLoading ? (
                <div className="mt-3 h-10 animate-pulse bg-gray-200 dark:bg-stone-700 rounded"></div>
            ) : (
                <div className="mt-3 text-xs bg-gray-50 dark:bg-stone-700/50 p-2 rounded">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">Lead Score:</span>
                        <span className={`font-bold text-base ${leadScoreColor}`}>{deal.leadScore}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1"><span className="font-semibold">Next Action:</span> {deal.nextAction}</p>
                </div>
            )}
        </div>
    );
};


const CRM: React.FC = () => {
    const dealsByStage = MOCK_PIPELINE_STAGES.map(stage => ({
        stage,
        deals: MOCK_DEALS.filter(deal => deal.status === stage),
    }));

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Sales Pipeline</h1>
                <button className="bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:brightness-95 transition shadow-md">
                    <PlusIcon />
                    <span>New Deal</span>
                </button>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4">
                {dealsByStage.map(({ stage, deals }) => (
                    <div key={stage} className="flex-shrink-0 w-72 bg-gray-100 dark:bg-stone-900/50 rounded-xl p-3">
                        <div className={`px-2 py-1 mb-3 border-t-4 ${stageColors[stage]}`}>
                            <h3 className="font-bold text-gray-700 dark:text-gray-200">{stage}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{deals.length} deals</p>
                        </div>
                        <div className="h-full overflow-y-auto">
                            {deals.map(deal => (
                                <DealCard key={deal.id} deal={deal} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CRM;