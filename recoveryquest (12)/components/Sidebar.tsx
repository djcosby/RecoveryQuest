
import React from 'react';
import { Home, Trophy, Book, User, Settings, LogOut, Target, Library, Dumbbell } from 'lucide-react';
import { TabId } from '../types';
import { useUserStore } from '../context/UserContext';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onSettings }) => {
  const { logout } = useUserStore();

  const NAV_ITEMS: { id: TabId; label: string; icon: any }[] = [
    { id: 'home', label: 'Path', icon: Home },
    { id: 'practice', label: 'Practice', icon: Dumbbell },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'quests', label: 'Quests', icon: Target },
    { id: 'league', label: 'Community', icon: Trophy }, // Renamed for clarity since it combines feed/league
    { id: 'silverbook', label: 'Silver', icon: Book },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="hidden md:flex flex-col h-screen w-[250px] border-r-2 border-slate-200 bg-white p-4 sticky top-0">
      <div className="px-4 py-6 mb-4">
        <h1 className="text-2xl font-extrabold text-emerald-600 tracking-tighter flex items-center gap-2">
            <span className="text-3xl">🦁</span> RecoveryQuest
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            id={`nav-${item.id}`}
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-200 uppercase text-xs font-extrabold tracking-wide
              ${activeTab === item.id 
                ? 'bg-blue-50 text-blue-500 border-2 border-blue-200' 
                : 'text-slate-500 hover:bg-slate-100 border-2 border-transparent hover:border-slate-100'}`}
          >
            <item.icon size={22} strokeWidth={2.5} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-6 border-t-2 border-slate-100">
        <button 
            onClick={onSettings}
            className="w-full flex items-center space-x-4 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-100 transition-colors font-bold text-sm"
        >
            <Settings size={20} />
            <span>Settings</span>
        </button>
        <button 
            onClick={logout}
            className="w-full flex items-center space-x-4 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-colors font-bold text-sm"
        >
            <LogOut size={20} />
            <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
