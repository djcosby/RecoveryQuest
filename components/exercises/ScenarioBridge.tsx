
import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { ScenarioBridgeContent } from '../../types';

interface ScenarioBridgeProps {
  content: ScenarioBridgeContent;
  onComplete: (success: boolean, finalChoiceId: string) => void;
}

export const ScenarioBridge: React.FC<ScenarioBridgeProps> = ({ content, onComplete }) => {
  const [currentBeatId, setCurrentBeatId] = useState('start');
  const [history, setHistory] = useState<{speaker: string, text: string}[]>([]);
  const [finalScore, setFinalScore] = useState(0);

  const currentBeat = content.beats[currentBeatId];

  useEffect(() => {
      if (currentBeat) {
          setHistory(prev => [...prev, { speaker: currentBeat.speaker, text: currentBeat.text }]);
          if (currentBeat.score) setFinalScore(s => s + currentBeat.score!);
      }
  }, [currentBeatId]);

  const handleChoice = (choice: any) => {
      setHistory(prev => [...prev, { speaker: 'user', text: choice.label }]);
      
      if (choice.consequenceText) {
          setHistory(prev => [...prev, { speaker: 'system', text: choice.consequenceText }]);
      }

      const nextBeat = content.beats[choice.nextBeatId];
      if (!nextBeat || nextBeat.isEnd) {
          // Finish
          const passThreshold = content.scoring?.passScoreAtLeast || 1;
          const totalAccumulated = finalScore + (nextBeat?.score || 0);
          onComplete(totalAccumulated >= passThreshold, choice.id);
      } else {
          setCurrentBeatId(choice.nextBeatId);
      }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-lg mx-auto">
      {/* Dialogue Thread */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
          {history.map((h, i) => (
              <div key={i} className={`flex ${h.speaker === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold shadow-sm
                    ${h.speaker === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 
                      h.speaker === 'system' ? 'bg-slate-800 text-slate-200 text-xs border border-slate-700 italic' : 
                      'bg-white text-slate-800 rounded-tl-none border border-slate-100'}
                  `}>
                      {h.text}
                  </div>
              </div>
          ))}
      </div>

      {/* Active Input/Choices */}
      {currentBeat && !currentBeat.isEnd && currentBeat.choices && (
          <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-2">Reflex Response Required</p>
              {currentBeat.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-5 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 rounded-2xl text-left font-bold text-slate-700 transition-all group flex justify-between items-center shadow-sm"
                  >
                    <span>{choice.label}</span>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </button>
              ))}
          </div>
      )}

      {currentBeat?.isEnd && (
          <div className="p-8 bg-indigo-50 border-2 border-indigo-100 rounded-3xl text-center animate-zoom-in">
              <Brain size={48} className="mx-auto text-indigo-500 mb-4" />
              <h4 className="text-xl font-black text-indigo-900 mb-2">Roleplay Concluded</h4>
              <p className="text-indigo-700 text-sm font-medium mb-6">You navigated the exchange. The neural memory is logged.</p>
              <button 
                onClick={() => onComplete(true, 'exit')}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Analyze & Finish
              </button>
          </div>
      )}
    </div>
  );
};
