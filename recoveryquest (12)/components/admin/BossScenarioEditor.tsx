
import React, { useMemo, useState } from 'react';
import { DesignerBossScenario, DesignerScenarioScene, DesignerScenarioOption } from '../../types';
import { validateSingleBossScenario } from '../../utils/curriculumLint';

interface BossScenarioEditorProps {
  value: DesignerBossScenario;
  onChange: (scenario: DesignerBossScenario) => void;
  widthClass?: string; // optional (e.g., "max-w-3xl")
}

export const BossScenarioEditor: React.FC<BossScenarioEditorProps> = ({
  value,
  onChange,
  widthClass = 'max-w-4xl',
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    value.initialSceneId
  );

  const selectedScene =
    value.scenes.find((s) => s.id === selectedSceneId) || value.scenes[0];

  const sceneIds = useMemo(
    () => value.scenes.map((s) => s.id),
    [value.scenes]
  );

  const validationIssues = useMemo(
    () => validateSingleBossScenario(value),
    [value]
  );

  const sceneSpecificIssues = (sceneId?: string) =>
    validationIssues.filter((i) => !sceneId || i.sceneId === sceneId);

  const updateScene = (sceneId: string, updater: (scene: DesignerScenarioScene) => DesignerScenarioScene) => {
    const newScenes = value.scenes.map((s) =>
      s.id === sceneId ? updater(s) : s
    );
    onChange({ ...value, scenes: newScenes });
  };

  const addScene = () => {
    const baseId = 'scene_';
    let idx = 1;
    while (sceneIds.includes(`${baseId}${idx}`)) idx++;
    const newSceneId = `${baseId}${idx}`;
    const newScene: DesignerScenarioScene = {
      id: newSceneId,
      text: 'New scene...',
      options: [],
    };
    onChange({ ...value, scenes: [...value.scenes, newScene] });
    setSelectedSceneId(newSceneId);
  };

  const deleteScene = (sceneId: string) => {
    if (value.scenes.length <= 1) return; // keep at least one

    const filtered = value.scenes.filter((s) => s.id !== sceneId);
    let newInitial = value.initialSceneId;

    if (sceneId === value.initialSceneId) {
      newInitial = filtered[0]?.id ?? '';
    }

    onChange({
      ...value,
      initialSceneId: newInitial,
      scenes: filtered,
    });

    setSelectedSceneId(newInitial);
  };

  const addOptionToScene = (sceneId: string) => {
    updateScene(sceneId, (scene) => {
      const idx = scene.options.length + 1;
      const newOption: DesignerScenarioOption = {
        id: `opt_${Date.now()}_${idx}`,
        text: 'New choice',
        outcome: 'neutral',
        feedback: 'Feedback...',
      };
      return { ...scene, options: [...scene.options, newOption] };
    });
  };

  const updateOption = (
    sceneId: string,
    optionId: string,
    updater: (opt: DesignerScenarioOption) => DesignerScenarioOption
  ) => {
    updateScene(sceneId, (scene) => ({
      ...scene,
      options: scene.options.map((opt) =>
        opt.id === optionId ? updater(opt) : opt
      ),
    }));
  };

  const deleteOption = (sceneId: string, optionId: string) => {
    updateScene(sceneId, (scene) => ({
      ...scene,
      options: scene.options.filter((opt) => opt.id !== optionId),
    }));
  };

  return (
    <div className={`bg-slate-900 text-slate-100 rounded-2xl p-4 ${widthClass}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase text-slate-400">
            Boss Scenario Designer
          </div>
          <div className="font-semibold text-sm">
            {value.title} <span className="text-slate-500">({value.id})</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400">
          Scenes: {value.scenes.length}
        </div>
      </div>

      {/* Scenario metadata */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-[11px]">
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">
            Title
          </label>
          <input
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px]"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">
            Initial Scene
          </label>
          <select
            value={value.initialSceneId}
            onChange={(e) =>
              onChange({ ...value, initialSceneId: e.target.value })
            }
            className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px]"
          >
            {sceneIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] text-slate-400 mb-1">
            Description (optional)
          </label>
          <textarea
            value={value.description ?? ''}
            onChange={(e) =>
              onChange({ ...value, description: e.target.value })
            }
            className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] h-16"
          />
        </div>
      </div>

      {/* Scenes & options editor */}
      <div className="grid grid-cols-[160px,1fr] gap-3">
        {/* Scene list */}
        <div className="border border-slate-800 rounded-xl p-2 text-[11px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase text-slate-400 font-bold">
              Scenes
            </span>
            <button
              type="button"
              onClick={addScene}
              className="px-2 py-0.5 bg-emerald-600 text-xs rounded font-bold"
            >
              + Scene
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-auto">
            {value.scenes.map((scene) => {
              const isSelected = scene.id === selectedScene?.id;
              const issues = sceneSpecificIssues(scene.id);
              const hasError = issues.some((i) => i.level === 'error');
              const hasWarning = issues.some((i) => i.level === 'warning');

              return (
                <button
                  key={scene.id}
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={`w-full text-left px-2 py-1 rounded flex justify-between items-center ${
                    isSelected ? 'bg-slate-100 text-slate-900' : 'bg-slate-800'
                  }`}
                >
                  <span className="truncate">{scene.id}</span>
                  <span className="flex space-x-1">
                    {scene.id === value.initialSceneId && (
                      <span className="text-[8px] px-1 rounded bg-blue-500 text-white">
                        start
                      </span>
                    )}
                    {hasError && (
                      <span className="text-[8px] px-1 rounded bg-rose-500 text-white">
                        !
                      </span>
                    )}
                    {!hasError && hasWarning && (
                      <span className="text-[8px] px-1 rounded bg-amber-500 text-white">
                        ?
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedScene && value.scenes.length > 1 && (
            <button
              type="button"
              onClick={() => deleteScene(selectedScene.id)}
              className="mt-2 w-full text-center text-[10px] text-rose-400 hover:text-rose-300"
            >
              Delete selected scene
            </button>
          )}
        </div>

        {/* Selected scene editor */}
        {selectedScene ? (
          <div className="border border-slate-800 rounded-xl p-3 text-[11px]">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-bold">
                  Scene
                </div>
                <div className="font-semibold">{selectedScene.id}</div>
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-[10px] text-slate-400 mb-1">
                Scene Text
              </label>
              <textarea
                value={selectedScene.text}
                onChange={(e) =>
                  updateScene(selectedScene.id, (s) => ({
                    ...s,
                    text: e.target.value,
                  }))
                }
                className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] h-20"
              />
            </div>

            {/* Options */}
            <div className="flex justify-between items-center mt-3 mb-1">
              <span className="text-[10px] uppercase text-slate-400 font-bold">
                Options
              </span>
              <button
                type="button"
                onClick={() => addOptionToScene(selectedScene.id)}
                className="px-2 py-0.5 bg-indigo-600 rounded text-[10px] font-bold"
              >
                + Option
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-auto">
              {selectedScene.options.map((opt) => {
                const optIssues = sceneSpecificIssues(selectedScene.id).filter(
                  (i) => i.optionId === opt.id
                );
                const hasError = optIssues.some((i) => i.level === 'error');

                return (
                  <div
                    key={opt.id}
                    className={`rounded-lg border p-2 ${
                      hasError
                        ? 'border-rose-500 bg-rose-900/20'
                        : 'border-slate-700 bg-slate-900/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[11px]">
                        {opt.id}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          deleteOption(selectedScene.id, opt.id)
                        }
                        className="text-[10px] text-slate-400 hover:text-rose-300"
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      value={opt.text}
                      onChange={(e) =>
                        updateOption(selectedScene.id, opt.id, (o) => ({
                          ...o,
                          text: e.target.value,
                        }))
                      }
                      className="w-full mb-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px]"
                      placeholder="Option text..."
                    />
                    <div className="grid grid-cols-3 gap-1 mb-1">
                      <div>
                        <label className="block text-[9px] text-slate-400">
                          Outcome
                        </label>
                        <select
                          value={opt.outcome}
                          onChange={(e) =>
                            updateOption(selectedScene.id, opt.id, (o) => ({
                              ...o,
                              outcome:
                                e.target.value as DesignerScenarioOption['outcome'],
                            }))
                          }
                          className="w-full px-1 py-1 rounded bg-slate-800 border border-slate-700 text-[10px]"
                        >
                          <option value="safe">safe</option>
                          <option value="risk">risk</option>
                          <option value="neutral">neutral</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400">
                          XP
                        </label>
                        <input
                          type="number"
                          value={opt.xp ?? ''}
                          onChange={(e) =>
                            updateOption(selectedScene.id, opt.id, (o) => ({
                              ...o,
                              xp:
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value),
                            }))
                          }
                          className="w-full px-1 py-1 rounded bg-slate-800 border border-slate-700 text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400">
                          Damage
                        </label>
                        <input
                          type="number"
                          value={opt.damage ?? ''}
                          onChange={(e) =>
                            updateOption(selectedScene.id, opt.id, (o) => ({
                              ...o,
                              damage:
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value),
                            }))
                          }
                          className="w-full px-1 py-1 rounded bg-slate-800 border border-slate-700 text-[10px]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      <div>
                        <label className="block text-[9px] text-slate-400">
                          Next Scene
                        </label>
                        <select
                          value={opt.nextSceneId ?? ''}
                          onChange={(e) =>
                            updateOption(selectedScene.id, opt.id, (o) => ({
                              ...o,
                              nextSceneId:
                                e.target.value === ''
                                  ? undefined
                                  : e.target.value,
                            }))
                          }
                          className="w-full px-1 py-1 rounded bg-slate-800 border border-slate-700 text-[10px]"
                        >
                          <option value="">(end)</option>
                          {sceneIds.map((id) => (
                            <option key={id} value={id}>
                              {id}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-400">
                          Tags (comma)
                        </label>
                        <input
                          value={opt.tags?.join(', ') ?? ''}
                          onChange={(e) =>
                            updateOption(selectedScene.id, opt.id, (o) => ({
                              ...o,
                              tags:
                                e.target.value.trim() === ''
                                  ? undefined
                                  : e.target.value
                                      .split(',')
                                      .map((t) => t.trim())
                                      .filter(Boolean),
                            }))
                          }
                          className="w-full px-1 py-1 rounded bg-slate-800 border border-slate-700 text-[10px]"
                        />
                      </div>
                    </div>
                    <textarea
                      value={opt.feedback}
                      onChange={(e) =>
                        updateOption(selectedScene.id, opt.id, (o) => ({
                          ...o,
                          feedback: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] h-12"
                      placeholder="Feedback text..."
                    />
                    {optIssues.length > 0 && (
                      <ul className="mt-1 text-[9px] text-rose-300 list-disc list-inside">
                        {optIssues.map((iss, i) => (
                          <li key={i}>{iss.message}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
              {selectedScene.options.length === 0 && (
                <div className="text-[10px] text-slate-500 italic">
                  No options yet. Add one to make the scene interactive.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 flex items-center justify-center">
            No scene selected
          </div>
        )}
      </div>

      {/* Global validation + JSON output */}
      <div className="mt-4 grid grid-cols-[1.2fr,1.8fr] gap-3 text-[11px]">
        <div className="border border-slate-800 rounded-xl p-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold">
              Validation
            </span>
          </div>
          {validationIssues.length === 0 ? (
            <div className="text-emerald-300 text-[11px]">
              ✓ No issues detected.
            </div>
          ) : (
            <ul className="space-y-1 max-h-28 overflow-auto">
              {validationIssues.map((iss, i) => (
                <li
                  key={i}
                  className={
                    iss.level === 'error'
                      ? 'text-rose-300'
                      : 'text-amber-200'
                  }
                >
                  [{iss.level.toUpperCase()}] {iss.message}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border border-slate-800 rounded-xl p-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold">
              JSON (copy/paste to file or CMS)
            </span>
          </div>
          <textarea
            readOnly
            value={JSON.stringify(value, null, 2)}
            className="w-full h-28 text-[10px] font-mono bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-100"
          />
        </div>
      </div>
    </div>
  );
};
