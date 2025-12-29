import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Brain, RefreshCw, MessageSquare, Check, X, ShieldAlert, ArrowRight, Zap, Gamepad2, Sword, Sparkles, Rocket, Medal, Trophy, Star, ArrowLeft } from 'lucide-react';
import { FEELINGS_DB } from '../../data/emotions';
import { EmotionDef, GameMasteryData } from '../../types';
import { generatePersonaResponse } from '../../services/geminiService';
import { EmotionalKombat } from '../../components/Games/EmotionKombat';
import { LexiconOfLight } from '../../Practice/lexicon';
import { PRACTICE_GAMES } from '../../Practice/PracticeArenaGames';
import { FilterFeed } from '../../components/Games/FilterFeed';
import { TheRehearsal } from '../../components/Games/TheRehearsal';
import { TheNavigator } from '../../components/Games/TheNavigator';
import { useUserStore } from '../../context/UserContext';

interface PracticeArenaProps {
  onStartScenario: () => void;
  onEarnXP?: (amount: number) => void;
}

type ArenaMode = 'menu' | 'feelings' | 'personas' | 'kombat' | 'lexicon' | 'arcade';

const MASTERY_TITLES = [
  "Apprentice", 
  "Novice", 
  "Practitioner", 
  "Specialist", 
  "Expert", 
  "Veteran", 
  "Elite", 
  "Master", 
  "Grandmaster", 
  "Legend"
];

const MASTERY_COLORS = [
  "text-slate-400 border-slate-400", 
  "text-amber-600 border-amber-600", 
  "text-slate-400 border-slate-400", 
  "text-yellow-500 border-yellow-500", 
  "text-emerald-500 border-emerald-500", 
  "text-blue-500 border-blue-500", 
  "text-indigo-500 border-indigo-500", 
  "text-purple-500 border-purple-500", 
  "text-rose-500 border-rose-500", 
  "text-cyan-400 border-cyan-400"
];

const MasteryBadge: React.FC<{ mastery: GameMasteryData; gameId: string }> = ({ mastery, gameId }) => {
  const level = mastery?.level || 1;
  const exp = mastery?.exp || 0;
  const threshold = level * 250;
  const progress = (exp / threshold) * 100;
  const streak = mastery?.currentStreak || 0;
  
  const titleIdx = Math.min(level - 1, MASTERY_TITLES.length - 1);
  const title = MASTERY_TITLES[titleIdx];
  const colorClass = MASTERY_COLORS[titleIdx];
  const colorOnly = colorClass.split(' ')[0];

  return (
    <div className="mt-4 pt-4 border-t border-slate-50 w-full">
        <div className="flex justify-between items-end mb-2">
            <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg border-2 bg-white ${colorClass} shadow-sm`}>
                    <Medal size={16} className="fill-current opacity-30" />
                </div>
                <div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] block leading-none mb-0.5 ${colorOnly}`}>{title}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Level {level}</span>
                </div>
            </div>
            {streak > 0 && (
                <div className="flex items-center space-x-1 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                    <span className="text-[10px]">🔥</span>
                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-tighter">{streak} Hot</span>
                </div>
            )}
        </div>
        
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
            <div 
                className={`h-full transition-all duration-1000 rounded-full ${colorOnly.replace('text-', 'bg-')}`} 
                style={{ width: `${progress}%` }}
            ></div>
            {progress > 85 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>}
        </div>
        
        <div className="flex justify-between mt-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            <span>{exp} XP</span>
            <span>Next: {threshold} XP</span>
        </div>
    </div>
  );
};

export const PracticeArenaGameHost: React.FC<{
  activeGameId: string;
  unlockedIds: string[];
  awardXp: (xp: number) => void;
  onGameResult: (result: any) => void;
  exit: () => void;
  unitTag?: string;
}> = (props) => {
  if (props.activeGameId === "filter_feed") {
    return (
      <FilterFeed
        onAwardXp={props.awardXp}
        onExit={props.exit}
        onComplete={props.onGameResult}
        unitTag={props.unitTag}
        difficulty={2} 
        specialization={"all"} 
        durationSec={75}
      />
    );
  }

  if (props.activeGameId === "lexicon_of_light") {
      return (
          <div className="h-full w-full flex flex-col animate-fade-in bg-slate-50">
              <LexiconOfLight 
                onExit={props.exit}
                onAwardXp={props.awardXp}
                onComplete={props.onGameResult}
              />
          </div>
      );
  }

  if (props.activeGameId === "the_rehearsal") {
    return (
      <TheRehearsal
        onAwardXp={props.awardXp}
        onExit={props.exit}
        onComplete={props.onGameResult} 
      />
    );
  }

  if (props.activeGameId === "the_navigator") {
    return (
      <TheNavigator
        onAwardXp={props.awardXp}
        onExit={props.exit}
      />
    );
  }

  return (
      <div className="p-8 text-center">
          <h3 className="text-xl font-bold">Game Not Found</h3>
          <p className="text-slate-500 mb-4">ID: {props.activeGameId}</p>
          <button onClick={props.exit} className="bg-slate-200 px-4 py-2 rounded-xl text-slate-800 font-bold">Exit</button>
      </div>
  );
};

export const PracticeArena: React.FC<PracticeArenaProps> = ({ onStartScenario, onEarnXP }) => {
  const [activeMode, setActiveMode] = useState<ArenaMode>('menu');
  const { state: userState, recordGameResult, addXP } = useUserStore();
  
  const [activeArcadeGameId, setActiveArcadeGameId] = useState<string | null>(null);

  const [currentCard, setCurrentCard] = useState<EmotionDef | null>(null);
  const [options, setOptions] = useState<EmotionDef[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [scenarioText, setScenarioText] = useState('');
  const [personaResponses, setPersonaResponses] = useState<Record<string, string>>({});
  const [loadingPersona, setLoadingPersona] = useState(false);

  const startFeelingRound = () => {
    const target = FEELINGS_DB[Math.floor(Math.random() * FEELINGS_DB.length)];
    const distractors = FEELINGS_DB.filter(f => f.id !== target.id)
                                   .sort(() => 0.5 - Math.random())
                                   .slice(0, 3);
    const allOptions = [target, ...distractors].sort(() => 0.5 - Math.random());
    setCurrentCard(target);
    setOptions(allOptions);
    setFeedback(null);
  };

  const handleGuess = (id: string) => {
    if (!currentCard) return;
    
    if (id === currentCard.id) {
      setFeedback('correct');
      setScore(s => s + 10);
      setStreak(s => s + 1);
      if (onEarnXP) onEarnXP(10);
      setTimeout(startFeelingRound, 1500);
    } else {
      setFeedback('wrong');
      setStreak(0);
    }
  };

  const handleAskPersonas = async () => {
    if (!scenarioText.trim()) return;
    setLoadingPersona(true);
    setPersonaResponses({}); 
    try {
      const p1 = generatePersonaResponse(scenarioText, 'supportive');
      const p2 = generatePersonaResponse(scenarioText, 'indifferent');
      const p3 = generatePersonaResponse(scenarioText, 'factual');
      const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
      setPersonaResponses({ supportive: r1, indifferent: r2, factual: r3 });
    } catch (e) {
      console.error("Persona generation failed", e);
    } finally {
      setLoadingPersona(false);
    }
  };

  useEffect(() => {
    if (activeMode === 'feelings') {
        setScore(0);
        setStreak(0);
        startFeelingRound();
    }
  }, [activeMode]);

  const handleArcadeComplete = (result: any) => {
    const gameId = activeArcadeGameId || 'unknown';
    // Map various result schemas to a standard 0-100 score
    let scoreVal = 0;
    if (result.score !== undefined) scoreVal = result.score;
    else if (result.correct !== undefined) scoreVal = (result.correct / (result.attempts || 1)) * 100;
    else if (result.accuracy !== undefined) scoreVal = result.accuracy * 100;
    else scoreVal = 80; // default for simple completion

    recordGameResult(gameId, Math.round(scoreVal));
  };

  if (activeMode === 'arcade' && activeArcadeGameId) {
      return (
        <div className="h-full w-full flex flex-col animate-fade-in bg-slate-50">
            <PracticeArenaGameHost 
                activeGameId={activeArcadeGameId}
                unlockedIds={userState.completedNodes} 
                awardXp={(xp) => addXP(xp, 'practice')}
                onGameResult={handleArcadeComplete}
                exit={() => {
                    setActiveArcadeGameId(null);
                    setActiveMode('menu');
                }}
            />
        </div>
      );
  }

  if (activeMode === 'kombat') {
      return (
          <div className="h-full w-full flex flex-col animate-fade-in relative z-50 bg-slate-900">
              <button onClick={() => setActiveMode('menu')} className="absolute top-4 left-4 z-[110] text-slate-400 hover:text-white font-bold text-xs bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">← Exit Arena</button>
              <EmotionalKombat onClose={() => {
                  recordGameResult('kombat', 100);
                  setActiveMode('menu');
              }} />
          </div>
      );
  }

  if (activeMode === 'menu') {
    return (
      <div className="h-full w-full p-4 md:p-8 space-y-6 animate-fade-in overflow-y-auto">
        <div className="bg-slate-800 text-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200 relative overflow-hidden min-h-[220px] flex items-center border-b-8 border-slate-900">
             <div className="relative z-10 max-w-lg">
              <h3 className="font-black text-4xl mb-3 tracking-tighter">The Practice Hub</h3>
              <p className="text-indigo-100 text-lg mb-6 font-medium leading-relaxed">
                  Sharpen your tools. Build mental muscle memory. Earn high-fidelity titles for consistent mastery.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                <Brain size={300} />
            </div>
            <div className="absolute top-8 right-10">
                <div className="flex items-center space-x-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-2xl border border-yellow-400/30 backdrop-blur-sm">
                    <Trophy size={20} className="fill-current" />
                    <span className="text-xs font-black uppercase tracking-widest">Hall of Mastery</span>
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {PRACTICE_GAMES.map(game => {
            const mastery = userState.gameMastery[game.id] || { level: 1, exp: 0, bestScore: 0, roundsPlayed: 0, currentStreak: 0, maxStreak: 0 };
            return (
              <button 
                  key={game.id}
                  onClick={() => {
                      setActiveArcadeGameId(game.id);
                      setActiveMode('arcade');
                  }}
                  className={`bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm transition-all text-left flex flex-col group h-full hover:shadow-xl hover:-translate-y-1
                      ${game.id === 'the_navigator' ? 'hover:border-indigo-400' : 'hover:border-amber-400'}`}
              >
                  <div className="flex items-start space-x-5 w-full">
                    <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0 shadow-sm border-b-4
                        ${game.id === 'the_navigator' ? 'bg-indigo-50 text-indigo-500 border-indigo-200' : 'bg-amber-50 text-amber-500 border-amber-200'}`}>
                        {game.id === 'the_navigator' ? <Rocket size={32} /> : <Gamepad2 size={32} />}
                    </div>
                    <div className="flex-1">
                        <h3 className={`font-black text-slate-800 text-xl transition-colors
                            ${game.id === 'the_navigator' ? 'group-hover:text-indigo-600' : 'group-hover:text-amber-600'}`}>{game.title}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 leading-relaxed line-clamp-2">{game.subtitle}</p>
                    </div>
                  </div>
                  
                  < MasteryBadge mastery={mastery} gameId={game.id} />
              </button>
            );
          })}

          <button 
            onClick={() => setActiveMode('kombat')}
            className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:border-red-400 hover:shadow-xl transition-all text-left flex flex-col group h-full hover:-translate-y-1"
          >
            <div className="flex items-start space-x-5">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-[1.25rem] border-b-4 border-red-200 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0 shadow-sm">
                <Sword size={32} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-800 text-xl group-hover:text-red-600 transition-colors">Emotional Kombat</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 leading-relaxed">Turn-based mental defense against triggers.</p>
              </div>
            </div>
            <MasteryBadge mastery={userState.gameMastery['kombat'] || { level: 1, exp: 0, bestScore: 0, roundsPlayed: 0, currentStreak: 0, maxStreak: 0 }} gameId="kombat" />
          </button>

          <button onClick={() => setActiveMode('feelings')} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:border-indigo-400 hover:shadow-xl transition-all text-left flex flex-col group h-full hover:-translate-y-1">
            <div className="flex items-start space-x-5">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-[1.25rem] border-b-4 border-indigo-200 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0 shadow-sm">
                <Brain size={32} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-800 text-xl group-hover:text-indigo-600 transition-colors">Emotional Literacy</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 leading-relaxed">Master the complex vocabulary of feelings.</p>
              </div>
            </div>
            <MasteryBadge mastery={userState.gameMastery['literacy'] || { level: 1, exp: 0, bestScore: 0, roundsPlayed: 0, currentStreak: 0, maxStreak: 0 }} gameId="literacy" />
          </button>
        </div>
      </div>
    );
  }

  // --- FEELINGS MODE RENDER ---
  if (activeMode === 'feelings' && currentCard) {
    return (
      <div className="h-full flex flex-col animate-slide-in-right p-8">
        <div className="flex justify-between items-center mb-12">
          <button onClick={() => {
              const finalAccuracy = Math.round((streak / 10) * 100);
              recordGameResult('literacy', finalAccuracy);
              setActiveMode('menu');
          }} className="text-xs font-black text-slate-400 hover:text-slate-800 uppercase tracking-[0.2em] flex items-center transition-colors">
            <ArrowLeft className="mr-3" size={16} /> Return to Hub
          </button>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-2xl text-yellow-600 text-xs font-black border border-yellow-100 shadow-sm"><Zap size={14} fill="currentColor" /><span>{score} XP</span></div>
             <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-2xl text-orange-600 text-xs font-black border border-orange-100 shadow-sm"><span className="text-lg">🔥</span><span>{streak}</span></div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="bg-white p-12 rounded-[4rem] shadow-2xl border-2 border-slate-100 text-center mb-10 relative overflow-hidden transition-all duration-300">
            {feedback === 'correct' && <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center z-10 animate-fade-in backdrop-blur-[2px]"><Check size={100} className="text-emerald-500 animate-bounce" /></div>}
            {feedback === 'wrong' && <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center z-10 animate-fade-in backdrop-blur-[2px]"><X size={100} className="text-rose-500 animate-pulse" /></div>}
            <span className="text-8xl mb-10 block transform hover:scale-110 transition-transform cursor-default filter drop-shadow-lg">🤔</span>
            <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-8">Clinical Identification</h3>
            <p className="text-3xl font-serif font-medium text-slate-800 leading-tight italic">"{currentCard.scenario}"</p>
            <div className="mt-10 pt-10 border-t border-slate-50"><p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">Hint: {currentCard.definition.substring(0, 50)}...</p></div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {options.map(opt => (
              <button key={opt.id} onClick={() => handleGuess(opt.id)} disabled={feedback === 'correct'} className="p-6 bg-white border-b-8 border-slate-200 rounded-[2rem] font-black text-slate-700 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600 transition-all active:border-b-0 active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-lg">
                  {opt.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- PERSONA MODE RENDER ---
  if (activeMode === 'personas') {
    return (
      <div className="h-full flex flex-col animate-slide-in-right p-8">
        <button onClick={() => setActiveMode('menu')} className="text-xs font-black text-slate-400 hover:text-slate-800 mb-10 flex items-center uppercase tracking-[0.2em] transition-colors">
            <ArrowLeft className="mr-3" size={16} /> Return to Hub
        </button>
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-slate-100 mb-10 relative overflow-hidden">
          <div className="relative z-10">
              <h3 className="font-black text-slate-800 text-3xl mb-3 flex items-center tracking-tighter">
                  <Sparkles size={28} className="mr-4 text-indigo-500" />
                  The Perspective Prism
              </h3>
              <p className="text-slate-500 text-lg mb-8 font-medium leading-relaxed">Observe how connection transforms a crisis. Input a situation to begin refraction.</p>
              <div className="relative">
                <textarea 
                    value={scenarioText} 
                    onChange={(e) => setScenarioText(e.target.value)} 
                    placeholder="e.g. 'I feel like my progress doesn't matter because I had an urge today...'" 
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-[2rem] p-8 text-lg font-bold text-slate-700 focus:outline-none focus:border-indigo-500 h-40 resize-none transition-colors shadow-inner" 
                />
                <button 
                    onClick={handleAskPersonas} 
                    disabled={loadingPersona || !scenarioText} 
                    className="absolute bottom-5 right-5 bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] shadow-xl disabled:opacity-50 hover:bg-indigo-700 transition-all active:scale-95 flex items-center space-x-3 font-black text-sm uppercase tracking-widest"
                >
                  {loadingPersona ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} className="fill-current" />}
                  <span>Refract</span>
                </button>
              </div>
          </div>
          <div className="absolute -right-20 -top-20 opacity-[0.03]">
              <Sparkles size={250} />
          </div>
        </div>
        
        {Object.keys(personaResponses).length > 0 && (
          <div className="space-y-8 animate-slide-in-bottom pb-24">
            <div className="bg-white border-2 border-emerald-200 p-8 rounded-[2.5rem] rounded-tl-none relative ml-6 shadow-md">
              <div className="absolute -top-4 -left-3 bg-emerald-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest border-2 border-white">The Sponsor</div>
              <p className="text-emerald-900 text-lg leading-relaxed font-bold">{personaResponses.supportive}</p>
            </div>
            <div className="bg-white border-2 border-slate-200 p-8 rounded-[2.5rem] rounded-tr-none relative mr-6 shadow-md">
              <div className="absolute -top-4 -right-3 bg-slate-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest border-2 border-white">The Stranger</div>
              <p className="text-slate-600 text-lg leading-relaxed font-bold">{personaResponses.indifferent}</p>
            </div>
            <div className="bg-white border-2 border-blue-200 p-8 rounded-[2.5rem] relative shadow-md">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest border-2 border-white">The Scientist</div>
              <p className="text-blue-900 text-sm leading-relaxed font-mono font-bold">{personaResponses.factual}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};