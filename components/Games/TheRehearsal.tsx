import React, { useEffect, useMemo, useRef, useState } from "react";
import { getScenarioById, REHEARSAL_SCENARIOS } from "./rehersal/scenarios";
import { Beat, Choice, GameResult, SelfReportLabel, ToolId } from "./rehersal/types";

type Props = {
  onExit: () => void;
  onAwardXp: (xp: number) => void;
  onComplete?: (result: GameResult) => void;
  scenarioId?: string;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function isSafeChoice(choice: Choice) {
  return choice.efficacy >= 4 || choice.style === "exit" || choice.style === "firm" || choice.style === "regulated";
}

function isExitChoice(choice: Choice) {
  return choice.style === "exit";
}

function pressureDrain(pressure: number) {
  return pressure <= 2 ? 2 : pressure === 3 ? 4 : pressure === 4 ? 7 : 10;
}

function startComposureFromSelfReport(pre0to10: number) {
  return clamp(Math.round(95 - pre0to10 * 5), 35, 95);
}

function toolLabel(t: ToolId) {
  switch (t) {
    case "box_breath": return "Box Breath";
    case "defusion": return "Defusion";
    case "play_tape": return "Play the Tape";
    case "grounding": return "Grounding";
    case "urge_surf": return "Urge Surf";
  }
}

function defaultSelfLabelForScenario(scenarioId: string): SelfReportLabel {
  if (scenarioId.includes("dealer")) return "urge";
  if (scenarioId.includes("invitation")) return "social_pressure";
  if (scenarioId.includes("family")) return "shame";
  return "urge";
}

export const TheRehearsal: React.FC<Props> = ({ onExit, onAwardXp, onComplete, scenarioId }) => {
  const defaultId = REHEARSAL_SCENARIOS.length > 0 ? REHEARSAL_SCENARIOS[0].id : "";
  
  const [phase, setPhase] = useState<"select" | "pre" | "run" | "post" | "summary">(
    scenarioId ? "pre" : "select"
  );

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarioId ?? defaultId);
  const scenario = useMemo(() => getScenarioById(selectedScenarioId), [selectedScenarioId]);

  const [selfLabel, setSelfLabel] = useState<SelfReportLabel>(() => defaultSelfLabelForScenario(selectedScenarioId));
  const [preIntensity, setPreIntensity] = useState<number>(7);
  const [postIntensity, setPostIntensity] = useState<number>(4);

  const [beatId, setBeatId] = useState<string>(scenario?.entryBeatId || "");
  const beat: Beat | undefined = scenario?.beats[beatId];

  const startedAtRef = useRef<number>(Date.now());

  const [composure, setComposure] = useState<number>(() => startComposureFromSelfReport(preIntensity));
  const composureStartRef = useRef<number>(composure);

  const [attempts, setAttempts] = useState<number>(0);
  const [safeChoices, setSafeChoices] = useState<number>(0);
  const [exitsUsed, setExitsUsed] = useState<number>(0);

  const [toolsUsed, setToolsUsed] = useState<ToolId[]>([]);
  const [log, setLog] = useState<{ who: "npc" | "system" | "user"; text: string }[]>([]);
  const [toolModal, setToolModal] = useState<{ open: boolean; tools: ToolId[]; restore: number; reason: string } | null>(null);

  useEffect(() => {
    if (!scenario) return;
    setSelfLabel(defaultSelfLabelForScenario(selectedScenarioId));
    setBeatId(scenario.entryBeatId);
    setLog([]);
    setAttempts(0);
    setSafeChoices(0);
    setExitsUsed(0);
    setToolsUsed([]);
    setToolModal(null);
    if (phase === "select") setPhase("pre");
  }, [selectedScenarioId, scenario]);

  useEffect(() => {
    if (phase !== "run" || !beat) return;
    startedAtRef.current = Date.now();
    const startC = startComposureFromSelfReport(preIntensity);
    setComposure(startC);
    composureStartRef.current = startC;
    setLog([{ who: beat.speaker, text: beat.text }]);
  }, [phase]);

  useEffect(() => {
    if (phase !== "run" || !beat) return;

    setLog((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.text === beat.text && last.who === beat.speaker) return prev;
      return [...prev, { who: beat.speaker, text: beat.text }];
    });

    setComposure((c) => clamp(c - pressureDrain(beat.pressure), 0, 100));

    if (beat.toolOffer) {
      setToolModal({
        open: true,
        tools: beat.toolOffer.allowedTools,
        restore: beat.toolOffer.composureRestore,
        reason: beat.toolOffer.reason,
      });
    }
  }, [beatId]);

  function choose(choice: Choice) {
    if (phase !== "run" || !beat?.choices) return;

    setAttempts((a) => a + 1);
    setLog((prev) => [...prev, { who: "user", text: choice.label }]);

    if (isSafeChoice(choice)) setSafeChoices((s) => s + 1);
    if (isExitChoice(choice)) setExitsUsed((e) => e + 1);

    setComposure((c) => clamp(c + choice.composureDelta, 0, 100));
    setLog((prev) => [...prev, { who: "system", text: choice.consequenceText }]);

    setBeatId(choice.nextBeatId);
    const nextBeat = scenario?.beats[choice.nextBeatId];
    if (nextBeat?.isEnd || !nextBeat?.choices) {
      setTimeout(() => setPhase("post"), 400);
    }
  }

  function useTool(tool: ToolId, restore: number) {
    setToolsUsed((prev) => (prev.includes(tool) ? prev : [...prev, tool]));
    setComposure((c) => clamp(c + restore, 0, 100));
    onAwardXp(3);
    setLog((prev) => [...prev, { who: "system", text: `Tool used — ${toolLabel(tool)}.` }]);
    setToolModal(null);
  }

  if (!scenario) return <div className="p-8 text-center"><button onClick={onExit} className="bg-slate-800 text-white px-6 py-2 rounded-xl">Go Back</button></div>;

  if (phase === "select") {
    return (
      <div className="h-full w-full p-6 bg-slate-50 overflow-y-auto">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-6">The Rehearsal</h1>
        <div className="grid grid-cols-1 gap-4">
          {REHEARSAL_SCENARIOS.map((s) => (
            <button key={s.id} onClick={() => { setSelectedScenarioId(s.id); setPhase("pre"); }} className="text-left rounded-3xl border border-slate-200 bg-white shadow-sm p-5 hover:bg-slate-50">
              <div className="text-xs uppercase tracking-wide text-slate-500">{s.context}</div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">{s.title}</div>
            </button>
          ))}
        </div>
        <button onClick={onExit} className="mt-6 text-slate-500 font-bold">Exit</button>
      </div>
    );
  }

  if (phase === "pre") {
    return (
      <div className="h-full w-full p-6 bg-slate-50">
        <h2 className="text-2xl font-extrabold mb-4">{scenario.title}</h2>
        <div className="bg-white p-6 rounded-3xl shadow-sm">
            <p className="text-slate-600 mb-6">How strong is the {selfLabel.replace('_', ' ')} right now?</p>
            <input type="range" min="0" max="10" value={preIntensity} onChange={(e) => setPreIntensity(parseInt(e.target.value))} className="w-full mb-6" />
            <button onClick={() => setPhase("run")} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">Enter Scene</button>
        </div>
      </div>
    );
  }

  if (phase === "run") {
    return (
      <div className="h-full w-full p-6 bg-slate-50 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {log.map((m, i) => (
                <div key={i} className={`p-4 rounded-2xl ${m.who === 'user' ? 'bg-indigo-600 text-white ml-8' : 'bg-white border border-slate-200 mr-8 text-slate-800'}`}>
                    {m.text}
                </div>
            ))}
        </div>
        {beat && !beat.isEnd && (
            <div className="space-y-2">
                {beat.choices?.map(c => (
                    <button key={c.id} onClick={() => choose(c)} className="w-full text-left p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold hover:border-indigo-400 transition-all">{c.label}</button>
                ))}
                {beat.toolOffer && (
                    <button onClick={() => setToolModal({ open: true, tools: beat.toolOffer!.allowedTools, restore: beat.toolOffer!.composureRestore, reason: beat.toolOffer!.reason })} className="w-full p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold border-2 border-emerald-100">Use Tool</button>
                )}
            </div>
        )}
        {toolModal?.open && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[110]">
                <div className="bg-white p-6 rounded-[2rem] w-full max-w-sm shadow-2xl">
                    <h3 className="font-extrabold mb-2 text-slate-800">Regulation Required</h3>
                    <p className="text-sm text-slate-500 mb-4">{toolModal.reason}</p>
                    <div className="space-y-2">
                        {toolModal.tools.map(t => (
                            <button key={t} onClick={() => useTool(t, toolModal.restore)} className="w-full p-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors">{toolLabel(t)}</button>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <h2 className="text-2xl font-black mb-4">Scene Complete</h2>
        <p className="text-slate-500 mb-8">You successfully navigated the rehearsal.</p>
        <button onClick={onExit} className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold">Return to Arcade</button>
    </div>
  );
};