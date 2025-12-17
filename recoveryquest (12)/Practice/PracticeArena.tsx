import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Brain, RefreshCw, MessageSquare, Check, X, ShieldAlert, ArrowRight, Zap, Gamepad2 } from 'lucide-react';
import { FEELINGS_DB } from '../../data/emotions';
import { EmotionDef } from '../../types';
import { generatePersonaResponse } from '../../services/geminiService';

// 1. Import your Game Definitions and the Game Host
import { PRACTICE_GAMES } from '../../Practice/PracticeArenaGames';
import { PracticeArenaGameHost } from '../../features/practice/PracticeArena';

interface PracticeArenaProps {
  onStartScenario: () => void;
  onEarnXP?: (amount: number) => void;
}

// 2. Add 'arcade' to the mode type
type ArenaMode = 'menu' | 'feelings' | 'personas' | 'arcade';

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

  // 3. RENDER: ARCADE HOST
  // This connects your Game Host file to the UI
  if (activeMode === 'arcade' && activeArcadeGameId) {
      return (
        <div className="h-full flex flex-col animate-fade-in">
            <PracticeArenaGameHost 
                activeGameId={activeArcadeGameId}
                unlockedIds={[]} // Connect to user context if needed later
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

  // RENDER: MENU
  if (activeMode === 'menu') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-slate-800 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden">
             <div className="relative z-10">
              <h3 className="font-extrabold text-xl mb-2">The Gym</h3>
              <p className="text-slate-300 text-sm mb-6 font-medium max-w-[90%]">Build your emotional muscles outside of the story mode.</p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                <Brain size={120} />
            </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          
          {/* 4. DYNAMIC GAMES SECTION */}
          {/* This maps through your PracticeArenaGames.ts file */}
          {PRACTICE_GAMES.map(game => (
            <button 
                key={game.id}
                onClick={() => {
                    setActiveArcadeGameId(game.id);
                    setActiveMode('arcade');
                }}
                className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-amber-200 transition-all text-left flex items-center space-x-4 group"
            >
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    <Gamepad2 />
                </div>
                <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">{game.title}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">{game.subtitle}</p>
                </div>
                <ArrowRight className="ml-auto text-slate-300 group-hover:text-amber-500" />
            </button>
          ))}

          {/* Existing Static Buttons */}
          <button onClick={() => setActiveMode('feelings')} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-indigo-200 transition-all text-left flex items-center space-x-4 group">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              <Brain />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Emotional Literacy</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Learn to name your feelings</p>
            </div>
            <ArrowRight className="ml-auto text-slate-300 group-hover:text-indigo-500" />
          </button>

          <button onClick={() => setActiveMode('personas')} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-rose-200 transition-all text-left flex items-center space-x-4 group">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              <Users />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">The Perspective Prism</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Contrast caring vs. uncaring responses</p>
            </div>
            <ArrowRight className="ml-auto text-slate-300 group-hover:text-rose-500" />
          </button>

          <button onClick={onStartScenario} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-blue-200 transition-all text-left flex items-center space-x-4 group">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              <ShieldAlert />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Scenario Arena</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Practice high-risk situations</p>
            </div>
            <ArrowRight className="ml-auto text-slate-300 group-hover:text-blue-500" />
          </button>
        </div>
      </div>
    );
  }

  // RENDER: FEELINGS GAME (Unchanged)
  if (activeMode === 'feelings' && currentCard) {
    return (
      <div className="h-full flex flex-col animate-slide-in-right">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setActiveMode('menu')} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center">← Exit Gym</button>
          <div className="flex items-center space-x-3">
             <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg text-yellow-600 text-xs font-bold"><Zap size={12} fill="currentColor" /><span>{score} XP</span></div>
             <div className="flex items-center space-x-1 bg-orange-50 px-2 py-1 rounded-lg text-orange-600 text-xs font-bold"><span className="text-sm">🔥</span><span>{streak}</span></div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-slate-100 text-center mb-8 relative overflow-hidden transition-all duration-300">
            {feedback === 'correct' && <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center z-10 animate-fade-in"><Check size={64} className="text-emerald-500 animate-bounce" /></div>}
            {feedback === 'wrong' && <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center z-10 animate-fade-in"><X size={64} className="text-rose-500 animate-pulse" /></div>}
            <span className="text-6xl mb-6 block transform hover:scale-110 transition-transform cursor-default">🤔</span>
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Identify this Feeling</h3>
            <p className="text-xl font-serif font-medium text-slate-800 leading-relaxed italic">"{currentCard.scenario}"</p>
            <div className="mt-6 pt-6 border-t border-slate-100"><p className="text-xs text-slate-400">Definition hint: {currentCard.definition}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {options.map(opt => (
              <button key={opt.id} onClick={() => handleGuess(opt.id)} disabled={feedback === 'correct'} className="p-4 bg-white border-b-4 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">{opt.name}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RENDER: PERSONAS (Unchanged)
  if (activeMode === 'personas') {
    return (
      <div className="h-full flex flex-col animate-slide-in-right">
        <button onClick={() => setActiveMode('menu')} className="text-xs font-bold text-slate-400 hover:text-slate-600 mb-6 text-left w-fit">← Exit Gym</button>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 mb-6">
          <h3 className="font-extrabold text-slate-800 text-lg mb-2">The Perspective Prism</h3>
          <p className="text-slate-500 text-sm mb-4">Type a situation, thought, or fear. See how different types of people might respond.</p>
          <div className="relative">
            <textarea value={scenarioText} onChange={(e) => setScenarioText(e.target.value)} placeholder="e.g. 'I feel like giving up...'" className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-indigo-400 h-24 resize-none transition-colors" />
            <button onClick={handleAskPersonas} disabled={loadingPersona || !scenarioText} className="absolute bottom-3 right-3 bg-indigo-600 text-white p-2 rounded-xl shadow-lg disabled:opacity-50 hover:bg-indigo-700 transition-transform active:scale-95">
              {loadingPersona ? <RefreshCw className="animate-spin" size={20} /> : <MessageSquare size={20} />}
            </button>
          </div>
        </div>
        {Object.keys(personaResponses).length > 0 && (
          <div className="space-y-4 animate-slide-in-bottom pb-20">
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl rounded-tl-none relative ml-4 shadow-sm">
              <div className="absolute -top-3 -left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">The Sponsor (Caring)</div>
              <p className="text-emerald-900 text-sm leading-relaxed font-medium">{personaResponses.supportive}</p>
            </div>
            <div className="bg-slate-200 border border-slate-300 p-5 rounded-2xl rounded-tr-none relative mr-4 shadow-sm">
              <div className="absolute -top-3 -right-2 bg-slate-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">The Stranger (Indifferent)</div>
              <p className="text-slate-700 text-sm leading-relaxed">{personaResponses.indifferent}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl relative shadow-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">The Scientist (Objective)</div>
              <p className="text-blue-900 text-sm leading-relaxed font-mono text-xs">{personaResponses.factual}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};