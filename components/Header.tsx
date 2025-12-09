import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, NotificationIcon, MessageIcon, AuroraLogoIcon, SettingsIcon, LogoutIcon } from './icons';

interface HeaderProps {
  setCurrentView: (view: string) => void;
}

const useOutsideClick = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback]);
};

const Header: React.FC<HeaderProps> = ({ setCurrentView }) => {
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [isMessagesOpen, setMessagesOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);

    const notificationsRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    
    useOutsideClick(notificationsRef, () => setNotificationsOpen(false));
    useOutsideClick(messagesRef, () => setMessagesOpen(false));
    useOutsideClick(profileRef, () => setProfileOpen(false));

  return (
    <header className="bg-white flex items-center justify-between h-20 px-8 border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center gap-3">
             <AuroraLogoIcon className="w-8 h-8 text-[var(--color-primary)]" />
             <h1 className="text-xl font-bold text-gray-800 tracking-wider">AREEN AI ERP</h1>
        </div>
      
        <div className="w-full max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="text-gray-400 w-5 h-5" />
            </div>
            <input 
                type="text"
                placeholder="Search with AI..."
                className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
            />
        </div>

        <div className="flex items-center space-x-6">
            <div className="relative" ref={notificationsRef}>
                <button onClick={() => setNotificationsOpen(p => !p)} className="text-gray-500 hover:text-gray-800 transition relative">
                    <NotificationIcon />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </button>
                {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-40">
                        <div className="p-3 font-semibold text-sm border-b">Notifications</div>
                        <div className="py-1">
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Stok Quantum Widget diperbarui. <span className="text-xs text-gray-400 block">2 hours ago</span></a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Invoice I-456 lunas. <span className="text-xs text-gray-400 block">1 day ago</span></a>
                        </div>
                    </div>
                )}
            </div>
            <div className="relative" ref={messagesRef}>
                <button onClick={() => setMessagesOpen(p => !p)} className="text-gray-500 hover:text-gray-800 transition">
                    <MessageIcon />
                </button>
                 {isMessagesOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-40">
                        <div className="p-3 font-semibold text-sm border-b">Messages</div>
                        <div className="py-1">
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">From: Diana - Project "Phoenix" update...</a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">From: Clark - Q4 budget proposal.</a>
                        </div>
                    </div>
                )}
            </div>
            <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(p => !p)} className="w-10 h-10 block rounded-full overflow-hidden border-2 border-transparent hover:border-[var(--color-primary)] transition">
                    <img 
                        className="object-cover w-full h-full" 
                        src="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
                        alt="User" 
                    />
                </button>
                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-40 py-1">
                        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('settings'); setProfileOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><SettingsIcon className="w-4 h-4" /> Settings</a>
                        <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><LogoutIcon className="w-4 h-4" /> Logout</a>
                    </div>
                )}
            </div>
        </div>
    </header>
  );
};

export default Header;