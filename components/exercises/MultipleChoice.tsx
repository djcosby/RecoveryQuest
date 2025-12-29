
import React, { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { MultipleChoiceContent } from '../../types';

interface MultipleChoiceProps {
  prompt: string;
  content: MultipleChoiceContent;
  onComplete: (success: boolean) => void;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({ prompt, content, onComplete }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedId) return;
    setIsSubmitted(true);
    const selectedOption = content.options.find(o => o.id === selectedId);
    setTimeout(() => onComplete(!!selectedOption?.isCorrect), 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2">Challenge</h3>
        <p className="text-xl font-bold text-slate-800">{prompt}</p>
      </div>

      <div className="space-y-3">
        {content.options.map((option) => {
          const isSelected = selectedId === option.id;
          let variantClasses = "bg-white border-slate-100 text-slate-600 hover:border-indigo-300";
          
          if (isSubmitted) {
            if (option.isCorrect) variantClasses = "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-100";
            else if (isSelected) variantClasses = "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-100";
            else variantClasses = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
          } else if (isSelected) {
            variantClasses = "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-100 shadow-md";
          }

          return (
            <button
              key={option.id}
              disabled={isSubmitted}
              onClick={() => setSelectedId(option.id)}
              className={`w-full p-5 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${variantClasses}`}
            >
              <span>{option.text}</span>
              {isSubmitted && option.isCorrect && <CheckCircle size={20} className="text-emerald-500" />}
              {isSubmitted && isSelected && !option.isCorrect && <XCircle size={20} className="text-rose-500" />}
            </button>
          );
        })}
      </div>

      {isSubmitted && selectedId && (
          <div className="p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl animate-slide-in-bottom">
              <p className="text-sm font-bold text-indigo-800">
                  {content.options.find(o => o.id === selectedId)?.explanation || "Reviewing concepts builds mental resilience."}
              </p>
          </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedId || isSubmitted}
        className={`w-full py-5 rounded-[2rem] font-black text-lg uppercase tracking-widest transition-all shadow-xl
          ${selectedId && !isSubmitted 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
            : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
        `}
      >
        Submit Selection
      </button>
    </div>
  );
};
