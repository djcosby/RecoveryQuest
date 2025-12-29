
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface FlashCardProps {
  content: {
    front: string;
    back: string;
  };
  onComplete: () => void;
}

export const FlashCard: React.FC<FlashCardProps> = ({ content, onComplete }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-10 animate-fade-in">
      <div 
        onClick={() => setFlipped(!flipped)}
        className="w-full max-w-sm h-72 cursor-pointer perspective-1000 group"
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 bg-white border-4 border-indigo-100 rounded-[3rem] flex flex-col items-center justify-center p-8 backface-hidden shadow-2xl">
            <span className="text-5xl mb-6">🧠</span>
            <h3 className="text-3xl font-black text-slate-800 text-center leading-tight">{content.front}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-8">Tap to flip</p>
          </div>
          
          {/* Back */}
          <div className="absolute inset-0 bg-indigo-600 border-4 border-indigo-500 rounded-[3rem] flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 text-white shadow-2xl">
            <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em] mb-4">Architect's Insight</h4>
            <p className="text-xl font-bold text-center leading-relaxed italic">"{content.back}"</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onComplete}
        disabled={!flipped}
        className={`px-12 py-4 rounded-full font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl
        ${flipped ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
      >
        Got it, move on
      </button>
    </div>
  );
};
