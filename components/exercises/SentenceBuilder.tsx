
import React, { useState, useEffect } from 'react';

interface SentenceBuilderProps {
  prompt: string;
  content: {
    segments: string[];     
    correctOrder: string[]; 
  };
  onComplete: (success: boolean) => void;
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({ prompt, content, onComplete }) => {
  const [pool, setPool] = useState<{id: string, text: string}[]>([]);
  const [selected, setSelected] = useState<{id: string, text: string}[]>([]);
  
  useEffect(() => {
    const items = content.segments.map((text, i) => ({ id: `seg-${i}-${text}`, text }));
    setPool([...items].sort(() => Math.random() - 0.5));
    setSelected([]);
  }, [content]);

  const handleSelect = (item: {id: string, text: string}) => {
    setSelected([...selected, item]);
    setPool(pool.filter(p => p.id !== item.id));
  };

  const handleDeselect = (item: {id: string, text: string}) => {
    setPool([...pool, item]);
    setSelected(selected.filter(s => s.id !== item.id));
  };

  const checkResult = () => {
    const constructedSentence = selected.map(s => s.text).join(' ');
    const isCorrect = content.correctOrder.some(target => target === constructedSentence);
    onComplete(isCorrect);
  };

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-lg mx-auto">
      {/* The Prompt */}
      <div className="bg-indigo-50 p-6 rounded-3xl text-indigo-900 font-bold border-2 border-indigo-100 relative shadow-sm">
        <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
          Cognitive Reframe
        </div>
        <p className="text-lg leading-relaxed italic">"{prompt}"</p>
      </div>

      {/* The Construction Zone */}
      <div className="min-h-[100px] bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-wrap gap-2 items-center p-4 shadow-inner">
        {selected.map((item) => (
          <button
            key={item.id}
            onClick={() => handleDeselect(item)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:bg-rose-500 transition-all active:scale-95"
          >
            {item.text}
          </button>
        ))}
        {selected.length === 0 && (
          <span className="text-slate-300 font-bold text-sm uppercase tracking-widest mx-auto opacity-50">Tap words to build your response</span>
        )}
      </div>

      {/* The Word Bank */}
      <div className="flex flex-wrap gap-3 justify-center">
        {pool.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            className="bg-white border-2 border-slate-100 text-slate-700 px-5 py-3 rounded-2xl font-bold shadow-sm hover:border-indigo-400 hover:text-indigo-600 active:scale-90 transition-all"
          >
            {item.text}
          </button>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={checkResult}
        disabled={selected.length === 0}
        className={`
          w-full py-5 rounded-[2rem] font-black text-lg tracking-wide uppercase transition-all shadow-xl
          ${selected.length > 0 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' 
            : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}
        `}
      >
        Check Neural Path
      </button>
    </div>
  );
};
