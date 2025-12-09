// components/Sidebar.tsx

import React from 'react';
import { SalesIcon, InventoryIcon, AccountingIcon, ProjectsIcon, HRIcon, SettingsIcon, LogoutIcon, AIAnalystIcon, UsersIcon, TrendingUpIcon, PurchasesIcon, LayoutGridIcon, SparklesIcon } from './icons';

interface NavItem {
  name: string;
  view: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', view: 'dashboard', icon: LayoutGridIcon },
  { name: 'Sales', view: 'sales', icon: SalesIcon },
  { name: 'Purchases', view: 'purchases', icon: PurchasesIcon },
  { name: 'Inventory', view: 'inventory', icon: InventoryIcon },
  { name: 'Accounting', view: 'reports', icon: AccountingIcon },
  { name: 'Projects', view: 'projects', icon: ProjectsIcon },
  { name: 'HR', view: 'hr', icon: HRIcon },
  { name: 'CRM', view: 'crm', icon: UsersIcon },
  { name: 'Cash Flow', view: 'cash-flow', icon: TrendingUpIcon },
  { name: 'AI Analyst', view: 'ai-analyst', icon: AIAnalystIcon },
  { name: 'Data Generator', view: 'data-generator', icon: SparklesIcon },
];

const bottomNavItems: NavItem[] = [
    { name: 'Settings', view: 'settings', icon: SettingsIcon },
    { name: 'Logout', view: 'logout', icon: LogoutIcon },
]

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <aside className="w-60 bg-[#1f2937] text-gray-400 flex flex-col h-screen fixed">
      {/* Header removed and moved to Header.tsx */}
      <div className="h-20"></div> {/* Placeholder for alignment with header */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {mainNavItems.map((item) => (
          <a
            key={item.view}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView(item.view);
            }}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
              currentView === item.view
                ? 'bg-[var(--color-primary)] text-white font-semibold shadow-lg'
                : 'hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="ml-4">{item.name}</span>
          </a>
        ))}
      </nav>
      <div className="px-4 py-6 border-t border-gray-700 space-y-2">
        {bottomNavItems.map((item) => (
            <a
            key={item.view}
            href="#"
            onClick={(e) => {
                e.preventDefault();
                if (item.view === 'logout') {
                    // Handle logout logic here, for now, we can just log it
                    console.log("User logged out");
                } else {
                    setCurrentView(item.view);
                }
            }}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
              currentView === item.view
                ? 'bg-[var(--color-primary)] text-white font-semibold'
                : 'hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="ml-4">{item.name}</span>
          </a>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;