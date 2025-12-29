
import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle, Activity, AlertTriangle } from 'lucide-react';
import { ASSESSMENTS_REGISTRY } from '../../data/assessments';

export const ClinicalAssessmentModal: React.FC<{ 
    assessmentId: string;
    onClose: () => void; 
    onComplete: (score: number, resultLabel: string, xpReward: number) => void; 
}> = ({ assessmentId, onClose, onComplete }) => {
  const assessment = ASSESSMENTS_REGISTRY[assessmentId];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<{ score: number; label: string; description: string; recommendedTools?: string[] } | null>(null);

  if (!assessment) return null;

  const currentQuestion = assessment.questions[step];
  const progress = ((step + (result ? 1 : 0)) / (assessment.questions.length + 1)) * 100;

  const handleAnswer = (scoreValue: number) => {
    const newAnswers = [...answers, scoreValue];
    setAnswers(newAnswers);

    if (step < assessment.questions.length - 1) {
      setStep(prev => prev + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: number[]) => {
    setIsCalculating(true);
    const totalScore = finalAnswers.reduce((a, b) => a + b, 0);
    
    // Find matching logic range
    const logic = assessment.scoringLogic?.find(l => totalScore >= l.minScore && totalScore <= l.maxScore);
    
    setTimeout(() => {
        setIsCalculating(false);
        setResult({
            score: totalScore,
            label: logic?.resultLabel || "Completed",
            description: logic?.resultDescription || "Assessment complete.",
            recommendedTools: logic?.recommendedToolIds
        });
    }, 1000);
  };

  const handleFinalize = () => {
      if (result) {
          onComplete(result.score, result.label, assessment.xpReward);
      }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800">{assessment.title}</h3>
              <p className="text-xs text-slate-500 font-bold">Clinical Assessment</p>
            </div>
          </div>
          {!isCalculating && !result && (
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100 w-full">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="p-8 flex-1 flex flex-col justify-center items-center text-center relative overflow-y-auto">
          {isCalculating ? (
             <div className="space-y-6 animate-fade-in py-10">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                <div>
                    <h3 className="text-xl font-extrabold text-slate-800">Analyzing Results...</h3>
                    <p className="text-slate-500 font-medium mt-2">Calibrating against clinical benchmarks.</p>
                </div>
             </div>
          ) : result ? (
             <div className="w-full animate-zoom-in text-center">
                 <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 border-4 border-white shadow-xl">
                     <span className="text-3xl font-extrabold">{result.score}</span>
                 </div>
                 <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{result.label}</h2>
                 <p className="text-slate-600 font-medium leading-relaxed mb-8 px-4">{result.description}</p>
                 
                 {result.recommendedTools && result.recommendedTools.length > 0 && (
                     <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-8 text-left">
                         <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-2 flex items-center">
                             <AlertTriangle size={12} className="mr-1" /> Recommended Tools
                         </p>
                         <div className="flex flex-wrap gap-2">
                             {result.recommendedTools.map(t => (
                                 <span key={t} className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-indigo-600 border border-indigo-200 capitalize">
                                     {t}
                                 </span>
                             ))}
                         </div>
                     </div>
                 )}

                 <button onClick={handleFinalize} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center space-x-2">
                     <span>Complete & Collect {assessment.xpReward} XP</span>
                     <CheckCircle size={20} />
                 </button>
             </div>
          ) : (
            <div className="w-full max-w-md animate-slide-in-right">
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full mb-6 inline-block">
                 Question {step + 1} of {assessment.questions.length}
               </span>
               <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight mb-8">
                 {currentQuestion.text}
               </h2>
               
               <div className="grid grid-cols-1 gap-3">
                 {currentQuestion.options.map((opt, idx) => (
                   <button 
                     key={idx} 
                     onClick={() => handleAnswer(opt.scoreValue || 0)} 
                     className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-left transition-all group flex items-center justify-between"
                   >
                     <span className="font-bold text-slate-600 group-hover:text-indigo-700">{opt.text}</span>
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
