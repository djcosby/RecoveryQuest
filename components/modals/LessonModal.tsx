
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, BookOpen, Target, Trophy, ArrowRight, Gamepad2, Brain, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PathNodeData, QuizOption } from '../../types';
import { MatchingGame } from '../exercises/MatchingGame';
import { useUserStore } from '../../context/UserContext';

type StepType = 'reading' | 'practice' | 'quiz' | 'mission';

export const LessonModal: React.FC<{ level: PathNodeData; onClose: () => void; onComplete: () => void; }> = ({ level, onClose, onComplete }) => {
  const { state: userState, toggleChecklistItem, addXP } = useUserStore();
  const [activeStep, setActiveStep] = useState<StepType>('reading');
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<QuizOption | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  // Fix: Safe property access using optional chaining
  if (!level?.content) return null;

  const { educationalContent, quiz, microSkills, maladaptiveBehaviors, challengeLadder, description } = level.content;
  // Fix: Safe check for exercises
  const hasExercises = (level as any).exercises && (level as any).exercises.length > 0;

  const handleNext = () => {
    if (activeStep === 'reading') {
        if (maladaptiveBehaviors?.length > 0 || hasExercises) setActiveStep('practice');
        else if (quiz?.length) setActiveStep('quiz');
        else setActiveStep('mission');
    } else if (activeStep === 'practice') {
        if (quiz?.length) setActiveStep('quiz');
        else setActiveStep('mission');
    } else if (activeStep === 'quiz') {
        if (quizIndex < quiz!.length - 1) {
            setQuizIndex(quizIndex + 1);
            setSelectedQuizOption(null);
            setIsAnswerChecked(false);
        } else {
            setActiveStep('mission');
        }
    } else {
        onComplete();
    }
  };

  const checkAnswer = () => {
    setIsAnswerChecked(true);
    if (selectedQuizOption?.isCorrect) {
        addXP(20, 'quiz_correct');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    {activeStep === 'reading' ? <BookOpen size={20} /> : activeStep === 'quiz' ? <Brain size={20} /> : <Target size={20} />}
                </div>
                <div>
                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest">{level.title}</span>
                    <h3 className="font-bold text-slate-800 text-sm capitalize">{activeStep} Phase</h3>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide">
            
            {activeStep === 'reading' && (
                <div className="animate-fade-in prose prose-slate max-w-none">
                    {educationalContent ? (
                        <ReactMarkdown>{educationalContent}</ReactMarkdown>
                    ) : (
                        <div className="text-center py-10">
                            <h2 className="text-2xl font-bold">{level.title}</h2>
                            <p className="text-slate-500">{level.description}</p>
                        </div>
                    )}
                </div>
            )}

            {activeStep === 'practice' && (
                <div className="space-y-8 animate-slide-in-right">
                    <div className="text-center">
                        <h2 className="text-2xl font-extrabold text-slate-800">Identify the Pattern</h2>
                        <p className="text-slate-500 font-medium mt-2">Which of these behaviors do you recognize in yourself?</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {maladaptiveBehaviors.map((behavior: string, i: number) => (
                            <button 
                                key={i}
                                onClick={() => setSelectedSymptoms(prev => prev.includes(behavior) ? prev.filter(b => b !== behavior) : [...prev, behavior])}
                                className={`w-full p-4 text-left font-bold rounded-2xl border-2 transition-all flex items-center space-x-4
                                ${selectedSymptoms.includes(behavior) ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedSymptoms.includes(behavior) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200'}`}>
                                    {selectedSymptoms.includes(behavior) && <CheckCircle size={14} />}
                                </div>
                                <span>{behavior}</span>
                            </button>
                        ))}
                    </div>

                    {/* Fix: Safe access to exercises */}
                    {hasExercises && (level as any).exercises && (
                        <div className="mt-8 pt-8 border-t border-slate-100">
                             <MatchingGame 
                                prompt={(level as any).exercises[0].prompt}
                                items={(level as any).exercises[0].items}
                                onComplete={() => setExerciseCompleted(true)}
                            />
                        </div>
                    )}
                </div>
            )}

            {activeStep === 'quiz' && quiz && (
                <div className="space-y-8 animate-slide-in-right">
                    <div className="text-center">
                        <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-1 rounded uppercase">Knowledge Check</span>
                        <h2 className="text-2xl font-extrabold text-slate-800 mt-4 leading-tight">{quiz[quizIndex].question}</h2>
                    </div>

                    <div className="space-y-3">
                        {quiz[quizIndex].options.map((opt: QuizOption) => (
                            <button
                                key={opt.id}
                                disabled={isAnswerChecked}
                                onClick={() => setSelectedQuizOption(opt)}
                                className={`w-full p-5 text-left font-bold rounded-2xl border-2 transition-all flex items-center justify-between
                                ${selectedQuizOption?.id === opt.id 
                                    ? (isAnswerChecked ? (opt.isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700') : 'bg-indigo-50 border-indigo-500 text-indigo-700') 
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
                            >
                                <span>{opt.text}</span>
                                {isAnswerChecked && opt.isCorrect && <CheckCircle size={20} className="text-emerald-500" />}
                                {isAnswerChecked && selectedQuizOption?.id === opt.id && !opt.isCorrect && <AlertCircle size={20} className="text-rose-500" />}
                            </button>
                        ))}
                    </div>

                    {isAnswerChecked && (
                        <div className={`p-5 rounded-2xl animate-fade-in border-2 ${selectedQuizOption?.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                                <HelpCircle size={16} />
                                <span className="text-xs font-black uppercase">Explanation</span>
                            </div>
                            <p className="text-sm font-medium">{selectedQuizOption?.explanation}</p>
                        </div>
                    )}
                </div>
            )}

            {activeStep === 'mission' && (
                <div className="space-y-8 animate-slide-in-right text-center">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                        <Trophy size={48} className="text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Mastery Achievement</h2>
                    <p className="text-slate-500 font-medium">You have completed the concepts for this node. To lock in the XP, accept this real-world challenge:</p>
                    
                    <div className="bg-slate-900 text-white p-6 rounded-3xl text-left relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Mission</span>
                            <h4 className="text-xl font-bold mt-1">{challengeLadder[0].title}</h4>
                            <p className="text-slate-300 text-sm mt-2 leading-relaxed">{challengeLadder[0].description}</p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy size={80} /></div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white">
            {activeStep === 'quiz' && !isAnswerChecked ? (
                <button 
                    onClick={checkAnswer}
                    disabled={!selectedQuizOption}
                    className="w-full bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                    <span>Check Answer</span>
                </button>
            ) : (
                <button 
                    onClick={handleNext}
                    disabled={activeStep === 'practice' && hasExercises && !exerciseCompleted}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                    <span>{activeStep === 'mission' ? 'Accept & Complete' : 'Continue Journey'}</span>
                    <ArrowRight size={18} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
