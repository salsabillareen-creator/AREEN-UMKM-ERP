import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { primaryColor, darkBgColor, saveTheme } = useTheme();
  
  const [currentPrimary, setCurrentPrimary] = useState(primaryColor);
  const [currentDarkBg, setCurrentDarkBg] = useState(darkBgColor);

  useEffect(() => {
    setCurrentPrimary(primaryColor);
    setCurrentDarkBg(darkBgColor);
  }, [primaryColor, darkBgColor]);

  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentPrimary(newColor);
    document.documentElement.style.setProperty('--color-primary', newColor);
  };
  
  const handleDarkBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentDarkBg(newColor);
    document.documentElement.style.setProperty('--color-dark-bg', newColor);
  };
  
  const handleSave = () => {
    saveTheme({ primary: currentPrimary, darkBg: currentDarkBg });
  };
  
  const handleReset = () => {
      setCurrentPrimary(primaryColor);
      setCurrentDarkBg(darkBgColor);
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-dark-bg', darkBgColor);
  };

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-stone-800 shadow-md rounded-lg p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-stone-800 dark:text-rose-100 mb-6">Settings</h2>
        
        <div className="space-y-8">
          {/* Company Profile Section */}
          <div>
            <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-200 border-b dark:border-stone-700 pb-2 mb-4">Company Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Company Name</label>
                <input type="text" defaultValue="AcctPro Inc." className="mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-stone-800 dark:text-stone-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Contact Email</label>
                <input type="email" defaultValue="contact@acctpro.com" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-stone-800 dark:text-stone-200" />
              </div>
            </div>
          </div>

          {/* Theme Customization Section */}
           <div>
              <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-200 border-b dark:border-stone-700 pb-2 mb-4">Theme Colors</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Customize the look and feel of the application. Changes are previewed live.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <label htmlFor="primary-color" className="block text-sm font-medium text-stone-600 dark:text-stone-300">Primary Color</label>
                  <div className="relative">
                    <input id="primary-color" type="color" value={currentPrimary} onChange={handlePrimaryChange} className="w-24 h-10 p-1 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md cursor-pointer" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="dark-bg-color" className="block text-sm font-medium text-stone-600 dark:text-stone-300">Dark Background Color</label>
                   <div className="relative">
                    <input id="dark-bg-color" type="color" value={currentDarkBg} onChange={handleDarkBgChange} className="w-24 h-10 p-1 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

          {/* Notifications Section */}
          <div>
            <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-200 border-b dark:border-stone-700 pb-2 mb-4">Notifications</h3>
            <div className="flex items-center">
              <input id="email-notifications" type="checkbox" defaultChecked className="h-4 w-4 text-[var(--color-primary)] border-stone-300 rounded focus:ring-[var(--color-primary)]" />
              <label htmlFor="email-notifications" className="ml-2 block text-sm text-stone-700 dark:text-stone-300">Enable Email Notifications</label>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t dark:border-stone-700 flex justify-end gap-3">
           <button type="button" onClick={handleReset} className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow hover:bg-rose-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;