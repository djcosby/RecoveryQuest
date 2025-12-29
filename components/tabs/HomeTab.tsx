
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, Star, Calendar, Lock, Shield, Brain, AlertCircle, 
  Map, Footprints, ChevronDown, Check, User, Heart, 
  ShoppingBag, Sparkles, X, Info, BookOpen, Trophy, 
  ListTodo, PlusCircle, Trash2, Loader2, MessageSquare
} from 'lucide-react';
import { UnitData, RecoveryTool, PathNodeData, PersonalityProfile, AIPathConfiguration, UserTask } from '../../types';
import { CURRICULUM_UNITS } from '../../data/curriculumData';
import { useUserStore } from '../../context/UserContext';
import { useRecoveryRecommender } from '../../hooks/useRecoveryRecommender';
import { ShopModal } from '../modals/ShopModal';
import { PhilosophyModal } from '../modals/PhilosophyModal';
import { generateTaskSuggestions, generateEncouragingPhrase } from '../../services/geminiService';
import { CurriculumService } from '../../services/curriculumService';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export const HomeTab: React.FC<{ 
    userXP: number; 
    streak: number; 
    userLevel: number; 
    meetingCount: number;
    onStartLesson: (level: any) => void; 
    onStudyTool: (tool: RecoveryTool) => void; 
    onLogMeeting: () => void; 
    personalityProfile: PersonalityProfile | null;
    debugMode?: boolean;
}> = ({ userXP, streak, userLevel, meetingCount, onStartLesson, onStudyTool, onLogMeeting, personalityProfile, debugMode }) => {
  
  const { state: userState, addXP, addUserTask, toggleUserTask, deleteUserTask, addNotification } = useUserStore();
  const [showShop, setShowShop] = useState(false);
  const [showPhilosophy, setShowPhilosophy] = useState(false);
  const [plannerTab, setPlannerTab] = useState<'daily' | 'weekly'>('daily');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  
  // Dynamic Curriculum State
  const [dynamicCurriculum, setDynamicCurriculum] = useState<UnitData[] | null>(null);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(isSupabaseConfigured);

  useEffect(() => {
    async function loadPath() {
        if (!isSupabaseConfigured) {
            setDynamicCurriculum(null);
            setIsLoadingCurriculum(false);
            return;
        }
        try {
            const data = await CurriculumService.fetchTrack('hero');
            setDynamicCurriculum(data);
        } catch (err) {
            console.error("Failed to fetch curriculum from Supabase", err);
        } finally {
            setIsLoadingCurriculum(false);
        }
    }
    loadPath();
  }, []);

  // Use dynamic if available, otherwise fallback
  const curriculum = dynamicCurriculum || CURRICULUM_UNITS;

  // Helper to handle both UnitData (nodes) and LessonUnit (levels) structures
  const getUnitNodes = (unit: any): any[] => unit.nodes || unit.levels || [];

  const isLevelUnlocked = (unitIndex: number, levelIndex: number) => {
    if (!curriculum || !curriculum[unitIndex]) return false;
    
    // Level 1, Node 1 is always open
    if (unitIndex === 0 && levelIndex === 0) return true;
    
    // Use helper to get current nodes/levels
    const currentUnitNodes = getUnitNodes(curriculum[unitIndex]);
    
    if (levelIndex > 0) {
      const prevLevelId = currentUnitNodes[levelIndex - 1]?.id;
      return prevLevelId ? userState.completedNodes.includes(prevLevelId) : false;
    }
    
    if (unitIndex > 0) {
      const prevUnit = curriculum[unitIndex - 1];
      if (!prevUnit) return false;
      // Use helper to get previous nodes/levels
      const prevUnitNodes = getUnitNodes(prevUnit);
      if (!prevUnitNodes.length) return false;
      const lastLevelId = prevUnitNodes[prevUnitNodes.length - 1]?.id;
      return lastLevelId ? userState.completedNodes.includes(lastLevelId) : false;
    }
    return false;
  };

  // AI Task Generation
  const handleSuggestTasks = async () => {
    setIsSuggesting(true);
    const suggestions = await generateTaskSuggestions(userState);
    suggestions.forEach(s => {
        if (s.text && s.type) {
            addUserTask(s.text, s.type as any, true, s.category);
        }
    });
    setIsSuggesting(false);
    const phrase = await generateEncouragingPhrase(userState, "The Architect has analyzed your progress and updated your planner.");
    addNotification(phrase);
  };

  const handleAddTaskManual = () => {
      if (!newTaskText.trim()) return;
      addUserTask(newTaskText, plannerTab);
      setNewTaskText('');
  };

  const handleToggleTask = async (taskId: string) => {
      toggleUserTask(taskId);
      const task = userState.userTasks.find(t => t.id === taskId);
      if (task && !task.isCompleted) {
          addXP(10, 'task_complete');
          if (Math.random() > 0.6) {
              const phrase = await generateEncouragingPhrase(userState, `Completed a ${task.type} task: ${task.text}`);
              addNotification(phrase);
          }
      }
  };

  const currentTasks = userState.userTasks.filter(t => t.type === plannerTab);

  return (
    <div className="pb-32 animate-fade-in relative min-h-screen bg-slate-50 overflow-x-hidden">
      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
      {showPhilosophy && <PhilosophyModal onClose={() => setShowPhilosophy(false)} />}

      {/* Header Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-200">
                <Brain className="text-white" size={20} />
            </div>
            <div>
                <h1 className="text-lg font-black text-slate-800 leading-tight">The Academy</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level {userLevel} Architect</p>
            </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-rose-600 font-black bg-rose-50 px-3 py-1.5 rounded-2xl border border-rose-100">
            <Heart size={16} className="fill-current" />
            <span className="text-sm">{userState.hearts}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-100 cursor-pointer" onClick={() => setShowShop(true)}>
            <span className="text-sm">💎</span>
            <span className="text-sm">{userState.gems}</span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pt-8 pb-12">
          {/* Academy Planner */}
          <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden mb-12">
              <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <ListTodo size={20} /> Academy Planner
                    </h3>
                    <p className="text-xs font-bold text-indigo-200 mt-1 opacity-80 uppercase tracking-widest">Master your daily disciplines</p>
                  </div>
                  <button 
                    onClick={handleSuggestTasks}
                    disabled={isSuggesting}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all shadow-inner active:scale-95 disabled:opacity-50"
                  >
                      {isSuggesting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="text-yellow-300" />}
                  </button>
              </div>
              
              <div className="flex border-b border-slate-100">
                  <button onClick={() => setPlannerTab('daily')} className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] ${plannerTab === 'daily' ? 'bg-indigo-50/50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Daily Actions</button>
                  <button onClick={() => setPlannerTab('weekly')} className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] ${plannerTab === 'weekly' ? 'bg-indigo-50/50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Weekly Goals</button>
              </div>

              <div className="p-6">
                  <div className="flex gap-2 mb-6">
                      <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTaskManual()} placeholder={`Add a new ${plannerTab} task...`} className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-400 transition-colors" />
                      <button onClick={handleAddTaskManual} className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg active:scale-95 transition-transform"><PlusCircle size={24} /></button>
                  </div>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto scrollbar-hide">
                      {currentTasks.length > 0 ? currentTasks.map(task => (
                          <div key={task.id} className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${task.isCompleted ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                              <button onClick={() => handleToggleTask(task.id)} className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200'}`}>{task.isCompleted && <Check size={18} strokeWidth={4} />}</button>
                              <div className="flex-1">
                                  <span className={`block text-sm font-bold leading-tight ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                              </div>
                              <button onClick={() => deleteUserTask(task.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                          </div>
                      )) : <div className="text-center py-10 opacity-30"><ListTodo size={40} className="mx-auto mb-3" /><p className="text-sm font-bold uppercase tracking-widest">No tasks set</p></div>}
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">The Curriculum Path</span>
              <div className="h-px flex-1 bg-slate-200"></div>
          </div>
      </div>

      {/* Main Roadmap */}
      <div className="max-w-md mx-auto relative px-4 pb-20">
        {isLoadingCurriculum ? (
            <div className="space-y-12 animate-pulse">
                {[1,2].map(i => (
                    <div key={i} className="bg-slate-200 h-48 rounded-[2.5rem] w-full mb-8"></div>
                ))}
            </div>
        ) : curriculum.map((unit, unitIndex) => (
          <div key={unit.id} className="mb-24 relative">
            <div className={`mb-16 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden border-2 bg-indigo-600 border-indigo-400 text-white`}>
              <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><BookOpen className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{unit.id.replace('_', ' ')}</span>
                  </div>
                  <h2 className="text-3xl font-black mb-2">{unit.title}</h2>
                  <p className="text-sm font-medium opacity-90 leading-relaxed">{unit.description}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-16 relative">
              <div className="absolute inset-0 flex justify-center -z-10 pointer-events-none opacity-20"><div className="w-2 h-full bg-slate-300 rounded-full" /></div>
              {/* Fixed: Used getUnitNodes helper to avoid errors when curriculum uses levels instead of nodes */}
              {getUnitNodes(unit).map((level: any, levelIndex: number) => {
                const isUnlocked = isLevelUnlocked(unitIndex, levelIndex);
                const isCompleted = userState.completedNodes.includes(level.id);
                const offset = levelIndex % 2 === 0 ? 0 : (levelIndex % 4 === 1 ? -1 : 1);
                const translateX = offset * 80;

                return (
                  <div key={level.id} className="relative group" style={{ transform: `translateX(${translateX}px)` }}>
                    <button
                      onClick={() => isUnlocked && onStartLesson(level)}
                      disabled={!isUnlocked}
                      className={`w-24 h-24 rounded-[2rem] flex flex-col items-center justify-center border-b-8 transition-all transform hover:scale-110 active:scale-95 active:border-b-0 active:translate-y-2 relative shadow-2xl ${isCompleted ? `bg-amber-400 border-amber-600 text-amber-900 shadow-amber-200` : (isUnlocked ? `bg-white border-slate-200 text-indigo-600 shadow-slate-200` : `bg-slate-200 border-slate-300 text-slate-400 shadow-none`)}`}
                    >
                      {isCompleted ? <Star className="w-10 h-10 fill-current" /> : (isUnlocked ? <BookOpen className="w-10 h-10" /> : <Lock className="w-8 h-8" />)}
                    </button>
                    {isCompleted && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-slate-700 shadow-lg">Mastered</div>}
                    <div className={`mt-4 text-center transition-opacity ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
                      <div className="text-xs font-black text-slate-800 uppercase tracking-widest">{level.title}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">{level.xpReward || level.xp} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
