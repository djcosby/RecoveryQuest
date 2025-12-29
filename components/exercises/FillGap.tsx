
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { FillGapContent } from '../../types';

interface FillGapProps {
  prompt: string;
  content: FillGapContent;
  onComplete: (success: boolean) => void;
}

export const FillGap: React.FC<FillGapProps> = ({ prompt, content, onComplete }) => {
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activePlaceholderIdx, setActivePlaceholderIdx] = useState(0);

  // Split text into parts based on {0}, {1}, etc.
  const parts = content.textWithPlaceholder.split(/\{\d+\}/);
  const totalPlaceholders = content.placeholders.length;

  const handleSubmit = () => {
    if (Object.keys(selections).length < totalPlaceholders) return;
    setIsSubmitted(true);
    
    const isCorrect = content.placeholders.every(p => {
        const selectedValue = selections[p.index];
        const correctValue = p.options[p.correctOptionIndex];
        return selectedValue === correctValue;
    });

    setTimeout(() => onComplete(isCorrect), 1200);
  };

  const handleOptionSelect = (option: string) => {
      if (isSubmitted) return;
      setSelections(prev => ({ ...prev, [activePlaceholderIdx]: option }));
      if (activePlaceholderIdx < totalPlaceholders - 1) {
          setActivePlaceholderIdx(prev => prev + 1);
      }
  };

  const renderSentence = () => {
      const elements = [];
      for (let i = 0; i < parts.length; i++) {
          elements.push(<span key={`text-${i}`}>{parts[i]}</span>);
          if (i < totalPlaceholders) {
              const p = content.placeholders[i];
              const selected = selections[p.index];
              const isActive = activePlaceholderIdx === p.index;
              const isCorrect = isSubmitted && selected === p.options[p.correctOptionIndex];

              elements.push(
                  <button
                    key={`p-${i}`}
                    disabled={isSubmitted}
                    onClick={() => setActivePlaceholderIdx(p.index)}
                    className={`inline-block min-w-[80px] border-b-4 mx-1 px-2 transition-all font-black
                        ${isActive ? 'border-indigo-500 text-indigo-600 scale-110' : 'border-slate-200'}
                        ${isSubmitted ? (isCorrect ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600') : ''}
                    `}
                  >
                    {selected || '____'}
                  </button>
              );
          }
      }
      return elements;
  };

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-lg mx-auto">
      <div className="text-center">
        <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2">{prompt}</h3>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl text-lg md:text-xl font-bold text-slate-800 leading-relaxed text-center">
        {renderSentence()}
      </div>

      {/* Option Bank for Active Placeholder */}
      <div className="grid grid-cols-1 gap-3">
        {content.placeholders[activePlaceholderIdx].options.map((opt, idx) => {
          const isSelectedForThisSlot = selections[activePlaceholderIdx] === opt;
          return (
            <button
              key={idx}
              disabled={isSubmitted}
              onClick={() => handleOptionSelect(opt)}
              className={`p-4 rounded-2xl font-black text-sm transition-all border-2
                ${isSelectedForThisSlot 
                  ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}
              `}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(selections).length < totalPlaceholders || isSubmitted}
        className={`w-full py-5 rounded-[2rem] font-black text-lg uppercase tracking-widest transition-all shadow-xl
          ${Object.keys(selections).length === totalPlaceholders && !isSubmitted 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
            : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
        `}
      >
        Finalize Logic
      </button>
    </div>
  );
};
