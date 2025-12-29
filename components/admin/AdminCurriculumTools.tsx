
import React, { useState } from 'react';
import { DesignerCurriculum, DesignerBossScenario, LintResult, LibraryBook } from '../../types';
import { DESIGNER_CURRICULUM } from '../../utils/designerData';
import { lintDesignerCurriculum } from '../../utils/curriculumLint';
import { BossScenarioEditor } from './BossScenarioEditor';
import { CurriculumIngestor } from './CurriculumIngestor';
import { useLibraryStore } from '../../context/LibraryContext';
// Added missing icons to imports
import { Wand2, ShieldAlert, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

interface AdminCurriculumToolsProps {
  initialCurriculum?: DesignerCurriculum;
}

const ContentMonitor: React.FC = () => {
  const { library } = useLibraryStore();
  const uploads = library.filter(b => b.type === 'upload');

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
          <Activity size={16} className="text-indigo-400" /> Content Monitor
      </h3>
      {uploads.length === 0 ? (
        <div className="text-slate-500 text-xs italic">No user uploads detected in current runtime.</div>
      ) : (
        <div className="space-y-2">
          {uploads.map(b => (
            <div key={b.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex justify-between items-center group hover:border-slate-500 transition-colors">
              <div>
                <div className="font-bold text-slate-200 text-sm">{b.title}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Author: {b.author} • {new Date(b.uploadedAt).toLocaleDateString()}</div>
              </div>
              <div className="flex space-x-2">
                <button className="text-[9px] font-black uppercase tracking-widest bg-rose-900/50 text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-800 transition-colors">Flag Policy Violation</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminCurriculumTools: React.FC<AdminCurriculumToolsProps> = ({
  initialCurriculum = DESIGNER_CURRICULUM,
}) => {
  const [curriculum, setCurriculum] = useState<DesignerCurriculum>(initialCurriculum);
  const [activeTab, setActiveTab] = useState<'boss' | 'monitor' | 'ingest'>('boss');
  const [selectedBossId, setSelectedBossId] = useState<string | number | undefined>(curriculum.bossScenarios[0]?.id);
  const [lintResult, setLintResult] = useState<LintResult | null>(null);

  const selectedBoss = curriculum.bossScenarios.find((b) => b.id === selectedBossId) || curriculum.bossScenarios[0];

  const updateBossScenario = (updated: DesignerBossScenario) => {
    setCurriculum((prev) => ({
      ...prev,
      bossScenarios: prev.bossScenarios.map((b) => (b.id === updated.id ? updated : b)),
    }));
  };

  const handleRunLint = () => {
    const result = lintDesignerCurriculum(curriculum);
    setLintResult(result);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-[2.5rem] p-6 shadow-2xl border border-slate-800 max-w-6xl mx-auto max-h-[90vh] overflow-y-auto font-sans">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 font-black mb-1">
            System Administration
          </div>
          <div className="flex space-x-1">
            <button 
                onClick={() => setActiveTab('boss')} 
                className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${activeTab === 'boss' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
                Scenario Architect
            </button>
            <button 
                onClick={() => setActiveTab('ingest')} 
                className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'ingest' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
                <Wand2 size={14} /> AI Ingestor
            </button>
            <button 
                onClick={() => setActiveTab('monitor')} 
                className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${activeTab === 'monitor' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
                Safety Monitor
            </button>
          </div>
        </div>
        <div className="text-right">
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Environment</div>
            <div className="text-emerald-500 font-bold text-xs flex items-center justify-end gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Production Ready
            </div>
        </div>
      </div>

      {activeTab === 'ingest' ? (
        <CurriculumIngestor />
      ) : activeTab === 'monitor' ? (
        <ContentMonitor />
      ) : (
        <>
          <div className="flex items-center space-x-3 text-[11px] mb-6 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <span className="font-black text-slate-500 uppercase tracking-widest">Select Target:</span>
            <select
              value={selectedBoss?.id ?? ''}
              onChange={(e) => setSelectedBossId(isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 ring-indigo-500"
            >
              {curriculum.bossScenarios.map((boss) => (
                <option key={boss.id} value={boss.id as any}>
                  {boss.id} · {boss.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleRunLint}
              className="px-6 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors shadow-lg active:scale-95 ml-auto"
            >
              Verify Integrity
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr,350px] gap-8 items-start">
            <div className="bg-slate-950/40 rounded-[2rem] border border-slate-800 p-2 overflow-hidden shadow-inner">
              {selectedBoss ? (
                <BossScenarioEditor value={selectedBoss} onChange={updateBossScenario} />
              ) : (
                <div className="p-12 text-center text-slate-500 italic flex flex-col items-center">
                    <ShieldAlert size={48} className="mb-4 opacity-10" />
                    No active scenario selected.
                </div>
              )}
            </div>

            <div className="space-y-6">
                {/* Lint Results Panel */}
                <div className="bg-slate-950/60 rounded-[2rem] border border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Diagnostic Report</h4>
                        {lintResult && (
                            <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black ${lintResult.errorCount > 0 ? 'bg-rose-900/40 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>{lintResult.errorCount} ERR</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black ${lintResult.warningCount > 0 ? 'bg-amber-900/40 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>{lintResult.warningCount} WRN</span>
                            </div>
                        )}
                    </div>

                    {!lintResult ? (
                        <p className="text-[11px] text-slate-500 italic leading-relaxed">Run a system check to identify dead-ends or logic errors in your curriculum path.</p>
                    ) : lintResult.issues.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 bg-emerald-950/20 rounded-2xl border border-emerald-900/30 text-emerald-400">
                            <CheckCircle size={20} />
                            <span className="text-xs font-bold">Pathway integration verified.</span>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                            {lintResult.issues.map((issue, idx) => (
                                <div key={idx} className={`p-3 rounded-xl border flex gap-3 ${issue.level === 'error' ? 'bg-rose-950/30 border-rose-900/40 text-rose-200' : 'bg-amber-950/30 border-amber-900/40 text-amber-200'}`}>
                                    <div className="shrink-0 mt-0.5">{issue.level === 'error' ? <ShieldAlert size={14} /> : <AlertTriangle size={14} />}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[8px] font-black uppercase">{issue.scope}</span>
                                            <span className="text-[7px] font-bold opacity-50">U:{issue.unitId || '?'} N:{issue.nodeId || '?'}</span>
                                        </div>
                                        <p className="text-[10px] leading-relaxed font-medium">{issue.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-slate-800/40 rounded-3xl p-6 border border-slate-700">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Architect Note</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">"Dynamic scenarios should always include an exit node. Leaving a conversation is a valid clinical skill."</p>
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
