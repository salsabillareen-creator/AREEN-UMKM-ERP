import React from 'react';

interface CardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, change, changeType, icon }) => {
  const changeColor = changeType === 'positive' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-gradient-to-br from-white to-rose-50 dark:from-stone-800 dark:to-stone-900/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</p>
        <p className="text-3xl font-bold text-stone-800 dark:text-rose-100 mt-1">{value}</p>
        {change && (
          <p className={`text-xs mt-2 ${changeColor}`}>
            {change} vs last month
          </p>
        )}
      </div>
      <div className="bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/20 text-[var(--color-primary)] p-3 rounded-full">
        {icon}
      </div>
    </div>
  );
};

export default Card;
