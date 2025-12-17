
import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Brain, RefreshCw, MessageSquare, Check, X, ShieldAlert } from 'lucide-react';
import { FEELINGS_DB } from '../../constants';
import { EmotionDef } from '../../types';
import { generatePersonaResponse } from '../../services/geminiService';
import { useUserStore } from '../../context/UserContext';

interface PracticeArenaProps {
  onStartScenario: () => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({ onStartScenario }) => {
  const [activeMode, setActiveMode] = useState<'menu' | 'feelings' | 'personas'>('menu');
  const { addXP } = useUserStore();

  // --- FEELINGS GAME STATE ---
  const [currentCard, setCurrentCard] = useState<EmotionDef | null>(null);
  const [options, setOptions] = useState<EmotionDef[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // --- PERSONA STATE ---
  const [scenarioText, setScenarioText] = useState('');
  const [personaResponses, setPersonaResponses] = useState<Record<string, string>>({});
  const [loadingPersona, setLoadingPersona] = useState(false);

  // --- FEELINGS LOGIC ---
  const startFeelingRound = () => {
    // Pick random target
    const target = FEELINGS_DB[Math.floor(Math.random() * FEELINGS_DB.length)];
    // Pick 3 distractors
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
      addXP(10, 'feeling_practice');
      setTimeout(startFeelingRound, 1500);
    } else {
      setFeedback('wrong');
    }
  };

  // --- PERSONA LOGIC ---
  const handleAskPersonas = async () => {
    if (!scenarioText.trim()) return;
    setLoadingPersona(true);
    setPersonaResponses({}); // Clear old

    // Run parallel requests
    const p1 = generatePersonaResponse(scenarioText, 'supportive');
    const p2 = generatePersonaResponse(scenarioText, 'indifferent');
    const p3 = generatePersonaResponse(scenarioText, 'factual');

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    setPersonaResponses({
      supportive: r1,
      indifferent: r2,
      factual: r3
    });
    setLoadingPersona(false);
  };

  // Initialize game on load
  useEffect(() => {
    if (activeMode === 'feelings') startFeelingRound();
  }, [activeMode]);

  if (activeMode === 'menu') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-slate-800 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden">
             <div className="relative z-10">
              <h3 className="font-extrabold text-xl mb-2">The Gym</h3>
              <p className="text-slate-300 text-sm mb-6 font-medium max-w-[90%]">Build your emotional muscles outside of the story mode.</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <button onClick={() => setActiveMode('feelings')} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-indigo-200 transition-all text-left flex items-center space-x-4 group">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              <Brain />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Emotional Literacy</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Learn to name your feelings</p>
            </div>
          </button>

          <button onClick={() => setActiveMode('personas')} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-rose-200 transition-all text-left flex items-center space-x-4 group">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              <Users />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">The Perspective Prism</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Contrast caring vs. uncaring responses</p>
            </div>
          </button>

          <button onClick={onStartScenario} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-blue-200 transition-all text-left flex items-center space-x-4 group">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              <ShieldAlert />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Scenario Arena</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Practice high-risk situations</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // --- FEELINGS MODE RENDER ---
  if (activeMode === 'feelings' && currentCard) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setActiveMode('menu')} className="text-xs font-bold text-slate-400 hover:text-slate-600">← Exit Gym</button>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded">EQ Training</span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-slate-100 text-center mb-8 relative overflow-hidden">
            {feedback === 'correct' && <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center z-10"><Check size={64} className="text-emerald-500 animate-bounce" /></div>}
            {feedback === 'wrong' && <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center z-10"><X size={64} className="text-rose-500 animate-pulse" /></div>}
            
            <span className="text-6xl mb-4 block">🤔</span>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Identify this Feeling</h3>
            <p className="text-xl font-serif font-medium text-slate-800 leading-relaxed">
              "{currentCard.scenario}"
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
               <p className="text-xs text-slate-500 italic">Definition hint: {currentCard.definition}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {options.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleGuess(opt.id)}
                disabled={feedback === 'correct'}
                className="p-4 bg-white border-b-4 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all active:border-b-0 active:translate-y-1"
              >
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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <button onClick={() => setActiveMode('menu')} className="text-xs font-bold text-slate-400 hover:text-slate-600 mb-6 text-left w-fit">← Exit Gym</button>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 mb-6">
          <h3 className="font-extrabold text-slate-800 text-lg mb-2">The Perspective Prism</h3>
          <p className="text-slate-500 text-sm mb-4">Type a situation, thought, or fear. See how different types of people might respond.</p>
          
          <div className="relative">
            <textarea 
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              placeholder="e.g. 'I feel like giving up because I relapsed yesterday...'"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-indigo-400 h-24 resize-none"
            />
            <button 
              onClick={handleAskPersonas}
              disabled={loadingPersona || !scenarioText}
              className="absolute bottom-3 right-3 bg-indigo-600 text-white p-2 rounded-xl shadow-lg disabled:opacity-50 hover:bg-indigo-700 transition-transform active:scale-95"
            >
              {loadingPersona ? <RefreshCw className="animate-spin" size={20} /> : <MessageSquare size={20} />}
            </button>
          </div>
        </div>

        {Object.keys(personaResponses).length > 0 && (
          <div className="space-y-4 animate-slide-in-bottom pb-20">
            
            {/* Supportive */}
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl rounded-tl-none relative ml-4">
              <div className="absolute -top-3 -left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                The Sponsor (Caring)
              </div>
              <p className="text-emerald-900 text-sm leading-relaxed font-medium">{personaResponses.supportive}</p>
            </div>

            {/* Indifferent */}
            <div className="bg-slate-200 border border-slate-300 p-5 rounded-2xl rounded-tr-none relative mr-4">
              <div className="absolute -top-3 -right-2 bg-slate-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                The Stranger (Indifferent)
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">{personaResponses.indifferent}</p>
            </div>

            {/* Factual */}
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                The Scientist (Objective)
              </div>
              <p className="text-blue-900 text-sm leading-relaxed font-mono text-xs">{personaResponses.factual}</p>
            </div>

            <div className="text-center p-4">
              <p className="text-xs text-slate-400 italic">Notice how the "Stranger" response feels cold? That's not about you—it's about them. The "Sponsor" response is the connection you deserve.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
