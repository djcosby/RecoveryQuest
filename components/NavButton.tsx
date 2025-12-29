
import React from 'react';
import { TabId } from '../types';

interface NavButtonProps {
  id: TabId;
  icon: any;
  label: string;
  activeTab: TabId;
  setActiveTab: (id: TabId) => void;
  domId?: string;
}

export const NavButton: React.FC<NavButtonProps> = ({ id, icon: Icon, label, activeTab, setActiveTab, domId }) => {
  const isActive = activeTab === id;
  return (
    <button
      id={domId}
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center flex-1 py-2 px-1 transition-all duration-200 relative group
        ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}
      `}
    >
      <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
        <Icon size={20} strokeWidth={isActive ? 3 : 2} />
      </div>
      
      {/* Label - hidden on tiny screens, visible on small+ */}
      <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 hidden sm:block ${isActive ? 'opacity-100' : 'opacity-70'}`}>
        {label}
      </span>

      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-indigo-600 rounded-full animate-fade-in" />
      )}
    </button>
  );
};
