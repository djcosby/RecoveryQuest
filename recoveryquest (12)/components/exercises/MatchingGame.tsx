
import React, { useState, useEffect } from 'react';
import { CheckCircle, RefreshCcw } from 'lucide-react';

interface MatchingGameProps {
  prompt: string;
  items: { id: string; text: string; matchId?: string }[];
  onComplete: () => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ prompt, items, onComplete }) => {
  const [shuffledItems, setShuffledItems] = useState(items);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [errorId, setErrorId] = useState<string | null>(null);

  useEffect(() => {
    // Shuffle items so pairs aren't strictly adjacent
    setShuffledItems([...items].sort(() => Math.random() - 0.5));
  }, [items]);

  const handleCardClick = (id: string, matchId?: string) => {
    if (errorId) return; // Wait for error animation to finish
    if (matchedIds.includes(id)) return; // Ignore if already matched

    if (!selectedId) {
      // First selection
      setSelectedId(id);
    } else {
      if (selectedId === id) {
        setSelectedId(null); // Deselect if clicking same item
        return;
      }

      // Check for match
      const first = items.find(i => i.id === selectedId);
      const second = items.find(i => i.id === id);

      if (first && second && (first.matchId === second.id || second.matchId === first.id)) {
        // Success: Match found
        const newMatched = [...matchedIds, first.id, second.id];
        setMatchedIds(newMatched);
        setSelectedId(null);
        
        // Check if all pairs are matched
        if (newMatched.length === items.length) {
          setTimeout(onComplete, 1000);
        }
      } else {
        // Failure: No match
        setErrorId(id);
        setTimeout(() => {
          setErrorId(null);
          setSelectedId(null);
        }, 600);
      }
    }
  };

  const isGameComplete = matchedIds.length === items.length;

  return (
    <div className="space-y-4 animate-fade-in">
        <div className="text-center mb-4">
            <h3 className="font-extrabold text-slate-700 text-lg">{prompt}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                {matchedIds.length / 2} / {items.length / 2} Pairs Matched
            </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
            {shuffledItems.map((item) => {
                const isSelected = selectedId === item.id;
                const isMatched = matchedIds.includes(item.id);
                const isError = errorId === item.id || (errorId && selectedId === item.id);

                let baseStyle = "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 shadow-sm";
                if (isSelected) baseStyle = "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-200 scale-105 shadow-md";
                if (isMatched) baseStyle = "bg-emerald-50 border-emerald-500 text-emerald-700 opacity-60 cursor-default shadow-none";
                if (isError) baseStyle = "bg-rose-50 border-rose-500 text-rose-700 animate-pulse";

                return (
                    <button
                        key={item.id}
                        disabled={isMatched}
                        onClick={() => handleCardClick(item.id, item.matchId)}
                        className={`p-4 rounded-2xl border-b-4 font-bold text-sm min-h-[80px] flex items-center justify-center transition-all duration-200 active:scale-95 ${baseStyle}`}
                    >
                        {isMatched ? <CheckCircle size={24} /> : item.text}
                    </button>
                );
            })}
        </div>

        {isGameComplete && (
            <div className="mt-4 p-4 bg-emerald-100 border-2 border-emerald-200 rounded-2xl text-center text-emerald-700 font-extrabold animate-zoom-in">
                🎉 Perfect Match!
            </div>
        )}
    </div>
  );
};
