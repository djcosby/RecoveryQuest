
import React, { useState } from 'react';
import { DesignerCurriculum, DesignerBossScenario, LintResult, LibraryBook } from '../../types';
import { DESIGNER_CURRICULUM } from '../../utils/designerData';
import { lintDesignerCurriculum } from '../../utils/curriculumLint';
import { BossScenarioEditor } from './BossScenarioEditor';
import { useLibraryStore } from '../../context/LibraryContext';

interface AdminCurriculumToolsProps {
  initialCurriculum?: DesignerCurriculum;
}

const ContentMonitor: React.FC = () => {
  const { library } = useLibraryStore();
  const uploads = library.filter(b => b.type === 'upload');

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold text-slate-300 uppercase mb-4">Content Monitor</h3>
      {uploads.length === 0 ? (
        <div className="text-slate-500 text-xs">No user uploads found.</div>
      ) : (
        <div className="space-y-2">
          {uploads.map(b => (
            <div key={b.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200 text-sm">{b.title}</div>
                <div className="text-xs text-slate-500">Author: {b.author} | {new Date(b.uploadedAt).toLocaleDateString()}</div>
                <div className="text-[10px] text-slate-600 mt-1">First 50 chars: {b.chapters[0]?.content.substring(0, 50)}...</div>
              </div>
              <div className="flex space-x-2">
                <button className="text-[10px] bg-rose-900 text-rose-300 px-2 py-1 rounded hover:bg-rose-800">Flag</button>
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
  const [curriculum, setCurriculum] = useState<DesignerCurriculum>(
    initialCurriculum
  );
  const [activeTab, setActiveTab] = useState<'boss' | 'monitor'>('boss');
  const [selectedBossId, setSelectedBossId] = useState<
    string | number | undefined
  >(curriculum.bossScenarios[0]?.id);
  const [lintResult, setLintResult] = useState<LintResult | null>(null);

  const selectedBoss =
    curriculum.bossScenarios.find((b) => b.id === selectedBossId) ||
    curriculum.bossScenarios[0];

  const updateBossScenario = (updated: DesignerBossScenario) => {
    setCurriculum((prev) => ({
      ...prev,
      bossScenarios: prev.bossScenarios.map((b) =>
        b.id === updated.id ? updated : b
      ),
    }));
  };

  const handleRunLint = () => {
    const result = lintDesignerCurriculum(curriculum);
    setLintResult(result);
  };

  const handleCopyBossJson = () => {
    if (!selectedBoss) return;
    const json = JSON.stringify(selectedBoss, null, 2);
    navigator.clipboard?.writeText(json).catch(() => {});
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-4 shadow-2xl border border-slate-800 max-w-5xl mx-auto max-h-[90vh] overflow-y-auto">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-1">
            Admin · Tools
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setActiveTab('boss')} className={`text-xs px-2 py-1 rounded ${activeTab === 'boss' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Boss Editor</button>
            <button onClick={() => setActiveTab('monitor')} className={`text-xs px-2 py-1 rounded ${activeTab === 'monitor' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Content Monitor</button>
          </div>
        </div>
      </div>

      {activeTab === 'monitor' ? (
        <ContentMonitor />
      ) : (
        <>
          <div className="flex items-center space-x-2 text-[11px] mb-4">
            <select
              value={selectedBoss?.id ?? ''}
              onChange={(e) =>
                setSelectedBossId(
                  isNaN(Number(e.target.value))
                    ? e.target.value
                    : Number(e.target.value)
                )
              }
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1 text-[11px]"
            >
              {curriculum.bossScenarios.map((boss) => (
                <option key={boss.id} value={boss.id as any}>
                  {boss.id} · {boss.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCopyBossJson}
              className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-600 text-[11px] hover:bg-slate-700"
            >
              Copy Boss JSON
            </button>
            <button
              type="button"
              onClick={handleRunLint}
              className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-900 text-[11px] font-bold hover:bg-emerald-400"
            >
              Run Lint
            </button>
          </div>

          {/* Layout: editor + lint report */}
          <div className="grid grid-cols-[3fr,2fr] gap-4">
            {/* Boss editor */}
            <div className="border border-slate-800 rounded-2xl p-3 bg-slate-950/40">
              {selectedBoss ? (
                <BossScenarioEditor value={selectedBoss} onChange={updateBossScenario} />
              ) : (
                <div className="text-xs text-slate-400">
                  No boss scenarios defined.
                </div>
              )}
            </div>

            {/* Lint result */}
            <div className="border border-slate-800 rounded-2xl p-3 bg-slate-950/60 text-[11px]">
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] uppercase text-slate-400 font-bold">
                  Lint Report
                </div>
                {lintResult && (
                  <div className="flex space-x-2">
                    <span className="px-2 py-0.5 rounded bg-rose-900/50 text-rose-300">
                      {lintResult.errorCount} errors
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-200">
                      {lintResult.warningCount} warnings
                    </span>
                  </div>
                )}
              </div>

              {!lintResult ? (
                <div className="text-slate-500 text-[11px]">
                  Press <span className="font-semibold text-slate-200">Run Lint</span> to
                  analyze the current designer curriculum.
                </div>
              ) : lintResult.issues.length === 0 ? (
                <div className="text-emerald-300 text-[11px]">
                  ✓ No issues detected. Curriculum is clean.
                </div>
              ) : (
                <div className="space-y-1 max-h-64 overflow-auto pr-1">
                  {lintResult.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-xl px-2 py-1 mb-1 ${
                        issue.level === 'error'
                          ? 'border-rose-500/60 bg-rose-950/40 text-rose-200'
                          : 'border-amber-500/40 bg-amber-950/30 text-amber-100'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="uppercase text-[9px] font-bold">
                          {issue.level.toUpperCase()} · {issue.scope}
                        </span>
                        <span className="text-[9px] text-slate-300">
                          {issue.unitId && `U:${issue.unitId} `}
                          {issue.nodeId && `N:${issue.nodeId} `}
                          {issue.bossId && `B:${issue.bossId} `}
                          {issue.sceneId && `S:${issue.sceneId} `}
                          {issue.optionId && `O:${issue.optionId}`}
                        </span>
                      </div>
                      <div className="mt-0.5">{issue.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
