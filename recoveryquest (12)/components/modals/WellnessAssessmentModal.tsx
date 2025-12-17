
import React, { useState } from 'react';
import { X, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import { WellnessDimension, WellnessScores } from '../../types';
import { WELLNESS_DIMENSION_QUESTIONS } from '../../constants';

export const WellnessAssessmentModal: React.FC<{ onClose: () => void; onComplete: (scores: WellnessScores) => void; }> = ({ onClose, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const question = WELLNESS_DIMENSION_QUESTIONS[currentQuestionIndex];
  const progress = (currentQuestionIndex / WELLNESS_DIMENSION_QUESTIONS.length) * 100;

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestionIndex < WELLNESS_DIMENSION_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishAssessment(newAnswers);
    }
  };

  const finishAssessment = (finalAnswers: number[]) => {
    setIsCalculating(true);
    
    // Group totals by dimension
    const scores: Partial<WellnessScores> = {};
    
    WELLNESS_DIMENSION_QUESTIONS.forEach((q, idx) => {
      const score = finalAnswers[idx] || 0;
      scores[q.dimension] = (scores[q.dimension] || 0) + score;
    });

    setTimeout(() => {
      onComplete(scores as WellnessScores);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800">8 Dimensions Check</h3>
              <p className="text-xs text-slate-500 font-bold">Personal Wellness Assessment</p>
            </div>
          </div>
          {!isCalculating && (
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {!isCalculating && (
            <div className="h-1.5 bg-slate-100 w-full">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
        )}

        <div className="p-8 flex-1 flex flex-col justify-center items-center text-center relative overflow-y-auto">
          {isCalculating ? (
             <div className="space-y-6 animate-fade-in py-10">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                <div>
                    <h3 className="text-xl font-extrabold text-slate-800">Calibrating Wellness...</h3>
                    <p className="text-slate-500 font-medium mt-2">Generating your holistic health report.</p>
                </div>
             </div>
          ) : (
            <div className="w-full max-w-md animate-slide-in-right">
               <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full mb-6 inline-block">
                 {question.dimension} Wellness
               </span>
               <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight mb-8">
                 {question.text}
               </h2>
               
               <div className="grid grid-cols-1 gap-3">
                 {[
                   { val: 1, label: "Rarely, if ever" },
                   { val: 2, label: "Sometimes" },
                   { val: 3, label: "Most of the time" },
                   { val: 4, label: "Always" }
                 ].map((opt) => (
                   <button 
                     key={opt.val} 
                     onClick={() => handleAnswer(opt.val)} 
                     className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-left transition-all group flex items-center justify-between"
                   >
                     <div className="flex items-center space-x-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${currentQuestionIndex % 2 === 0 ? 'bg-white border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-400'}`}>{opt.val}</span>
                        <span className="font-bold text-slate-600 group-hover:text-indigo-700">{opt.label}</span>
                     </div>
                     <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                 ))}
               </div>
               
               <div className="mt-8 text-xs text-slate-400 font-medium">
                 Question {currentQuestionIndex + 1} of {WELLNESS_DIMENSION_QUESTIONS.length}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
