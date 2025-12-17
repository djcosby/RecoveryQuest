import React from 'react';
import { X, Wind, Phone, MessageSquare } from 'lucide-react';

export const SOSModal: React.FC<{ onClose: () => void; onSelectAI: () => void; }> = ({ onClose, onSelectAI }) => (
    <div className="fixed inset-0 z-[100] bg-rose-900/95 flex flex-col items-center justify-center p-6 text-white animate-fade-in">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={24} /></button>
      <h2 className="text-3xl font-extrabold mb-8 tracking-tight text-center">Take a moment.</h2>
      <div className="relative mb-12">
        <div className="w-64 h-64 border-4 border-white/30 rounded-full flex items-center justify-center animate-[ping_4s_ease-in-out_infinite]">
          <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"><Wind size={64} className="text-white/80" /></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center"><span className="font-bold text-xl uppercase tracking-widest animate-pulse">Breathe In...</span></div>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <button onClick={() => window.alert("Simulating call to sponsor...")} className="w-full bg-white text-rose-600 font-extrabold py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-xl active:scale-95 transition-transform"><Phone size={20} /><span>Call Sponsor (Dave)</span></button>
        <button onClick={() => { onClose(); onSelectAI(); }} className="w-full bg-rose-800 border-2 border-rose-400/30 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-transform"><MessageSquare size={20} /><span>Chat with AI Support</span></button>
      </div>
    </div>
);