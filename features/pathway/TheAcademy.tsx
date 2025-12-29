
import React, { useState } from 'react';
import { CURRICULUM_UNITS } from '../../data/curriculumData';
import { LessonModal } from '../../components/education/LessonModal';
import { Lock, Star, Trophy, BookOpen } from 'lucide-react';
import { useUserStore } from '../../context/UserContext';
// Fix: Import LessonLevel from types.ts
import { LessonLevel } from '../../types';

export const TheAcademy: React.FC = () => {
  const { state: user, addXP, completeNode } = useUserStore();
  const [activeLesson, setActiveLesson] = useState<LessonLevel | null>(null);
  
  const completedLevels = user?.completedNodes || [];

  const handleLessonComplete = (xp: number) => {
    if (activeLesson) {
      completeNode(activeLesson.id);
      addXP(xp);
      setActiveLesson(null);
    }
  };

  const isLevelUnlocked = (unitIndex: number, levelIndex: number) => {
    if (!CURRICULUM_UNITS || !CURRICULUM_UNITS[unitIndex]) return false;
    if (unitIndex === 0 && levelIndex === 0) return true;
    
    if (levelIndex > 0) {
      const prevLevelId = CURRICULUM_UNITS[unitIndex].nodes[levelIndex - 1]?.id;
      return prevLevelId ? completedLevels.includes(prevLevelId) : false;
    }
    
    if (unitIndex > 0) {
      const prevUnit = CURRICULUM_UNITS[unitIndex - 1];
      if (!prevUnit || !prevUnit.nodes.length) return false;
      const lastLevelId = prevUnit.nodes[prevUnit.nodes.length - 1]?.id;
      return lastLevelId ? completedLevels.includes(lastLevelId) : false;
    }
    return false;
  };

  if (!CURRICULUM_UNITS || CURRICULUM_UNITS.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-500">
              <BookOpen size={48} className="mb-4 opacity-10" />
              <p>Academy syllabus is empty.</p>
          </div>
      );
  }

  return (
    <div className="min-h-full bg-slate-950 pb-24 relative overflow-hidden">
      <div className="max-w-md mx-auto relative z-10 pt-8">
        <div className="text-center mb-12 px-6">
          <h1 className="text-2xl font-serif font-bold text-white mb-2">The Academy</h1>
          <p className="text-slate-400 text-sm">"We do not rise to the level of our goals; we fall to the level of our systems."</p>
        </div>

        {CURRICULUM_UNITS.map((unit, unitIndex) => (
          <div key={unit.id} className="mb-16 relative">
            {/* Fix: Simplified color logic for rendering */}
            <div className={`mx-4 mb-8 p-4 rounded-xl border border-indigo-500/30 bg-indigo-900/10 backdrop-blur-sm flex items-center gap-4`}>
              <div className={`p-3 rounded-full bg-indigo-500/20`}>
                <BookOpen className={`w-6 h-6 text-indigo-400`} />
              </div>
              <div>
                <h2 className={`font-bold text-indigo-100`}>{unit.title}</h2>
                <p className="text-xs text-slate-400">{unit.description}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8">
              {unit.nodes.map((level, levelIndex) => {
                const isUnlocked = isLevelUnlocked(unitIndex, levelIndex);
                const isCompleted = completedLevels.includes(level.id);
                const offset = levelIndex % 2 === 0 ? 0 : (levelIndex % 4 === 1 ? -1 : 1);
                const translateX = offset * 60;

                return (
                  <div key={level.id} className="relative group" style={{ transform: `translateX(${translateX}px)` }}>
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
                    {isCompleted && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-600 z-10">MASTERED</div>
                    )}
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
