
import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { MatchPairContent } from '../../types';

interface MatchingGameProps {
  prompt: string;
  items: { id: string; left: string; right: string }[];
  onComplete: () => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ prompt, items, onComplete }) => {
  const [selectedId, setSelectedId] = useState<{side: 'left' | 'right', id: string} | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [errorId, setErrorId] = useState<string | null>(null);
  
  const [leftCol, setLeftCol] = useState<{id: string, text: string}[]>([]);
  const [rightCol, setRightCol] = useState<{id: string, text: string}[]>([]);

  useEffect(() => {
    setLeftCol([...items.map(i => ({ id: i.id, text: i.left }))].sort(() => Math.random() - 0.5));
    setRightCol([...items.map(i => ({ id: i.id, text: i.right }))].sort(() => Math.random() - 0.5));
  }, [items]);

  const handleCardClick = (side: 'left' | 'right', id: string) => {
    if (errorId) return;
    if (matchedIds.includes(id)) return;

    if (!selectedId) {
      setSelectedId({ side, id });
    } else {
      if (selectedId.side === side) {
        setSelectedId({ side, id }); // Switch selection on same side
        return;
      }

      if (selectedId.id === id) {
        // Match!
        const newMatched = [...matchedIds, id];
        setMatchedIds(newMatched);
        setSelectedId(null);
        if (newMatched.length === items.length) {
          setTimeout(onComplete, 1000);
        }
      } else {
        // Error
        setErrorId(id);
        setTimeout(() => {
          setErrorId(null);
          setSelectedId(null);
        }, 600);
      }
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
        <div className="text-center mb-6">
            <h3 className="font-extrabold text-slate-700 text-lg">{prompt}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                {matchedIds.length} / {items.length} Associations Built
            </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-3">
                {leftCol.map((item) => {
                    const isSelected = selectedId?.side === 'left' && selectedId.id === item.id;
                    const isMatched = matchedIds.includes(item.id);
                    const isError = errorId && selectedId?.side === 'right' && selectedId.id === item.id;

                    return (
                        <button
                            key={`left-${item.id}`}
                            disabled={isMatched}
                            onClick={() => handleCardClick('left', item.id)}
                            className={`w-full p-4 rounded-2xl border-b-4 font-bold text-sm min-h-[70px] transition-all
                                ${isMatched ? 'bg-emerald-50 border-emerald-500 text-emerald-700 opacity-60' : 
                                  isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-200 scale-105 shadow-md' :
                                  'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}
                            `}
                        >
                            {isMatched ? <CheckCircle className="mx-auto" size={20} /> : item.text}
                        </button>
                    );
                })}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
                {rightCol.map((item) => {
                    const isSelected = selectedId?.side === 'right' && selectedId.id === item.id;
                    const isMatched = matchedIds.includes(item.id);
                    const isError = errorId === item.id;

                    return (
                        <button
                            key={`right-${item.id}`}
                            disabled={isMatched}
                            onClick={() => handleCardClick('right', item.id)}
                            className={`w-full p-4 rounded-2xl border-b-4 font-bold text-sm min-h-[70px] transition-all
                                ${isMatched ? 'bg-emerald-50 border-emerald-500 text-emerald-700 opacity-60' : 
                                  isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-200 scale-105 shadow-md' :
                                  'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}
                                ${isError ? 'animate-shake bg-rose-50 border-rose-500' : ''}
                            `}
                        >
                            {isMatched ? <CheckCircle className="mx-auto" size={20} /> : item.text}
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
  );
};
