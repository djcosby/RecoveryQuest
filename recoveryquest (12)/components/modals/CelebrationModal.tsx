import React from 'react';
import { Trophy } from 'lucide-react';

export const CelebrationModal: React.FC<{ title: string; subtitle: string; onClose: () => void; }> = ({ title, subtitle, onClose }) => (
    <div className="fixed inset-0 z-[60] bg-slate-900/90 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-yellow-400 opacity-10 animate-pulse"></div>
        <div className="relative z-10">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 relative"><Trophy size={48} className="text-yellow-600" /></div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-600 font-medium mb-8">{subtitle}</p>
            <button onClick={onClose} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all">Continue Journey</button>
        </div>
      </div>
    </div>
);