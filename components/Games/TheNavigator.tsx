
import React, { useState, useEffect } from 'react';
import { Rocket, Shield, AlertTriangle, CheckCircle, ChevronRight, Zap, Info, ArrowLeft, Brain, Star } from 'lucide-react';
import { NAVIGATOR_SIMULATION, SimulationChallenge } from '../../data/straightAheadData';

interface Props {
  onExit: () => void;
  onAwardXp: (xp: number) => void;
}

export const TheNavigator: React.FC<Props> = ({ onExit, onAwardXp }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [stageStatus, setStageStatus] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [simulationComplete, setSimulationComplete] = useState(false);

  const stage = NAVIGATOR_SIMULATION[currentStageIdx];

  const handleItemClick = (item: any) => {
    if (selectedIds.includes(item.id)) return;

    if (item.isCorrect) {
      setSelectedIds([...selectedIds, item.id]);
      setShowFeedback(item.feedback);
      onAwardXp(10);
      
      const correctRequired = stage.items.filter(i => i.isCorrect).length;
      if (selectedIds.length + 1 === correctRequired) {
        setStageStatus('complete');
      }
    } else {
      setShowFeedback(item.feedback);
      // Optional: Penalty or just education
    }
  };

  const nextStage = () => {
    if (currentStageIdx < NAVIGATOR_SIMULATION.length - 1) {
      setCurrentStageIdx(currentStageIdx + 1);
      setSelectedIds([]);
      setShowFeedback(null);
      setStageStatus('intro');
    } else {
      setSimulationComplete(true);
    }
  };

  if (simulationComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-zoom-in">
        <div className="w-24 h-24 bg-indigo-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl text-indigo-600">
          <Star size={48} className="fill-current" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Wonderful Planet Reached</h2>
        <p className="text-slate-500 mb-8 max-w-md">You have mastered the fundamental transition skills of the Straight Ahead curriculum. Your ship is stable.</p>
        <button 
          onClick={onExit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-2xl shadow-lg active:scale-95 transition-all"
        >
          Exit Simulation
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 p-6 md:p-10 relative overflow-hidden">
      {/* HUD Backdrop Decor */}
      <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
          <Rocket size={400} />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 z-10">
        <button onClick={onExit} className="flex items-center text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest">
            <ArrowLeft size={16} className="mr-2" /> Abort Mission
        </button>
        <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-indigo-400 uppercase">System Status</span>
                <span className="text-xs font-bold text-emerald-400">Online / Calibrated</span>
            </div>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Brain size={20} />
            </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full z-10">
        
        {stageStatus === 'intro' ? (
          <div className="flex-1 flex flex-col justify-center animate-fade-in">
              <div className="bg-slate-800/50 backdrop-blur-md border-2 border-indigo-500/30 p-8 rounded-[2.5rem] shadow-2xl">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 block">Sector {stage.stage}</span>
                  <h2 className="text-4xl font-black mb-4 leading-tight">{stage.title}</h2>
                  <p className="text-slate-300 text-lg mb-8 leading-relaxed font-medium">{stage.instruction}</p>
                  <button 
                    onClick={() => setStageStatus('playing')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-900/40 flex items-center justify-center group"
                  >
                    <span>Initiate Scan</span>
                    <ChevronRight size={24} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
          </div>
        ) : stageStatus === 'playing' ? (
          <div className="flex-1 flex flex-col animate-slide-in-right">
              <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-white">{stage.title}</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">Select all correct elements to proceed.</p>
                  </div>
                  <div className="text-right">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Calibration</span>
                      <div className="flex gap-1">
                          {stage.items.filter(i => i.isCorrect).map((_, idx) => (
                              <div key={idx} className={`h-1.5 w-6 rounded-full ${idx < selectedIds.length ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                          ))}
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stage.items.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            disabled={isSelected}
                            className={`p-6 rounded-[1.5rem] border-2 text-left transition-all relative overflow-hidden group
                            ${isSelected 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                                : 'bg-slate-800/40 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/60'}`}
                          >
                            <div className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors
                                    ${isSelected ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-400'}`}>
                                    {isSelected ? <CheckCircle size={18} /> : <Zap size={18} />}
                                </div>
                                <span className="font-bold text-sm md:text-base leading-snug">{item.text}</span>
                            </div>
                          </button>
                      );
                  })}
              </div>

              {/* Live HUD Feedback */}
              <div className="mt-auto pt-8">
                  <div className={`p-5 rounded-2xl border flex items-start gap-4 transition-all duration-300
                      ${showFeedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                      ${showFeedback?.includes('Correct') || showFeedback?.includes('Crucial') || showFeedback?.includes('habit') 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                      <Info size={20} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Architect Insight</span>
                        <p className="text-sm font-bold leading-relaxed">{showFeedback || 'Scanning input data...'}</p>
                      </div>
                  </div>
              </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center animate-zoom-in">
              <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-900/20">
                  <Rocket size={40} />
              </div>
              <h2 className="text-3xl font-black mb-2">Sector Clear</h2>
              <p className="text-slate-400 font-medium mb-8">Navigation skills calibrated for this module.</p>
              <button 
                onClick={nextStage}
                className="w-full max-w-sm bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Warp to Next Sector</span>
                <ChevronRight size={20} />
              </button>
          </div>
        )}
      </div>

      {/* Progress Footer */}
      <div className="mt-8 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-t border-slate-800 pt-6">
          <span>Mission Progress</span>
          <div className="flex gap-2">
              {NAVIGATOR_SIMULATION.map((_, idx) => (
                  <div key={idx} className={`w-8 h-1 rounded-full ${idx === currentStageIdx ? 'bg-indigo-500' : idx < currentStageIdx ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              ))}
          </div>
          <span>Curriculum V.1.0</span>
      </div>
    </div>
  );
};
