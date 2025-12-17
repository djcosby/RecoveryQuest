
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
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 active:scale-95 ${
        isActive ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
        <Icon size={isActive ? 26 : 24} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
};
