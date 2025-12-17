import React, { useState } from 'react';
import { Brain, X, ArrowRight } from 'lucide-react';
import { PersonalityProfile } from '../../types';
import { ASSESSMENT_QUESTIONS, PERSONALITY_ARCHETYPES } from '../../constants';

export const AssessmentModal: React.FC<{ onClose: () => void; onComplete: (profile: PersonalityProfile) => void; }> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const currentQuestion = ASSESSMENT_QUESTIONS[step];
  const isLastQuestion = step === ASSESSMENT_QUESTIONS.length - 1;

  const handleAnswer = (traitValue: string) => {
    const category = currentQuestion.category;
    setAnswers(prev => ({ ...prev, [category]: traitValue }));
    if (!isLastQuestion) setTimeout(() => setStep(prev => prev + 1), 250);
    else calculateResult({ ...answers, [category]: traitValue });
  };

  const calculateResult = (finalAnswers: Record<string, string>) => {
    setIsCalculating(true);
    const energy = finalAnswers['Energy'] || 'I';
    const info = finalAnswers['Information'] || 'N';
    const decisions = finalAnswers['Decisions'] || 'T';
    const structure = finalAnswers['Structure'] || 'J';
    const code = `${energy}${info}${decisions}${structure}`;
    const archetype = PERSONALITY_ARCHETYPES[code] || PERSONALITY_ARCHETYPES['INTJ'];
    const profile: PersonalityProfile = {
      code, title: archetype.title,
      traits: {
        energy: energy === 'I' ? 'Introverted' : 'Extraverted',
        mind: info === 'N' ? 'Intuitive' : 'Observant',
        nature: decisions === 'T' ? 'Thinking' : 'Feeling',
        tactics: structure === 'J' ? 'Judging' : 'Prospecting',
      },
      strengths: archetype.strengths,
      riskAreas: archetype.riskAreas
    };
    setTimeout(() => onComplete(profile), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><Brain size={20} /></div>
            <div><h3 className="font-extrabold text-slate-800">The Mirror</h3></div>
          </div>
          {!isCalculating && <button onClick={onClose}><X size={20} className="text-slate-400" /></button>}
        </div>
        <div className="p-8 flex-1 flex flex-col justify-center items-center text-center relative">
          {isCalculating ? (
             <div className="space-y-6 animate-fade-in">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                <div><h3 className="text-xl font-extrabold text-slate-800">Analyzing Profile...</h3></div>
             </div>
          ) : (
            <div className="w-full max-w-md animate-slide-in-right" key={step}>
               <div className="mb-8"><h2 className="text-2xl font-bold text-slate-800 leading-tight">{currentQuestion.text}</h2></div>
               <div className="space-y-4">
                 {currentQuestion.options.map((option, idx) => (
                   <button key={idx} onClick={() => handleAnswer(option.traitValue)} className="w-full p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-left transition-all group flex items-center justify-between">
                     <span className="font-bold text-slate-600 group-hover:text-indigo-700">{option.text}</span>
                     <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};