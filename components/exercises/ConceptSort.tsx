
import React, { useState } from 'react';
import { ArrowDown, CheckCircle2, AlertCircle } from 'lucide-react';

interface ConceptSortProps {
  prompt: string;
  content: {
    buckets: { id: string; label: string }[];
    items: { id: string; text: string; bucketId: string }[];
  };
  onComplete: (success: boolean) => void;
}

export const ConceptSort: React.FC<ConceptSortProps> = ({ prompt, content, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ itemId: string; isCorrect: boolean }[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'error' | null>(null);

  const currentItem = content.items[currentIndex];

  const handleSort = (bucketId: string) => {
    if (feedback) return;

    const isCorrect = bucketId === currentItem.bucketId;
    setResults([...results, { itemId: currentItem.id, isCorrect }]);
    setFeedback(isCorrect ? 'correct' : 'error');

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < content.items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const accuracy = results.filter(r => r.isCorrect).length / content.items.length;
        onComplete(accuracy >= 0.7); // Pass if 70%+ accurate
      }
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-lg mx-auto">
      <div className="text-center">
        <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2">{prompt}</h3>
        <div className="flex justify-center gap-1">
          {content.items.map((_, idx) => (
            <div key={idx} className={`h-1.5 w-6 rounded-full ${idx === currentIndex ? 'bg-indigo-500' : idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      <div className="h-48 flex items-center justify-center relative">
        <div className={`
          p-8 bg-white rounded-[2.5rem] border-4 shadow-2xl text-center transition-all duration-300 transform
          ${feedback === 'correct' ? 'border-emerald-500 scale-90 opacity-0' : feedback === 'error' ? 'border-rose-500 scale-90 opacity-0' : 'border-indigo-100 scale-100 opacity-100'}
        `}>
          <p className="text-2xl font-black text-slate-800">{currentItem.text}</p>
        </div>
        {feedback === 'correct' && <CheckCircle2 className="absolute text-emerald-500 w-20 h-20 animate-ping" />}
        {feedback === 'error' && <AlertCircle className="absolute text-rose-500 w-20 h-20 animate-ping" />}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {content.buckets.map((bucket) => (
          <button
            key={bucket.id}
            onClick={() => handleSort(bucket.id)}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-full py-6 bg-slate-100 rounded-3xl border-2 border-slate-200 group-hover:border-indigo-500 group-hover:bg-indigo-50 transition-all text-center">
              <ArrowDown className="mx-auto mb-2 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              <span className="font-black text-sm uppercase tracking-widest text-slate-600 group-hover:text-indigo-700">
                {bucket.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
