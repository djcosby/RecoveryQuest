
import React, { useState } from 'react';
import { WellnessDimension } from '../../types';
import { FEELINGS_DB } from '../../data/emotions';
import { ArrowRight, Check } from 'lucide-react';

export const CheckInModal: React.FC<{ onClose: () => void; onComplete: () => void; }> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<string | null>(null);
  const [specificEmotion, setSpecificEmotion] = useState<string | null>(null);

  const DIMENSIONS: {id: WellnessDimension, label: string, icon: string}[] = [
    { id: 'Emotional', label: 'Emotional', icon: '🧠' },
    { id: 'Physical', label: 'Physical', icon: '🏃' },
    { id: 'Social', label: 'Social', icon: '👥' },
    { id: 'Spiritual', label: 'Spiritual', icon: '✨' },
    { id: 'Financial', label: 'Financial', icon: '💰' },
    { id: 'Occupational', label: 'Occupational', icon: '💼' },
    { id: 'Intellectual', label: 'Intellectual', icon: '📚' },
    { id: 'Environmental', label: 'Environ.', icon: '🏡' },
  ];

  const MOODS = [
    { icon: '😊', label: 'Strong', color: 'bg-emerald-100 border-emerald-200 text-emerald-700', mapping: ['Glad'] },
    { icon: '😐', label: 'Okay', color: 'bg-blue-100 border-blue-200 text-blue-700', mapping: ['Glad', 'Mad', 'Sad', 'Fear'] }, // Okay allows all, or neutral?
    { icon: '😓', label: 'Anxious', color: 'bg-orange-100 border-orange-200 text-orange-700', mapping: ['Fear', 'Shame'] },
    { icon: '😤', label: 'Struggling', color: 'bg-rose-100 border-rose-200 text-rose-700', mapping: ['Mad', 'Sad', 'Shame', 'Fear'] },
  ];

  const handleMoodSelect = (selectedMoodLabel: string) => {
    setMood(selectedMoodLabel);
    setStep(1.5); // Go to granular step
  };

  const getGranularOptions = () => {
      const selectedMood = MOODS.find(m => m.label === mood);
      if (!selectedMood) return [];
      
      if (mood === 'Okay') {
          // Limit 'Okay' to lower intensity or neutral-ish ones if we had intensity in DB, for now show random mix or all?
          // Let's show specific ones relevant to "Okay" (maybe Serenity, Boredom)
          return FEELINGS_DB.filter(f => ['Serenity', 'Boredom', 'Hopeful'].includes(f.name));
      }

      return FEELINGS_DB.filter(f => selectedMood.mapping.includes(f.parent));
  };

  const handleGranularSelect = (emotionName: string) => {
      setSpecificEmotion(emotionName);
      setStep(2);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-zoom-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
        {step === 1 && (
            <>
                <div className="text-center mb-6">
                <h3 className="text-xl font-extrabold text-slate-800">Daily Check-in</h3>
                <p className="text-slate-500 text-sm font-medium">How are you feeling right now?</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                {MOODS.map((m) => (
                    <button
                    key={m.label}
                    onClick={() => handleMoodSelect(m.label)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 transition-transform hover:scale-105 active:scale-95 ${m.color}`}
                    >
                    <span className="text-3xl">{m.icon}</span>
                    <span className="font-bold text-sm">{m.label}</span>
                    </button>
                ))}
                </div>
            </>
        )}

        {step === 1.5 && (
            <div className="animate-slide-in-right">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-extrabold text-slate-800">Go Deeper</h3>
                    <p className="text-slate-500 text-sm font-medium">Can you name the specific feeling?</p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {getGranularOptions().map(f => (
                        <button
                            key={f.id}
                            onClick={() => handleGranularSelect(f.name)}
                            className="px-4 py-2 rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 font-bold text-slate-600 text-sm transition-all"
                        >
                            {f.name}
                        </button>
                    ))}
                    <button onClick={() => setStep(2)} className="px-4 py-2 text-slate-400 font-bold text-xs">Skip</button>
                </div>
            </div>
        )}

        {step === 2 && (
             <div className="animate-slide-in-right">
                <div className="text-center mb-6">
                <h3 className="text-xl font-extrabold text-slate-800">Identify the Source</h3>
                <p className="text-slate-500 text-sm font-medium">Which wellness dimension needs attention?</p>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6">
                    {DIMENSIONS.map((dim) => (
                        <button
                            key={dim.id}
                            onClick={onComplete}
                            className="flex flex-col items-center justify-center p-2 rounded-xl border-2 border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                        >
                            <span className="text-xl mb-1">{dim.icon}</span>
                            <span className="text-[9px] font-bold uppercase truncate w-full text-center">{dim.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}
        <button onClick={onClose} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600">Close</button>
      </div>
    </div>
  );
};
