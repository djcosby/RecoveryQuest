
import React from 'react';
import { House, Dumbbell, Library, Target, Trophy, Book, User, GraduationCap } from 'lucide-react';
import { useUserStore } from '../context/UserContext';
import { TabId } from '../types';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Academy', icon: GraduationCap, domId: 'nav-home' },
    { id: 'practice', label: 'Practice', icon: Dumbbell, domId: 'nav-practice' },
    { id: 'library', label: 'Library', icon: Library, domId: 'nav-library' },
    { id: 'quests', label: 'Quests', icon: Target, domId: 'nav-quests' },
    { id: 'league', label: 'Community', icon: Trophy, domId: 'nav-league' },
    { id: 'silverbook', label: 'Silver', icon: Book, domId: 'nav-silverbook' },
    { id: 'profile', label: 'Profile', icon: User, domId: 'nav-profile' },
  ];

  return (
    <nav className="hidden md:flex flex-col w-[260px] h-screen sticky top-0 bg-white border-r-2 border-slate-100 p-4 space-y-2">
      <div className="px-4 py-6 mb-4">
        <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">RecoveryQuest</h1>
      </div>
      
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            id={item.domId}
            onClick={() => setActiveTab(item.id as TabId)}
            className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-200 uppercase text-xs font-extrabold tracking-wide
              ${isActive 
                ? 'bg-blue-50 text-blue-500 border-2 border-blue-200 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-100 border-2 border-transparent hover:border-slate-100'}`}
          >
            <Icon size={22} strokeWidth={2.5} />
            <span className="text-sm normal-case">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
