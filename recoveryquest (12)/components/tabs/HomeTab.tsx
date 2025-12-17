
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, Star, Calendar, Lock, Shield, Brain, AlertCircle, 
  Map, Footprints, ChevronDown, Check, User, Heart, 
  CheckSquare, Coffee, Sun, Moon, ShoppingBag, Sparkles, X,
  ThermometerSun, Info
} from 'lucide-react';
import { UnitData, RecoveryTool, PathNodeData, PersonalityProfile, AIPathConfiguration } from '../../types';
import { ContentService } from '../../services/contentService';
import { generatePathCustomization } from '../../services/geminiService';
import { useUserStore } from '../../context/UserContext';
import { useRecoveryRecommender } from '../../hooks/useRecoveryRecommender';
import { COURSES, MOOD_HISTORY } from '../../constants';
import { ShopModal } from '../modals/ShopModal';
import { PhilosophyModal } from '../modals/PhilosophyModal';

// --- NEW: Support Character Definitions ---
const PATH_SUPPORTS = [
    { 
        id: 1, 
        icon: '🧙‍♂️', 
        label: 'The Mentor', 
        offset: 'right',
        message: "You possess power you haven't realized yet.",
        buff: "Insight: Next lesson gives +10% XP" 
    },
    { 
        id: 3, 
        icon: '🦉', 
        label: 'Wisdom', 
        offset: 'left', 
        message: "Logic will get you from A to B. Imagination will take you everywhere.",
        buff: "Clarity: Mental Fog cleared"
    },
    { 
        id: 5, 
        icon: '🐕', 
        label: 'Companion', 
        offset: 'right',
        message: "I'm just happy to be walking with you.",
        buff: "Comfort: +1 Heart Restored" 
    },
];

const DailyWisdomModal: React.FC<{ onClose: () => void; onClaim: () => void }> = ({ onClose, onClaim }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 w-full max-w-sm rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-indigo-400/30" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1"><X size={20} /></button>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-extrabold uppercase bg-white/20 px-2 py-1 rounded tracking-wider border border-white/10">Daily Wisdom</span>
                <span className="text-yellow-300 text-xs font-black flex items-center bg-white/10 px-2 py-1 rounded"><Star size={12} className="mr-1 fill-current"/> +50 XP</span>
            </div>
            <div className="mb-8 text-center">
                <Sparkles className="mx-auto text-indigo-300 mb-4 opacity-50" size={32} />
                <p className="font-serif text-xl italic leading-relaxed text-indigo-50">"The only way out of the labyrinth of suffering is to forgive."</p>
            </div>
            <button onClick={onClaim} className="w-full bg-white text-indigo-600 font-extrabold py-3 rounded-xl text-xs uppercase tracking-widest shadow-md active:scale-95 transition-transform hover:bg-indigo-50">Claim & Reflect</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export const HomeTab: React.FC<{ 
    userXP: number; 
    streak: number; 
    userLevel: number; 
    meetingCount: number;
    onStartLesson: (level: PathNodeData) => void; 
    onStudyTool: (tool: RecoveryTool) => void; 
    onLogMeeting: () => void; 
    personalityProfile: PersonalityProfile | null;
    debugMode?: boolean;
}> = ({ userXP, streak, userLevel, meetingCount, onStartLesson, onStudyTool, onLogMeeting, personalityProfile, debugMode }) => {
  
  const { state: userState, addXP, switchCourse, restoreHearts, claimDailyQuest } = useUserStore();
  const [tools, setTools] = useState<Record<string, RecoveryTool>>({});
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [activeSupport, setActiveSupport] = useState<any | null>(null); // For modal
  const [showShop, setShowShop] = useState(false);
  const [showPhilosophy, setShowPhilosophy] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIPathConfiguration | null>(null);
  const [isSyncingAI, setIsSyncingAI] = useState(false);
  
  // Daily Wisdom State
  const [showWisdom, setShowWisdom] = useState(false);
  const [wisdomClaimed, setWisdomClaimed] = useState(false);

  // Strategy: Determine if user is in "Foundation Phase"
  // Foundation Phase = Level < 3 (approx 30 days of effort/XP in this gamified logic)
  const isFoundationPhase = userLevel < 3;

  // Resolve Active Course with Fallback
  const activeCourse = useMemo(() => 
    COURSES.find(c => c.id === userState.activeCourseId) || COURSES[0] || { 
      id: 'default', title: 'Loading Path...', description: '', icon: '⏳', themeColor: 'amber', units: [] 
    }
  , [userState.activeCourseId]);

  const curriculum = activeCourse.units || [];

  // --- ADAPTIVE LOGIC ---
  const { isHighStress } = useMemo(() => {
      const recent = MOOD_HISTORY.slice(-3); // Last 3 entries
      const avg = recent.length ? recent.reduce((acc, m) => acc + m.value, 0) / recent.length : 3;
      return { isHighStress: avg < 2.5 };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        const toolsData = await ContentService.getTools();
        setTools(toolsData || {});
    };
    fetchData();
  }, []);

  const { rationale: recommendationReasons, primaryNodeIds, secondaryNodeIds } = useRecoveryRecommender(curriculum, personalityProfile, userState);
  
  const handleSupportClick = (support: any) => {
      setActiveSupport(support);
      // Apply buff immediately
      if (support.label === 'Companion') {
          restoreHearts();
      }
  };

  const handleSyncPath = async () => {
      setIsSyncingAI(true);
      const config = await generatePathCustomization(userState, personalityProfile);
      if (config) {
          setAiConfig(config);
      }
      setIsSyncingAI(false);
  };

  const handleClaimWisdom = () => {
      addXP(50, 'manna');
      setWisdomClaimed(true);
      setShowWisdom(false);
  };

  const handleCourseSwitch = (courseId: string) => {
      if (isFoundationPhase && courseId !== 'hero') {
          window.alert("Complete the Foundation Phase (Reach Level 3) to unlock specialized paths. Focus on assessments and stabilization first.");
          return;
      }
      switchCourse(courseId);
      setShowCourseMenu(false);
  };

  const activeUnitIndex = curriculum.findIndex(unit => unit.nodes.some(n => !userState.completedNodes.includes(n.id))) === -1 
    ? curriculum.length - 1 
    : curriculum.findIndex(unit => unit.nodes.some(n => !userState.completedNodes.includes(n.id)));
  const currentUnit = curriculum[activeUnitIndex];

  // Stronger visual cues per path
  const getThemeStyles = () => {
      switch(activeCourse.themeColor) {
          case 'purple': 
            return {
                bg: 'bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900',
                path: 'border-purple-400',
                pattern: "opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
            };
          case 'slate': 
            return {
                bg: 'bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900',
                path: 'border-slate-400',
                pattern: "opacity-10 bg-[url('https://www.transparenttextures.com/patterns/rick-wall.png')]"
            };
          case 'cyan': 
            return {
                bg: 'bg-gradient-to-b from-cyan-900 via-blue-900 to-slate-900',
                path: 'border-cyan-400',
                pattern: "opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"
            };
          default: // Amber/Hero
            return {
                bg: 'bg-gradient-to-b from-amber-900 via-amber-700 to-emerald-900',
                path: 'border-yellow-400',
                pattern: "opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
            };
      }
  };

  const theme = getThemeStyles();

  return (
    <div className="pb-24 animate-fade-in relative min-h-screen overflow-hidden">
      <div className={`absolute inset-0 -z-20 pointer-events-none transition-colors duration-1000 ${theme.bg}`}></div>
      <div className={`absolute inset-0 -z-10 pointer-events-none ${theme.pattern}`}></div>
      
      {/* Support Interaction Modal */}
      {activeSupport && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={() => setActiveSupport(null)}>
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center relative" onClick={e => e.stopPropagation()}>
                  <div className="text-6xl mb-4 animate-bounce">{activeSupport.icon}</div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">{activeSupport.label}</h3>
                  <p className="text-slate-600 italic mb-6">"{activeSupport.message}"</p>
                  <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wide mb-6 border border-emerald-100">
                      Buff Applied: {activeSupport.buff}
                  </div>
                  <button onClick={() => setActiveSupport(null)} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">Continue Path</button>
              </div>
          </div>
      )}

      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
      
      {showWisdom && <DailyWisdomModal onClose={() => setShowWisdom(false)} onClaim={handleClaimWisdom} />}

      {showPhilosophy && <PhilosophyModal onClose={() => setShowPhilosophy(false)} />}

      {/* Header Bar - Responsive */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex justify-between items-center shadow-sm md:rounded-b-2xl md:mx-4 md:mt-2">
        <div className="relative flex items-center space-x-2">
            <button 
                onClick={() => setShowCourseMenu(!showCourseMenu)}
                className="flex items-center space-x-2 hover:bg-slate-100 p-1.5 rounded-xl transition-colors group"
            >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xl border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                    {activeCourse.icon}
                </div>
                <div className="text-left">
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {isFoundationPhase ? 'Phase 1: Foundation' : 'Current Path'}
                    </span>
                    <span className="block text-xs font-extrabold text-slate-700">{activeCourse.title}</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
            </button>
            
            <button 
                onClick={() => setShowPhilosophy(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Strategy & Purpose"
            >
                <Info size={18} />
            </button>

            {showCourseMenu && (
                <div className="absolute top-12 left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-zoom-in z-50">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-3 py-2">
                        {isFoundationPhase ? 'Unlockable Paths (Lvl 3+)' : 'Available Paths'}
                    </div>
                    {COURSES.map(course => {
                        const isLocked = isFoundationPhase && course.id !== 'hero';
                        return (
                            <button
                                key={course.id}
                                onClick={() => handleCourseSwitch(course.id)}
                                className={`w-full flex items-center p-3 rounded-xl transition-all mb-1 
                                    ${userState.activeCourseId === course.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}
                                    ${isLocked ? 'opacity-60 grayscale' : ''}
                                `}
                            >
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-lg shadow-sm border border-slate-100 mr-3">
                                    {course.icon}
                                </div>
                                <div className="flex-1 text-left">
                                    <span className={`block font-bold text-sm ${userState.activeCourseId === course.id ? 'text-indigo-700' : 'text-slate-700'}`}>{course.title}</span>
                                </div>
                                {userState.activeCourseId === course.id && <Check size={16} className="text-indigo-500 ml-2" />}
                                {isLocked && <Lock size={14} className="text-slate-400 ml-2" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Mobile Stats (Hidden on Desktop because RightPanel handles it) */}
        <div className="flex items-center space-x-2 md:hidden">
          <div className="flex items-center space-x-1.5 text-rose-600 font-extrabold bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
            <Heart size={16} className="fill-current" />
            <span className="text-sm">{userState.hearts}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-600 font-extrabold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 cursor-pointer" onClick={() => setShowShop(true)}>
            <span className="text-sm">💎</span>
            <span className="text-sm">{userState.gems}</span>
          </div>
          <button onClick={() => setShowShop(true)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 active:scale-95 transition-transform">
              <ShoppingBag size={18} />
          </button>
        </div>
      </div>

      {/* ADAPTIVE BANNER */}
      {isHighStress && (
        <div className="mx-4 mt-4 bg-indigo-900/90 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/50 shadow-xl animate-fade-in relative overflow-hidden z-20">
            <div className="absolute -right-6 -top-6 text-indigo-500/20"><ThermometerSun size={100} /></div>
            <div className="flex items-start space-x-3 relative z-10">
                <div className="p-2 bg-indigo-500/20 rounded-lg animate-pulse">
                    <Sparkles size={20} className="text-indigo-300" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white mb-1">Adaptive Mode Active</h4>
                    <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                        We detected high stress levels. High-risk scenarios are temporarily locked. Focus on stabilization.
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* Daily Wisdom Button */}
      {!wisdomClaimed && (
          <div className="flex justify-center mt-4 animate-slide-in-bottom relative z-20">
            <button onClick={() => setShowWisdom(true)} className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-indigo-100 text-indigo-600 font-bold text-xs hover:scale-105 transition-transform">
                <Sparkles size={14} className="fill-indigo-100" />
                <span>Daily Wisdom</span>
            </button>
          </div>
      )}

      {/* AI Architect Insight Panel */}
      <div className="px-4 mt-6 relative z-20 max-w-2xl md:mx-auto">
          {!aiConfig ? (
              <button 
                onClick={handleSyncPath} 
                disabled={isSyncingAI}
                className="w-full bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-xl flex items-center justify-center space-x-3 text-white transition-transform active:scale-95 group"
              >
                  <Sparkles size={20} className={isSyncingAI ? "animate-spin text-yellow-400" : "text-yellow-400 group-hover:scale-110 transition-transform"} />
                  <span className="font-bold text-sm">{isSyncingAI ? 'Architect is Thinking...' : 'Sync Path with Assessments'}</span>
              </button>
          ) : (
              <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-indigo-500/30 shadow-xl animate-zoom-in">
                  <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                          <Brain size={20} className="text-indigo-400" />
                          <h3 className="font-extrabold text-white text-sm">Architect's Plan</h3>
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-1 rounded uppercase tracking-wide">
                          Focus: {aiConfig.focusArea}
                      </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed italic mb-4">"{aiConfig.architectMessage}"</p>
                  
                  {aiConfig.suggestedTools.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                          {aiConfig.suggestedTools.map(t => (
                              <span key={t} className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-1 rounded border border-slate-700 capitalize">{t}</span>
                          ))}
                      </div>
                  )}
                  {/* Custom AI Quest (moved here from Daily Quest board) */}
                  {aiConfig.customDailyQuest?.title && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-indigo-300">{aiConfig.customDailyQuest?.title}</div>
                                <p className="text-[10px] text-slate-400">{aiConfig.customDailyQuest?.description}</p>
                            </div>
                            <button onClick={() => addXP(aiConfig.customDailyQuest.xp, 'ai_quest')} className="text-[9px] font-extrabold bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-md active:scale-95 border border-indigo-500">
                                +{aiConfig.customDailyQuest.xp} XP
                            </button>
                        </div>
                  )}
              </div>
          )}
      </div>

      {/* Narrative Context */}
      <div className="px-4 mt-6 relative z-10 max-w-2xl md:mx-auto">
        <div className="bg-white/95 backdrop-blur rounded-2xl p-5 border-2 border-white/50 shadow-xl relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 opacity-5 text-slate-900`}>
                <Map size={80} />
            </div>
            <div className="relative z-10">
                <h3 className="text-lg font-extrabold text-slate-800 mb-1 font-serif">
                    {currentUnit ? currentUnit.title : "Journey Complete"}
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Current Chapter</p>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    "{currentUnit ? currentUnit.description : "You have mastered this path."}"
                </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button onClick={onLogMeeting} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-md active:scale-95">
                    <Calendar size={14} /><span>Log Action</span>
                </button>
            </div>
        </div>
      </div>

      {/* Recommendation Bubble */}
      {recommendationReasons.length > 0 && !aiConfig && (
        <div className="px-4 mt-4 relative z-10 max-w-2xl md:mx-auto">
            <div className="bg-indigo-900/80 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-3 text-xs text-indigo-100 shadow-lg">
            <p className="font-bold text-indigo-300 mb-1 flex items-center"><Brain size={14} className="mr-1" />Guide's Insight:</p>
            <ul className="list-disc list-inside space-y-0.5 opacity-90">{recommendationReasons.slice(0, 2).map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
        </div>
      )}

      {/* The Winding Road */}
      <div className="relative py-12 pb-32">
        <div className={`absolute left-1/2 top-0 bottom-0 w-32 -ml-16 border-l-8 border-dashed opacity-40 transform -skew-x-3 pointer-events-none ${theme.path}`}></div>
        
        <div className="space-y-16 max-w-md mx-auto relative z-10">
          {curriculum.map((unit) => (
            <div key={unit.id} className="relative">
              
              <div className="flex justify-center mb-10">
                  <div className={`inline-flex px-6 py-2 rounded-full border-2 border-white/20 text-white font-extrabold text-sm shadow-lg backdrop-blur-md ${unit.color} relative`}>
                    <span className="mr-2">✨</span> {unit.title}
                  </div>
              </div>

              <div className="space-y-12 relative">
                {unit.nodes.map((node, i) => {
                  const offsetClass = i % 2 === 0 ? '-translate-x-12 rotate-[-3deg]' : 'translate-x-12 rotate-[3deg]';
                  const isCompleted = userState.completedNodes.includes(node.id);
                  const isUnlocked = node.status !== 'locked' || (i > 0 && userState.completedNodes.includes(unit.nodes[i-1].id));
                  
                  // Priority Logic: Use AI config if available, otherwise use basic recommender
                  const isRecommended = aiConfig 
                    ? aiConfig.recommendedNodeIds.includes(node.id) && !isCompleted
                    : (primaryNodeIds.includes(node.id) || secondaryNodeIds.includes(node.id)) && !isCompleted;
                  
                  const tool = node.toolRewardId ? tools[node.toolRewardId] : null;
                  
                  // Adaptive Logic Check
                  const isHighRisk = node.riskLevel === 'high';
                  const isStabilizationTool = node.targetDimension === 'Emotional' || node.targetDimension === 'Physical';

                  let visualStatus = 'locked';
                  if (isCompleted) visualStatus = 'completed';
                  else if (isUnlocked) visualStatus = 'unlocked';

                  // Apply Adaptive Lock
                  if (isHighStress && isHighRisk && !isCompleted) {
                      visualStatus = 'locked-stress';
                  }

                  // --- NEW: Interactive Support Character ---
                  const support = PATH_SUPPORTS.find(s => s.id === i);

                  return (
                    <div key={node.id} className={`flex justify-center relative`}>
                      {i < unit.nodes.length - 1 && (
                          <div className={`absolute top-16 h-12 w-2 border-x-2 opacity-30 ${activeCourse.themeColor === 'slate' ? 'bg-slate-400 border-slate-500' : activeCourse.themeColor === 'cyan' ? 'bg-cyan-400 border-cyan-500' : 'bg-yellow-400 border-yellow-500'} ${i % 2 === 0 ? 'left-1/2 ml-[-40px] rotate-12' : 'left-1/2 ml-[30px] -rotate-12'}`}></div>
                      )}

                      {/* Render Interactive Support */}
                      {support && (
                          <button 
                            onClick={() => handleSupportClick(support)}
                            className={`absolute top-4 ${support.offset === 'left' ? 'left-4' : 'right-4'} animate-bounce-slow opacity-90 z-20 transition-transform hover:scale-110 active:scale-95`}
                          >
                              <div className="flex flex-col items-center">
                                  <div className="text-4xl filter drop-shadow-lg">{support.icon}</div>
                                  <span className="bg-black/40 text-white text-[8px] px-2 py-0.5 rounded-full backdrop-blur-sm mt-1 border border-white/20">
                                      {support.label}
                                  </span>
                              </div>
                          </button>
                      )}

                      <div className={`flex flex-col items-center transform transition-all duration-500 ${offsetClass} z-10`}>
                        {isRecommended && visualStatus !== 'locked-stress' && (
                          <div className="mb-2 animate-bounce absolute -top-8 z-20">
                              <span className={`text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border flex items-center ${aiConfig ? 'bg-indigo-600 border-indigo-400' : 'bg-rose-600 border-rose-400'}`}>
                                <AlertCircle size={10} className="mr-1" /> {aiConfig ? 'Architect Pick' : 'Start Here'}
                              </span>
                          </div>
                        )}

                        <button 
                            onClick={() => visualStatus !== 'locked' && visualStatus !== 'locked-stress' && onStartLesson(node)} 
                            disabled={visualStatus === 'locked-stress'}
                            className={`w-24 h-24 rounded-2xl transform rotate-45 flex items-center justify-center shadow-2xl relative z-10 transition-all duration-300
                            ${visualStatus === 'locked' 
                                ? 'bg-slate-800 border-4 border-slate-700 text-slate-600 grayscale opacity-90 cursor-not-allowed' 
                                : visualStatus === 'locked-stress'
                                    ? 'bg-slate-800 border-4 border-rose-900/50 text-slate-600 grayscale opacity-60 cursor-not-allowed'
                                : visualStatus === 'completed' 
                                    ? 'bg-yellow-400 border-4 border-yellow-200 text-yellow-900 shadow-[0_0_20px_rgba(251,191,36,0.6)]' 
                                    : isRecommended && aiConfig 
                                        ? 'bg-indigo-600 border-4 border-indigo-400 text-white animate-pulse-slow shadow-[0_0_25px_rgba(99,102,241,0.6)]'
                                        : 'bg-emerald-600 border-4 border-emerald-400 text-white animate-pulse-slow shadow-[0_0_15px_rgba(16,185,129,0.5)]'}
                            `}
                        >
                          <div className="-rotate-45 flex flex-col items-center">
                              {visualStatus === 'locked' ? <Lock size={28} strokeWidth={2.5} /> 
                              : visualStatus === 'locked-stress' ? <Shield size={28} strokeWidth={2.5} className="opacity-50" />
                              : visualStatus === 'completed' ? <Footprints size={32} strokeWidth={3} className="opacity-80" /> 
                              : node.type === 'boss' ? <Shield size={32} strokeWidth={3} /> 
                              : node.type === 'trait_module' ? <Brain size={32} strokeWidth={3} /> 
                              : tool ? <span className="text-3xl filter drop-shadow-md">{tool.icon}</span> 
                              : <Star size={32} fill="currentColor" strokeWidth={3} />}
                          </div>
                        </button>

                        <div className="mt-6 relative text-center">
                          <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 shadow-xl max-w-[140px]">
                              <span className={`text-xs font-bold ${visualStatus === 'completed' ? 'text-yellow-400' : 'text-slate-200'}`}>
                                {node.title}
                                {debugMode && <span className="block text-[8px] text-slate-400 font-mono mt-1 opacity-75">{node.id}</span>}
                              </span>
                          </div>
                          {tool && visualStatus === 'unlocked' && (
                              <div className="absolute -right-16 top-0 bg-indigo-600 text-white text-[9px] px-2 py-1 rounded-md font-bold uppercase rotate-6 border border-indigo-400 shadow-lg whitespace-nowrap">
                                  Reward: {tool.name}
                              </div>
                          )}
                          {isHighStress && isStabilizationTool && !isCompleted && visualStatus === 'unlocked' && (
                              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-md z-30 whitespace-nowrap animate-bounce border border-emerald-400">
                                  Recommended for Stabilization
                              </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center opacity-60">
            <div className="text-6xl mb-2 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">🏰</div>
            <p className="text-slate-400 text-xs font-serif italic tracking-widest">Keep walking...</p>
        </div>
      </div>
    </div>
  );
};
