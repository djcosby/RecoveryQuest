import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { RecoveryTool } from '../../types';

export const StudyModal: React.FC<{ tool: RecoveryTool; onClose: () => void; onComplete: () => void; }> = ({ tool, onClose, onComplete }) => (
    <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20} className="text-slate-500" /></button>
        <div className="p-8 text-center">
            <div className="w-20 h-20 bg-indigo-50 border-4 border-indigo-100 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto animate-bounce">{tool.icon}</div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-1">{tool.name}</h2>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-6">Study Card</p>
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 mb-8 text-left"><p className="text-slate-600 font-medium leading-relaxed">{tool.studyContent}</p></div>
            <button onClick={onComplete} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center space-x-2"><BookOpen size={20} /><span>Mark as Studied (+15 XP)</span></button>
        </div>
      </div>
    </div>
);
