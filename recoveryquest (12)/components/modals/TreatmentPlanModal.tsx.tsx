import React, { useState } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { useUserStore } from '../../context/UserContext';
import { TreatmentRequirement } from '../../types';

export const TreatmentPlanModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state: user, updateProfile } = useUserStore();
  const [requirements, setRequirements] = useState<TreatmentRequirement[]>(user.profile.treatmentPlan || []);
  const [newLabel, setNewLabel] = useState('');
  const [newCount, setNewCount] = useState(1);

  const addReq = () => {
    if (!newLabel) return;
    const req: TreatmentRequirement = {
        id: Date.now().toString(),
        label: newLabel,
        frequency: 'weekly',
        targetCount: newCount,
        currentCount: 0
    };
    setRequirements([...requirements, req]);
    setNewLabel('');
    setNewCount(1);
  };

  const handleSave = () => {
      updateProfile({ treatmentPlan: requirements });
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/90 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-lg">Treatment Plan</h3>
                <button onClick={onClose}><X /></button>
            </div>
            
            <div className="space-y-2 mb-6">
                {requirements.map(r => (
                    <div key={r.id} className="flex justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div>
                            <span className="font-bold block text-sm">{r.label}</span>
                            <span className="text-xs text-slate-500">{r.targetCount}x per {r.frequency}</span>
                        </div>
                        <button onClick={() => setRequirements(requirements.filter(x => x.id !== r.id))} className="text-rose-500"><Trash size={16} /></button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 mb-6">
                <input 
                    className="flex-1 border-2 border-slate-200 rounded-xl p-2 text-sm font-bold" 
                    placeholder="e.g. IOP Group"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                />
                <input 
                    type="number"
                    className="w-16 border-2 border-slate-200 rounded-xl p-2 text-center font-bold"
                    value={newCount}
                    onChange={e => setNewCount(parseInt(e.target.value))}
                />
                <button onClick={addReq} className="bg-indigo-500 text-white p-2 rounded-xl"><Plus /></button>
            </div>

            <button onClick={handleSave} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl">Save Plan</button>
        </div>
    </div>
  );
};