
import React, { useState } from 'react';
// Fix: Import types from types.ts and data from curriculumData
import { CURRICULUM_UNITS } from '../../data/curriculumData';
import { LessonUnit, LessonLevel } from '../../types';
import { LessonModal } from '../../components/education/LessonModal';
import { Lock, Check, Star, Trophy, BookOpen } from 'lucide-react';
import { useRestorationRPG } from '../../hooks/useRestorationRPG';

export const TheAcademy: React.FC = () => {
  const { scores, completeQuest } = useRestorationRPG(); // We reuse this hook to track generic progress
  const [activeLesson, setActiveLesson] = useState<LessonLevel | null>(null);
  
  // Fake persistence for demo purposes - in real app, this comes from DB
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);

  // FIX: Simplified signature to match onComplete prop in LessonModal component
  const handleLessonComplete = (xp: number) => {
    if (activeLesson) {
      setCompletedLevels(prev => [...prev, activeLesson.id]);
      // Here we would also add the XP to the user's Dimension Score
      // completeQuest(activeLesson.id); 
      setActiveLesson(null);
    }
  };

  const isLevelUnlocked = (unitIndex: number, levelIndex: number) => {
    if (unitIndex === 0 && levelIndex === 0) return true;
    
    // Previous level in this unit must be done
    if (levelIndex > 0) {
      const prevLevelId = CURRICULUM_UNITS[unitIndex].nodes[levelIndex - 1].id;
      return completedLevels.includes(prevLevelId);
    }
    
    // Or, last level of previous unit must be done
    if (unitIndex > 0) {
      const prevUnit = CURRICULUM_UNITS[unitIndex - 1];
      const lastLevelId = prevUnit.nodes[prevUnit.nodes.length - 1].id;
      return completedLevels.includes(lastLevelId);
    }

    return false;
  };

  return (
    <div className="min-h-full bg-slate-950 pb-24 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md mx-auto relative z-10 pt-8">
        
        {/* Header */}
        <div className="text-center mb-12 px-6">
          <h1 className="text-2xl font-serif font-bold text-white mb-2">The Curriculum</h1>
          <p className="text-slate-400 text-sm">"We do not rise to the level of our goals; we fall to the level of our systems."</p>
        </div>

        {CURRICULUM_UNITS.map((unit, unitIndex) => (
          <div key={unit.id} className="mb-16 relative">
            
            {/* Unit Header */}
            {/* Fix: Using fixed color names as the dynamic color strings don't always map well to Tailwind classes in this context */}
            <div className={`mx-4 mb-8 p-4 rounded-xl border border-indigo-500/30 bg-indigo-900/10 backdrop-blur-sm flex items-center gap-4`}>
              <div className={`p-3 rounded-full bg-indigo-500/20`}>
                <BookOpen className={`w-6 h-6 text-indigo-400`} />
              </div>
              <div>
                <h2 className={`font-bold text-indigo-100`}>{unit.title}</h2>
                <p className="text-xs text-slate-400">{unit.description}</p>
              </div>
            </div>

            {/* The Winding Path of Levels */}
            <div className="flex flex-col items-center gap-8">
              {unit.nodes.map((level, levelIndex) => {
                const isUnlocked = isLevelUnlocked(unitIndex, levelIndex);
                const isCompleted = completedLevels.includes(level.id);
                
                // Calculate offset for winding path visual (Sine wave pattern)
                // 0 -> center, 1 -> left, 2 -> center, 3 -> right
                const offset = levelIndex % 2 === 0 ? 0 : (levelIndex % 4 === 1 ? -1 : 1);
                const translateX = offset * 60; // 60px shift

                return (
                  <div 
                    key={level.id}
                    className="relative group"
                    style={{ transform: `translateX(${translateX}px)` }}
                  >
                    {/* Connector Line (Behind) - only if not last */}
                    {levelIndex < unit.nodes.length - 1 && (
                      <div 
                        className="absolute top-1/2 left-1/2 w-1 h-20 bg-slate-800 -z-10 origin-top"
                        style={{ 
                          height: '80px',
                          transform: `rotate(${offset === 0 ? (levelIndex % 4 === 0 ? -20 : 20) : (offset === -1 ? 20 : -20)}deg)` 
                        }} 
                      />
                    )}

                    {/* The Node Button */}
                    <div className="relative">
                        <button
                          onClick={() => isUnlocked && setActiveLesson(level)}
                          disabled={!isUnlocked}
                          className={`
                            w-20 h-20 rounded-full flex items-center justify-center border-b-8 transition-all transform hover:scale-105 active:scale-95 active:border-b-0 active:translate-y-2
                            ${isCompleted 
                              ? `bg-amber-400 border-amber-600 text-amber-900` 
                              : (isUnlocked 
                                ? `bg-indigo-500 border-indigo-700 text-white shadow-lg shadow-indigo-900/40` 
                                : `bg-slate-800 border-slate-700 text-slate-600`)
                            }
                          `}
                        >
                          {isCompleted ? (
                             level.type === 'boss' ? <Trophy className="w-8 h-8" /> : <Star className="w-8 h-8 fill-current" />
                          ) : (
                             isUnlocked 
                             ? (level.type === 'boss' ? <Trophy className="w-8 h-8 animate-pulse" /> : <Star className="w-8 h-8" />)
                             : <Lock className="w-6 h-6" />
                          )}
                        </button>
                        
                        {/* Crown/Stars Floating above */}
                        {isCompleted && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-600 z-10 animate-in bounce-in">
                                MASTERED
                            </div>
                        )}
                    </div>

                    {/* Label Tooltip (Always visible for unlocked) */}
                    <div className={`mt-2 text-center transition-opacity ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
                      <div className="text-xs font-bold text-slate-200">{level.title}</div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      {activeLesson && (
        <LessonModal 
          lesson={activeLesson} 
          onClose={() => setActiveLesson(null)} 
          onComplete={handleLessonComplete}
        />
      )}
    </div>
  );
};
