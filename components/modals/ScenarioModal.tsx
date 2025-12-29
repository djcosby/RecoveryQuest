
import React, { useState } from 'react';
import { ShieldAlert, Heart, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { BossScenario, ScenarioOption } from '../../types';
import { useUserStore } from '../../context/UserContext';

export const ScenarioModal: React.FC<{ scenario: BossScenario; onClose: () => void; onComplete: (xp: number) => void; onFail: () => void; }> = ({ scenario, onClose, onComplete, onFail }) => {
  const { state: user, takeDamage } = useUserStore();
  const [currentSceneId, setCurrentSceneId] = useState(scenario.initialSceneId);
  
  // Local feedback state
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'danger' | 'neutral' } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [isFailed, setIsFailed] = useState(false);

  const currentScene = scenario.scenes[currentSceneId];

  const handleOption = (option: ScenarioOption) => {
    // 1. Handle Damage (Global Hearts)
    if (option.damage) {
      takeDamage(option.damage);
      
      // Check if user died
      if (user.hearts - option.damage <= 0) {
        setFeedback({ text: option.feedback + " (You ran out of hearts!)", type: 'danger' });
        setIsFailed(true);
        return;
      }
    }

    // 2. Accumulate XP
    if (option.xp) setTotalXP(prev => prev + option.xp);

    // 3. Show Feedback
    setFeedback({
      text: option.feedback,
      type: option.outcome === 'safe' ? 'success' : option.outcome === 'risk' ? 'danger' : 'neutral'
    });

    // 4. Navigate or Complete
    if (option.nextSceneId) {
      setTimeout(() => {
        setFeedback(null);
        setCurrentSceneId(option.nextSceneId!);
      }, 2000);
    } else if (option.outcome !== 'risk') {
       // Safe/Neutral ending
       setCompleted(true);
    } else if (option.outcome === 'risk') {
        // Risk ending but survived (hearts > 0)
        // If we survived the damage above, we complete
        if (!isFailed) setCompleted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-900/50 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-900/30 rounded-lg text-red-500">
                    <ShieldAlert size={20} />
                </div>
                <div>
                    <h3 className="font-extrabold text-slate-100 uppercase tracking-wider text-sm">Boss Battle</h3>
                    <p className="text-slate-400 text-xs font-bold">{scenario.title}</p>
                </div>
            </div>
            <div className="flex space-x-1">
                {[...Array(user.maxHearts)].map((_, i) => (
                    <Heart key={i} size={20} className={`${i < user.hearts ? 'fill-red-500 text-red-500' : 'fill-slate-700 text-slate-700'} transition-colors duration-300`} />
                ))}
            </div>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-center">
            {isFailed ? (
                <div className="text-center animate-zoom-in">
                    <XCircle size={64} className="mx-auto text-rose-500 mb-4" />
                    <h2 className="text-2xl font-extrabold text-white mb-2">Defeated</h2>
                    <p className="text-slate-400 mb-6 font-medium">You need to rest and recover your strength.</p>
                    <button onClick={onClose} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl shadow-lg">
                        Retreat & Recover
                    </button>
                </div>
            ) : completed ? (
                 <div className="text-center animate-zoom-in">
                    <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
                    <h2 className="text-2xl font-extrabold text-white mb-2">Scenario Survived</h2>
                    <button onClick={() => onComplete(totalXP)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20">
                        Collect {totalXP} XP
                    </button>
                 </div>
            ) : feedback ? (
                <div className={`text-center p-6 rounded-2xl animate-slide-in-bottom ${feedback.type === 'success' ? 'bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400' : feedback.type === 'danger' ? 'bg-red-500/10 border-2 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-2 border-blue-500/30 text-blue-400'}`}>
                    <h3 className="font-extrabold text-xl mb-2">{feedback.type === 'success' ? 'Good Choice!' : feedback.type === 'danger' ? 'Critical Risk!' : 'Observation'}</h3>
                    <p className="font-medium text-lg">{feedback.text}</p>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    <p className="text-lg md:text-xl text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">{currentScene.text}</p>
                    <div className="space-y-3">
                        {currentScene.options.map((opt, idx) => (
                            <button key={idx} onClick={() => handleOption(opt)} className="w-full p-4 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 hover:border-slate-500 rounded-xl text-left transition-all group flex justify-between items-center">
                                <span className="font-bold text-slate-200 group-hover:text-white">{opt.text}</span>
                                <ArrowRight size={20} className="text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
