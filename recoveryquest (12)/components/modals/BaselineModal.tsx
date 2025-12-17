
import React, { useState } from 'react';
import { X, ClipboardList, ArrowRight, CheckCircle, User, History, Target } from 'lucide-react';
import { BaselineData } from '../../types';

export const BaselineModal: React.FC<{ 
    onClose: () => void; 
    onSave: (data: BaselineData) => void; 
}> = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BaselineData>({
    completedDate: new Date().toISOString(),
    demographics: {
      ageRange: '',
      genderIdentity: '',
      zipCode: ''
    },
    history: {
      primarySubstance: '',
      yearsOfUse: '',
      previousTreatments: 0,
      familyHistory: false
    },
    goals: {
      primaryGoal: 'Abstinence',
      biggestBarrier: '',
      motivationLevel: 5
    }
  });

  const updateField = (section: keyof BaselineData, field: string, value: any) => {
    setFormData(prev => ({
        ...prev,
        [section]: {
            ...prev[section as any],
            [field]: value
        }
    }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[75] bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <ClipboardList size={20} />
                </div>
                <div>
                    <h3 className="font-extrabold text-slate-800">Baseline Assessment</h3>
                    <p className="text-xs text-slate-500 font-bold">Step {step} of 3</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {step === 1 && (
                <div className="space-y-6 animate-slide-in-right">
                    <div className="flex items-center space-x-2 text-indigo-500 font-bold text-sm uppercase tracking-wide mb-2">
                        <User size={16} /> <span>Demographics</span>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Age Range</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            value={formData.demographics.ageRange}
                            onChange={(e) => updateField('demographics', 'ageRange', e.target.value)}
                        >
                            <option value="">Select Age</option>
                            <option value="18-24">18-24</option>
                            <option value="25-34">25-34</option>
                            <option value="35-44">35-44</option>
                            <option value="45-54">45-54</option>
                            <option value="55+">55+</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Gender Identity</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            value={formData.demographics.genderIdentity}
                            onChange={(e) => updateField('demographics', 'genderIdentity', e.target.value)}
                        >
                            <option value="">Select Identity</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-Binary">Non-Binary</option>
                            <option value="Transgender">Transgender</option>
                            <option value="Other">Other / Prefer not to say</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Zip Code</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            placeholder="e.g. 90210"
                            value={formData.demographics.zipCode}
                            onChange={(e) => updateField('demographics', 'zipCode', e.target.value)}
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-slide-in-right">
                    <div className="flex items-center space-x-2 text-rose-500 font-bold text-sm uppercase tracking-wide mb-2">
                        <History size={16} /> <span>History & Context</span>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Primary Substance / Challenge</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-100"
                            placeholder="e.g. Alcohol, Opioids, Gambling"
                            value={formData.history.primarySubstance}
                            onChange={(e) => updateField('history', 'primarySubstance', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Years of Use/Struggle</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-100"
                            value={formData.history.yearsOfUse}
                            onChange={(e) => updateField('history', 'yearsOfUse', e.target.value)}
                        >
                            <option value="">Select Duration</option>
                            <option value="<1 Year">Less than 1 Year</option>
                            <option value="1-5 Years">1-5 Years</option>
                            <option value="5-10 Years">5-10 Years</option>
                            <option value="10+ Years">10+ Years</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Previous Treatment Attempts</label>
                        <input 
                            type="number" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-100"
                            value={formData.history.previousTreatments}
                            onChange={(e) => updateField('history', 'previousTreatments', parseInt(e.target.value) || 0)}
                        />
                    </div>

                    <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 accent-rose-500"
                            checked={formData.history.familyHistory}
                            onChange={(e) => updateField('history', 'familyHistory', e.target.checked)}
                        />
                        <span className="text-sm font-bold text-slate-700">Family History of Addiction</span>
                    </label>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-slide-in-right">
                    <div className="flex items-center space-x-2 text-emerald-500 font-bold text-sm uppercase tracking-wide mb-2">
                        <Target size={16} /> <span>Goals & Motivation</span>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Primary Goal</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            value={formData.goals.primaryGoal}
                            onChange={(e) => updateField('goals', 'primaryGoal', e.target.value)}
                        >
                            <option value="Abstinence">Complete Abstinence</option>
                            <option value="Moderation">Moderation / Control</option>
                            <option value="Harm Reduction">Harm Reduction</option>
                            <option value="Process Addiction">Stop Specific Behavior</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Biggest Barrier to Success</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            placeholder="e.g. Stress, Social Circle, Boredom"
                            value={formData.goals.biggestBarrier}
                            onChange={(e) => updateField('goals', 'biggestBarrier', e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-500">Motivation Level (1-10)</label>
                            <span className="text-emerald-600 font-extrabold">{formData.goals.motivationLevel}</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" max="10" 
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            value={formData.goals.motivationLevel}
                            onChange={(e) => updateField('goals', 'motivationLevel', parseInt(e.target.value))}
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>Not Ready</span>
                            <span>Unstoppable</span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
            <button 
                onClick={handleNext}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all"
            >
                {step < 3 ? (
                    <><span>Next Step</span><ArrowRight size={20} /></>
                ) : (
                    <><span>Complete Baseline</span><CheckCircle size={20} /></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
