
// App.tsx

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import Sales from './views/Sales';
import SalesOrders from './views/SalesOrders';
import Purchases from './views/Purchases';
import Inventory from './views/Inventory';
import Reports from './views/Reports';
import Settings from './views/Settings';
import Chatbot from './components/Chatbot';
import AIAnalyst from './views/AIAnalyst';
import CRM from './views/CRM';
import CashFlow from './views/CashFlow';
import Projects from './views/Projects'; 
import HR from './views/HR'; 
import DataGenerator from './views/DataGenerator';
import { ThemeProvider } from './contexts/ThemeContext';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setCurrentView={setCurrentView} />;
      case 'sales':
        return <Sales />;
      case 'sales-orders':
        return <SalesOrders />;
      case 'crm':
        return <CRM />;
      case 'purchases':
        return <Purchases />;
      case 'inventory':
        return <Inventory />;
      case 'reports':
        return <Reports />;
      case 'cash-flow':
        return <CashFlow />;
      case 'ai-analyst':
        return <AIAnalyst />;
      case 'projects':
        return <Projects />;
      case 'hr':
        return <HR />;
      case 'settings':
        return <Settings />;
      case 'data-generator':
        return <DataGenerator />;
      default:
        // Set dashboard as the default view
        setCurrentView('dashboard');
        return <Dashboard setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[var(--color-dark-bg)] text-stone-800 dark:text-stone-200">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col ml-60">
        <Header setCurrentView={setCurrentView} />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
      <Chatbot />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;