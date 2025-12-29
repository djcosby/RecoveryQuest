
import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, Target } from 'lucide-react';
import { Peer, BossScenario } from '../../types';
import { BOSS_SCENARIOS } from '../../constants';

interface AssignQuestModalProps {
  peer: Peer;
  onClose: () => void;
  // Updated type to allow string IDs
  onAssign: (scenarioId: number | string) => void;
}

export const AssignQuestModal: React.FC<AssignQuestModalProps> = ({ peer, onClose, onAssign }) => {
  // Updated state type to allow string IDs
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | string | null>(null);

  const scenarios = Object.values(BOSS_SCENARIOS);

  const handleConfirm = () => {
    if (selectedScenarioId !== null) {
      onAssign(selectedScenarioId);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-indigo-600 p-5 text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <X size={20} />
            </button>
            <h3 className="font-extrabold text-lg">Assign Quest</h3>
            <p className="text-indigo-200 text-xs font-medium">Challenge {peer.name} to complete a scenario.</p>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto bg-slate-50">
            <div className="space-y-3">
                {scenarios.map((scenario) => (
                    <button
                        key={scenario.id}
                        onClick={() => setSelectedScenarioId(scenario.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all group flex items-center space-x-3
                        ${selectedScenarioId === scenario.id 
                            ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-100' 
                            : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                    >
                        <div className={`p-3 rounded-lg ${selectedScenarioId === scenario.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            <ShieldAlert size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-bold text-sm ${selectedScenarioId === scenario.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                                {scenario.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">Boss Scenario</p>
                        </div>
                        {selectedScenarioId === scenario.id && (
                            <CheckCircle size={20} className="text-indigo-500" />
                        )}
                    </button>
                ))}
            </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-white">
            <button 
                onClick={handleConfirm}
                disabled={selectedScenarioId === null}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
                <Target size={18} />
                <span>Send Quest to {peer.name.split(' ')[0]}</span>
            </button>
        </div>
      </div>
    </div>
  );
};
