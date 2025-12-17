import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Brain, RefreshCw, MessageSquare, Check, X, ShieldAlert, ArrowRight, Zap, Gamepad2, Sword, Sparkles } from 'lucide-react';
import { FEELINGS_DB } from '../../data/emotions';
import { EmotionDef } from '../../types';
import { generatePersonaResponse } from '../../services/geminiService';
import { EmotionalKombat } from '../../components/Games/EmotionKombat';
import { LexiconOfLight } from '../../Practice/lexicon';
import { PRACTICE_GAMES } from '../../Practice/PracticeArenaGames';
import { FilterFeed } from '../../components/Games/FilterFeed';
import { TheRehearsal } from '../../components/Games/TheRehearsal';

interface PracticeArenaProps {
  onStartScenario: () => void;
  onEarnXP?: (amount: number) => void;
}

type ArenaMode = 'menu' | 'feelings' | 'personas' | 'kombat' | 'lexicon' | 'arcade';

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
  
  // New state to track which specific arcade game is playing
  const [activeArcadeGameId, setActiveArcadeGameId] = useState<string | null>(null);

  // --- FEELINGS GAME INTERNAL STATE ---
  const [currentCard, setCurrentCard] = useState<EmotionDef | null>(null);
  const [options, setOptions] = useState<EmotionDef[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // --- PERSONA INTERNAL STATE ---
  const [scenarioText, setScenarioText] = useState('');
  const [personaResponses, setPersonaResponses] = useState<Record<string, string>>({});
  const [loadingPersona, setLoadingPersona] = useState(false);

  // --- FEELINGS LOGIC ---
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

  // --- PERSONA LOGIC ---
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

  // RENDER: ARCADE HOST
  if (activeMode === 'arcade' && activeArcadeGameId) {
      return (
        <div className="h-full flex flex-col animate-fade-in bg-slate-50">
            <PracticeArenaGameHost 
                activeGameId={activeArcadeGameId}
                unlockedIds={[]} 
                awardXp={(xp) => onEarnXP && onEarnXP(xp)}
                onGameResult={(result) => console.log("Game Done:", result)}
                exit={() => {
                    setActiveArcadeGameId(null);
                    setActiveMode('menu');
                }}
            />
        </div>
      );
  }

  // RENDER: KOMBAT
  if (activeMode === 'kombat') {
      return (
          <div className="h-full w-full flex flex-col animate-fade-in relative z-50 bg-slate-900">
              <button onClick={() => setActiveMode('menu')} className="absolute top-4 left-4 z-[110] text-slate-400 hover:text-white font-bold text-xs bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">← Exit Arena</button>
              <EmotionalKombat onClose={() => setActiveMode('menu')} />
          </div>
      );
  }

  // RENDER: LEXICON
  if (activeMode === 'lexicon') {
      return (
          <div className="h-full w-full flex flex-col animate-fade-in bg-slate-50">
              <LexiconOfLight 
                onExit={() => setActiveMode('menu')}
                onAwardXp={(xp) => onEarnXP && onEarnXP(xp)}
                onComplete={(res) => console.log("Lexicon result:", res)}
              />
          </div>
      );
  }

  // RENDER: MENU
  if (activeMode === 'menu') {
    return (
      <div className="h-full w-full p-4 md:p-8 space-y-6 animate-fade-in overflow-y-auto">
        <div className="bg-slate-800 text-white p-8 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden min-h-[200px] flex items-center">
             <div className="relative z-10 max-w-lg">
              <h3 className="font-extrabold text-3xl mb-2 tracking-tight">The Gym</h3>
              <p className="text-slate-300 text-base mb-6 font-medium leading-relaxed">
                  Welcome to the Arcade. Build your emotional muscles outside of the main story.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                <Brain size={200} />
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Dynamic Games */}
          {PRACTICE_GAMES.map(game => (
            <button 
                key={game.id}
                onClick={() => {
                    setActiveArcadeGameId(game.id);
                    setActiveMode('arcade');
                }}
                className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-amber-400 hover:shadow-md transition-all text-left flex items-start space-x-4 group h-full"
            >
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
                    <Gamepad2 />
                </div>
                <div className="flex-1">
                    <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-amber-600 transition-colors">{game.title}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">{game.subtitle}</p>
                </div>
                <ArrowRight className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </button>
          ))}

          <button 
            onClick={() => setActiveMode('kombat')}
            className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-red-400 hover:shadow-md transition-all text-left flex items-start space-x-4 group h-full"
          >
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
              <Sword />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-red-600 transition-colors">Emotional Kombat</h3>
              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">Turn-based RPG battles against your triggers and urges.</p>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
          </button>

          <button onClick={() => setActiveMode('feelings')} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all text-left flex items-start space-x-4 group h-full">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
              <Brain />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">Emotional Literacy</h3>
              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">Flashcards to help you identify and name your feelings.</p>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
          </button>

          <button onClick={() => setActiveMode('personas')} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-rose-400 hover:shadow-md transition-all text-left flex items-start space-x-4 group h-full">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
              <Users />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-rose-600 transition-colors">The Perspective Prism</h3>
              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">See how a Sponsor vs. a Stranger would react to your thoughts.</p>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
          </button>

          <button onClick={onStartScenario} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start space-x-4 group h-full">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
              <ShieldAlert />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">Scenario Arena</h3>
              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">Practice high-risk situations in a safe environment.</p>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    );
  }

  // RENDER: FEELINGS GAME
  if (activeMode === 'feelings' && currentCard) {
    return (
      <div className="h-full w-full flex flex-col animate-slide-in-right p-4 md:p-8 bg-slate-50">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setActiveMode('menu')} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">← Exit Gym</button>
          <div className="flex items-center space-x-3">
             <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1.5 rounded-xl text-yellow-600 text-sm font-bold border border-yellow-100"><Zap size={14} fill="currentColor" /><span>{score} XP</span></div>
             <div className="flex items-center space-x-1 bg-orange-50 px-3 py-1.5 rounded-xl text-orange-600 text-sm font-bold border border-orange-100"><span className="text-lg">🔥</span><span>{streak}</span></div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="bg-white p-10 rounded-[2rem] shadow-xl border-2 border-slate-100 text-center mb-8 relative overflow-hidden transition-all duration-300">
            {feedback === 'correct' && <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center z-10 animate-fade-in"><Check size={80} className="text-emerald-500 animate-bounce" /></div>}
            {feedback === 'wrong' && <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center z-10 animate-fade-in"><X size={80} className="text-rose-500 animate-pulse" /></div>}
            <span className="text-8xl mb-8 block transform hover:scale-110 transition-transform cursor-default">🤔</span>
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6">Identify this Feeling</h3>
            <p className="text-2xl font-serif font-medium text-slate-800 leading-relaxed italic">"{currentCard.scenario}"</p>
            <div className="mt-8 pt-8 border-t border-slate-100"><p className="text-xs text-slate-400">Definition hint: {currentCard.definition}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {options.map(opt => (
              <button key={opt.id} onClick={() => handleGuess(opt.id)} disabled={feedback === 'correct'} className="p-6 bg-white border-b-8 border-slate-200 rounded-3xl font-bold text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all active:border-b-0 active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg">{opt.name}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RENDER: PERSONAS
  if (activeMode === 'personas') {
    return (
      <div className="h-full w-full flex flex-col animate-slide-in-right p-4 md:p-8 bg-slate-50">
        <button onClick={() => setActiveMode('menu')} className="text-sm font-bold text-slate-400 hover:text-slate-600 mb-6 text-left w-fit bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">← Exit Gym</button>
        
        <div className="max-w-3xl mx-auto w-full">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-100 mb-8">
            <h3 className="font-extrabold text-slate-800 text-2xl mb-2">The Perspective Prism</h3>
            <p className="text-slate-500 text-base mb-6">Type a situation, thought, or fear. See how different types of people might respond.</p>
            <div className="relative">
                <textarea value={scenarioText} onChange={(e) => setScenarioText(e.target.value)} placeholder="e.g. 'I feel like giving up...'" className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 text-lg font-medium focus:outline-none focus:border-indigo-400 h-32 resize-none transition-colors" />
                <button onClick={handleAskPersonas} disabled={loadingPersona || !scenarioText} className="absolute bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg disabled:opacity-50 hover:bg-indigo-700 transition-transform active:scale-95">
                {loadingPersona ? <RefreshCw className="animate-spin" size={24} /> : <MessageSquare size={24} />}
                </button>
            </div>
            </div>
            {Object.keys(personaResponses).length > 0 && (
            <div className="space-y-6 animate-slide-in-bottom pb-20">
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl rounded-tl-none relative ml-8 shadow-sm">
                <div className="absolute -top-4 -left-4 bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md border-2 border-white">The Sponsor (Caring)</div>
                <p className="text-emerald-900 text-lg leading-relaxed font-medium">"{personaResponses.supportive}"</p>
                </div>
                <div className="bg-slate-200 border border-slate-300 p-8 rounded-3xl rounded-tr-none relative mr-8 shadow-sm">
                <div className="absolute -top-4 -right-4 bg-slate-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md border-2 border-white">The Stranger (Indifferent)</div>
                <p className="text-slate-700 text-lg leading-relaxed">"{personaResponses.indifferent}"</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl relative shadow-sm">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md border-2 border-white">The Scientist (Objective)</div>
                <p className="text-blue-900 text-lg leading-relaxed font-mono">"{personaResponses.factual}"</p>
                </div>
            </div>
            )}
        </div>
      </div>
    );
  }

  return null;
};