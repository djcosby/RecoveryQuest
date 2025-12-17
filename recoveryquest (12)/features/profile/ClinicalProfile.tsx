
import React, { useState } from 'react';
import { LineChart, Brain, Activity, TrendingUp, AlertTriangle, ShieldCheck, RefreshCw, ClipboardList } from 'lucide-react';
import { useUserStore } from '../../context/UserContext';
import { generateUserConceptualization } from '../../services/geminiService';
import { ClinicalConceptualization } from '../../types';

export const ClinicalProfile: React.FC = () => {
  const { state: user, updateClinicalProfile } = useUserStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRefresh = async () => {
    setIsGenerating(true);
    const profile = await generateUserConceptualization(user.assessmentHistory, user.caseFile);
    if (profile) {
        updateClinicalProfile(profile);
    }
    setIsGenerating(false);
  };

  // Group history by assessment type for display
  const historyByType: Record<string, any[]> = {};
  user.assessmentHistory.forEach(entry => {
      if (!historyByType[entry.assessmentTitle]) {
          historyByType[entry.assessmentTitle] = [];
      }
      historyByType[entry.assessmentTitle].push(entry);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* AI Conceptualization Card */}
      <div className="bg-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                          <Brain size={24} className="text-indigo-300" />
                      </div>
                      <div>
                          <h3 className="font-extrabold text-lg">Clinical Conceptualization</h3>
                          <p className="text-xs text-slate-400 font-medium">AI-Generated Psychological Profile</p>
                      </div>
                  </div>
                  <button 
                    onClick={handleRefresh}
                    disabled={isGenerating}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors disabled:opacity-50"
                  >
                      <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
                  </button>
              </div>

              {user.clinicalProfile ? (
                  <div className="space-y-4 animate-fade-in">
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                          <p className="text-sm leading-relaxed text-slate-200 italic">"{user.clinicalProfile.summary}"</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <h4 className="text-xs font-bold text-emerald-400 uppercase flex items-center">
                                  <ShieldCheck size={12} className="mr-1" /> Protective Factors
                              </h4>
                              <ul className="space-y-1">
                                  {user.clinicalProfile.strengths.map((s, i) => (
                                      <li key={i} className="text-xs bg-emerald-900/20 text-emerald-200 px-2 py-1.5 rounded-lg border border-emerald-900/30">
                                          {s}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                          <div className="space-y-2">
                              <h4 className="text-xs font-bold text-rose-400 uppercase flex items-center">
                                  <AlertTriangle size={12} className="mr-1" /> Risk Factors
                              </h4>
                              <ul className="space-y-1">
                                  {user.clinicalProfile.riskFactors.map((r, i) => (
                                      <li key={i} className="text-xs bg-rose-900/20 text-rose-200 px-2 py-1.5 rounded-lg border border-rose-900/30">
                                          {r}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </div>

                      <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Recommended Clinical Focus</span>
                          <span className="text-xs font-extrabold text-indigo-300 bg-indigo-900/40 px-3 py-1 rounded-full border border-indigo-500/30">
                              {user.clinicalProfile.recommendedFocus}
                          </span>
                      </div>
                  </div>
              ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                      No profile generated yet. Tap refresh to analyze data.
                  </div>
              )}
          </div>
          {/* Background pattern */}
          <div className="absolute -right-10 -bottom-10 opacity-5">
              <Brain size={200} />
          </div>
      </div>

      {/* Assessment History */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100">
          <h3 className="font-extrabold text-slate-700 mb-6 flex items-center">
              <Activity size={20} className="mr-2 text-blue-500" /> Assessment History
          </h3>

          {Object.keys(historyByType).length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <ClipboardList size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-xs font-bold">No assessments recorded.</p>
              </div>
          ) : (
              <div className="space-y-6">
                  {Object.entries(historyByType).map(([title, entries]) => (
                      <div key={title} className="border border-slate-100 rounded-2xl overflow-hidden">
                          <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                              <span className="font-bold text-slate-700 text-sm">{title}</span>
                              <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">{entries.length} Records</span>
                          </div>
                          <div className="p-2 space-y-1">
                              {entries.slice().reverse().map((entry) => (
                                  <div key={entry.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                      <span className="text-xs font-medium text-slate-500">{new Date(entry.date).toLocaleDateString()}</span>
                                      <div className="text-right">
                                          <span className="block text-xs font-extrabold text-slate-800">{entry.score}</span>
                                          <span className="block text-[9px] text-slate-400 uppercase">{entry.resultLabel}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          {/* Simple CSS Bar Chart Visualization */}
                          <div className="h-16 flex items-end justify-between px-2 pb-2 space-x-1 border-t border-slate-100 bg-slate-50/30 mt-2 pt-2">
                              {entries.slice(-10).map((entry) => {
                                  // Normalize height (assuming max score varies, but generally fitting 0-27 range of PHQ-9 as baseline)
                                  const height = Math.min(100, (entry.score / 27) * 100); 
                                  return (
                                      <div key={entry.id} className="flex-1 flex flex-col justify-end group relative">
                                          <div 
                                            className="w-full bg-indigo-400 rounded-t-sm opacity-70 group-hover:opacity-100 transition-all" 
                                            style={{ height: `${Math.max(10, height)}%` }}
                                          ></div>
                                          {/* Tooltip */}
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                              {entry.score} ({entry.resultLabel})
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};
