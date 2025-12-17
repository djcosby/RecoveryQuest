
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, BookOpen, Target, Trophy, ArrowRight, Gamepad2, ListChecks, CheckSquare } from 'lucide-react';
import { PathNodeData, Challenge } from '../../types';
import { MatchingGame } from '../exercises/MatchingGame';
import { useUserStore } from '../../context/UserContext';

export const LessonModal: React.FC<{ level: PathNodeData; onClose: () => void; onComplete: () => void; }> = ({ level, onClose, onComplete }) => {
  const { state: userState, toggleChecklistItem } = useUserStore();
  const [step, setStep] = useState(0); 
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selfCheckScore, setSelfCheckScore] = useState<number>(3);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  
  // Interactive Exercise State
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  // If node has checklist, we might skip exercise/symptom steps or just add it
  const hasChecklist = level.content?.checklist && level.content.checklist.length > 0;
  
  // Logic to determine initial step based on content availability
  useEffect(() => {
      // If purely a checklist node (no behaviors/skills), start at step 2 (Checklist View)
      if (level.content?.checklist && (!level.content.maladaptiveBehaviors || level.content.maladaptiveBehaviors.length === 0)) {
          setStep(2); 
      }
  }, []);

  if (!level.content) return null;

  const { maladaptiveBehaviors, microSkills, selfCheck, challengeLadder, description, checklist } = level.content;
  const hasExercises = level.exercises && level.exercises.length > 0;

  const completedChecklistItems = userState.checklistProgress[level.id] || [];

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
        setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
    } else {
        setSelectedSymptoms(prev => prev.concat(symptom));
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      onComplete(); 
    }
  };

  // Logic to determine if "Continue" is enabled
  const canProceed = () => {
      if (step === 1 && hasExercises && !exerciseCompleted) return false;
      
      // If checklist exists, require all checked to proceed? Or maybe just progress.
      // Let's enforce 100% completion for checklist nodes to finish the lesson.
      if (step === 2 && hasChecklist) {
          return checklist!.every(item => completedChecklistItems.includes(item.id));
      }

      if (step === 3 && !selectedChallenge) return false;
      return true;
  };

  const handleChecklistToggle = (itemId: string, xp: number) => {
      toggleChecklistItem(level.id, itemId, xp);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
                <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest">{level.title}</span>
                <div className="flex space-x-1 mt-1">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i <= step ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                    ))}
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {step === 0 && (
                <div className="space-y-6 animate-slide-in-right">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-rose-100">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-800">The Mirror</h2>
                        <p className="text-slate-500 font-medium mt-2">{description}</p>
                    </div>

                    {maladaptiveBehaviors.length > 0 && (
                        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                            <h3 className="text-sm font-bold text-rose-700 uppercase tracking-wide mb-3">When I'm Not At My Best:</h3>
                            <div className="space-y-2">
                                {maladaptiveBehaviors.map((behavior, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => toggleSymptom(behavior)}
                                        className={`w-full p-3 text-left text-sm font-medium rounded-xl border-2 transition-all flex items-start space-x-3
                                        ${selectedSymptoms.includes(behavior) 
                                            ? 'bg-white border-rose-400 text-rose-700 shadow-sm' 
                                            : 'bg-transparent border-transparent hover:bg-white/60 text-slate-600'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedSymptoms.includes(behavior) ? 'bg-rose-500 border-rose-500' : 'border-rose-300'}`}>
                                            {selectedSymptoms.includes(behavior) && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <span>{behavior}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {step === 1 && (
                 <div className="space-y-6 animate-slide-in-right">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-100">
                            {hasExercises ? <Gamepad2 size={32} /> : <BookOpen size={32} />}
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-800">The Practice</h2>
                        <p className="text-slate-500 font-medium mt-2">
                            {hasExercises ? "Master the concepts to unlock the next step." : "Micro-skills to change the pattern."}
                        </p>
                    </div>
                    
                    {hasExercises && level.exercises ? (
                        <MatchingGame 
                            prompt={level.exercises[0].prompt}
                            items={level.exercises[0].items}
                            onComplete={() => setExerciseCompleted(true)}
                        />
                    ) : (
                        <div className="space-y-4">
                            {microSkills.map((skill, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                                    <h4 className="font-extrabold text-slate-800 text-lg mb-1">{skill.title}</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">{skill.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
            )}

            {step === 2 && (
                 <div className="space-y-8 animate-slide-in-right">
                    {/* Render Checklist if Available */}
                    {hasChecklist ? (
                        <div>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-cyan-100">
                                    <ListChecks size={32} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-800">Case Checklist</h2>
                                <p className="text-slate-500 font-medium mt-2">Complete these actions to advance.</p>
                            </div>
                            
                            <div className="space-y-3">
                                {checklist!.map((item) => {
                                    const isDone = completedChecklistItems.includes(item.id);
                                    return (
                                        <button 
                                            key={item.id}
                                            onClick={() => handleChecklistToggle(item.id, item.xp)}
                                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                                                isDone 
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                                                : 'bg-white border-slate-200 hover:border-cyan-400'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                    isDone ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                                                }`}>
                                                    {isDone && <CheckCircle size={16} className="text-white" />}
                                                </div>
                                                <div>
                                                    <div className={`font-bold ${isDone ? 'line-through opacity-70' : 'text-slate-700'}`}>{item.label}</div>
                                                    {isDone && <div className="text-[10px] font-bold text-emerald-600">Completed</div>}
                                                </div>
                                            </div>
                                            {!isDone && (
                                                <div className="text-xs font-bold text-yellow-500 bg-yellow-50 px-2 py-1 rounded">+{item.xp} XP</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100">
                                    <Target size={32} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-800">Self-Check</h2>
                                <p className="text-slate-500 font-medium mt-2 px-4">{selfCheck.question}</p>
                            </div>
                            <div className="px-2">
                                <input 
                                    type="range" min="1" max="5" step="1"
                                    value={selfCheckScore}
                                    onChange={(e) => setSelfCheckScore(parseInt(e.target.value))}
                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs font-bold text-slate-400 mt-2 px-1">
                                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                                </div>
                            </div>
                            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center transition-all">
                                <span className="text-4xl font-extrabold text-emerald-600 block mb-2">{selfCheckScore}</span>
                                <h4 className="text-emerald-800 font-bold uppercase tracking-wide text-sm mb-2">
                                    {selfCheck.anchors.find(a => a.score === selfCheckScore)?.label || 
                                    selfCheck.anchors.find(a => a.score === (selfCheckScore > 3 ? 5 : selfCheckScore < 3 ? 1 : 3))?.label}
                                </h4>
                            </div>
                        </>
                    )}
                 </div>
            )}
            {step === 3 && (
                 <div className="space-y-6 animate-slide-in-right">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-100">
                            <Trophy size={32} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-800">Mission Board</h2>
                    </div>

                    <div className="space-y-3 pb-8">
                        {challengeLadder.length > 0 ? challengeLadder.map((challenge, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedChallenge(challenge)}
                                className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center group
                                ${selectedChallenge === challenge 
                                    ? 'bg-slate-800 border-slate-800 text-white shadow-lg scale-[1.02]' 
                                    : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'}`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md
                                            ${challenge.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-600' :
                                              challenge.difficulty === 'Medium' ? 'bg-blue-100 text-blue-600' :
                                              challenge.difficulty === 'Hard' ? 'bg-orange-100 text-orange-600' :
                                              'bg-rose-100 text-rose-600'}`}>
                                            {challenge.difficulty}
                                        </span>
                                        <span className="text-xs font-bold text-yellow-500 flex items-center">
                                            <Trophy size={10} className="mr-1" /> {challenge.xp} XP
                                        </span>
                                    </div>
                                    <h4 className={`font-bold text-sm ${selectedChallenge === challenge ? 'text-white' : 'text-slate-800'}`}>{challenge.title}</h4>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-3 
                                    ${selectedChallenge === challenge ? 'border-white bg-white/20' : 'border-slate-200'}`}>
                                    {selectedChallenge === challenge && <CheckCircle size={14} className="text-white" />}
                                </div>
                            </button>
                        )) : (
                            <div className="text-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-sm">No extra missions for this unit.</p>
                                <button onClick={onComplete} className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-xs">Finish Lesson</button>
                            </div>
                        )}
                    </div>
                 </div>
            )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-white">
            <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:shadow-none text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
                <span>{step === 3 ? (challengeLadder.length > 0 ? 'Accept Mission' : 'Complete') : 'Continue'}</span>
                {step < 3 && <ArrowRight size={18} />}
            </button>
        </div>
      </div>
    </div>
  );
};
