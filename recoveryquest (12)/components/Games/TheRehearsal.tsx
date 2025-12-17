
// components/Games/TheRehearsal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getScenarioById, REHEARSAL_SCENARIOS } from "./rehearsal/scenarios";
import { Beat, Choice, GameResult, SelfReportLabel, ToolId } from "./rehearsal/types";

type Props = {
  onExit: () => void;
  onAwardXp: (xp: number) => void;
  onComplete?: (result: GameResult) => void;

  // Optional: deep-link directly into a scenario
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
  // pressure is the “social heat” tax
  // (light at 1–2, heavier at 4–5)
  return pressure <= 2 ? 2 : pressure === 3 ? 4 : pressure === 4 ? 7 : 10;
}

function startComposureFromSelfReport(pre0to10: number) {
  // 0 => 95, 10 => 45 (more activated starts lower)
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
  const [phase, setPhase] = useState<"select" | "pre" | "run" | "post" | "summary">(
    scenarioId ? "pre" : "select"
  );

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarioId ?? REHEARSAL_SCENARIOS[0].id);
  const scenario = useMemo(() => getScenarioById(selectedScenarioId), [selectedScenarioId]);

  const [selfLabel, setSelfLabel] = useState<SelfReportLabel>(() => defaultSelfLabelForScenario(selectedScenarioId));
  const [preIntensity, setPreIntensity] = useState<number>(7);
  const [postIntensity, setPostIntensity] = useState<number>(4);

  const [beatId, setBeatId] = useState<string>(scenario.entryBeatId);
  const beat: Beat = scenario.beats[beatId];

  const startedAtRef = useRef<number>(Date.now());

  const [composure, setComposure] = useState<number>(() => startComposureFromSelfReport(preIntensity));
  const composureStartRef = useRef<number>(composure);

  const [attempts, setAttempts] = useState<number>(0);
  const [safeChoices, setSafeChoices] = useState<number>(0);
  const [exitsUsed, setExitsUsed] = useState<number>(0);

  const [toolsUsed, setToolsUsed] = useState<ToolId[]>([]);
  const [weakPoints, setWeakPoints] = useState<Record<string, number>>({});

  const [log, setLog] = useState<{ who: "npc" | "system" | "user"; text: string }[]>([]);
  const [toast, setToast] = useState<{ tone: "good" | "warn" | "info"; text: string } | null>(null);

  const [toolModal, setToolModal] = useState<{ open: boolean; tools: ToolId[]; restore: number; reason: string } | null>(null);

  // Reset when scenario changes
  useEffect(() => {
    setSelfLabel(defaultSelfLabelForScenario(selectedScenarioId));
    setBeatId(getScenarioById(selectedScenarioId).entryBeatId);
    setLog([]);
    setAttempts(0);
    setSafeChoices(0);
    setExitsUsed(0);
    setToolsUsed([]);
    setWeakPoints({});
    setToast(null);
    setToolModal(null);
    setPhase(scenarioId ? "pre" : "pre");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScenarioId]);

  // When entering run phase, initialize timing/log/composure
  useEffect(() => {
    if (phase !== "run") return;
    startedAtRef.current = Date.now();
    const startC = startComposureFromSelfReport(preIntensity);
    setComposure(startC);
    composureStartRef.current = startC;
    setLog([{ who: beat.speaker, text: beat.text }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Each beat arrival: apply pressure drain and append narrative line
  useEffect(() => {
    if (phase !== "run") return;
    if (!beat) return;

    // Append beat line if not already last
    setLog((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.text === beat.text && last.who === beat.speaker) return prev;
      return [...prev, { who: beat.speaker, text: beat.text }];
    });

    // Pressure drain (models narrowing window of tolerance)
    setComposure((c) => clamp(c - pressureDrain(beat.pressure), 0, 100));

    // Offer tool if present (or if composure low)
    const shouldOfferTool = !!beat.toolOffer || composure <= 45;
    if (shouldOfferTool && beat.toolOffer) {
      setToolModal({
        open: true,
        tools: beat.toolOffer.allowedTools,
        restore: beat.toolOffer.composureRestore,
        reason: beat.toolOffer.reason,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatId]);

  function bumpWeakPointsFromBeatTags(beatTags: string[]) {
    const focus = [
      "minimization",
      "permission",
      "guilt",
      "urgency",
      "scarcity",
      "global_label",
      "history",
      "identity_attack",
      "mockery",
      "shame",
      "rumination",
      "false_dilemma",
    ];
    setWeakPoints((prev) => {
      const next = { ...prev };
      for (const t of beatTags) {
        if (focus.includes(t)) next[t] = (next[t] ?? 0) + 1;
      }
      return next;
    });
  }

  function awardXpForChoice(choice: Choice) {
    // Small, consistent reinforcement.
    // Don’t moralize: reward skill execution.
    let xp = 0;

    if (choice.efficacy >= 4) xp += 8;
    else if (choice.efficacy === 3) xp += 4;

    if (choice.style === "exit") xp += 4; // leaving safely is a high-value skill
    if (choice.style === "firm") xp += 2;

    // Keep it bounded so it doesn’t distort the rest of your economy
    xp = clamp(xp, 0, 16);

    if (xp > 0) onAwardXp(xp);
  }

  function choose(choice: Choice) {
    if (phase !== "run") return;
    if (!beat?.choices) return;

    setAttempts((a) => a + 1);

    // log user line
    setLog((prev) => [...prev, { who: "user", text: choice.label }]);

    const safe = isSafeChoice(choice);
    if (safe) setSafeChoices((s) => s + 1);

    if (isExitChoice(choice)) setExitsUsed((e) => e + 1);

    // composure response to choice
    setComposure((c) => clamp(c + choice.composureDelta, 0, 100));

    // consequence line
    setLog((prev) => [...prev, { who: "system", text: choice.consequenceText }]);

    // weak points if unsafe
    if (!safe) bumpWeakPointsFromBeatTags(beat.tags);

    // XP reinforcement
    awardXpForChoice(choice);

    // feedback (short, non-preachy)
    if (safe) setToast({ tone: "good", text: "Skillful move." });
    else setToast({ tone: "warn", text: "Pressure rose. Regulate and choose again next time." });

    // next beat
    setBeatId(choice.nextBeatId);

    // if next beat is end, advance to post
    const nextBeat = scenario.beats[choice.nextBeatId];
    if (nextBeat?.isEnd || !nextBeat?.choices) {
      // Let the ending text render; then proceed
      setTimeout(() => setPhase("post"), 400);
    }
  }

  function useTool(tool: ToolId, restore: number) {
    // record tool
    setToolsUsed((prev) => (prev.includes(tool) ? prev : [...prev, tool]));
    // restore composure
    setComposure((c) => clamp(c + restore, 0, 100));

    // tiny reinforcement
    onAwardXp(3);

    // micro-feedback for tool
    const toolLine =
      tool === "box_breath" ? "Box Breath: 4 in, hold 4, out 4, hold 4." :
      tool === "defusion" ? "Defusion: “I’m having the thought that…”" :
      tool === "play_tape" ? "Play the Tape: 10 seconds into tomorrow." :
      tool === "grounding" ? "Grounding: 5-4-3-2-1 sensory scan." :
      "Urge Surf: ride the wave—don’t fight it.";

    setLog((prev) => [...prev, { who: "system", text: `Tool used — ${toolLabel(tool)}. ${toolLine}` }]);
    setToast({ tone: "info", text: `Regulated: ${toolLabel(tool)} (+${restore})` });

    // close modal
    setToolModal(null);
  }

  function computeResult(): GameResult {
    const durationMs = Date.now() - startedAtRef.current;

    const accuracy = attempts ? safeChoices / attempts : 0;

    // outcome: safe end vs unsafe end
    const ending = beat;
    const safeEnd = ending?.endType === "safe";

    const composureStart = composureStartRef.current;
    const composureEnd = composure;

    // score components: 60% safety choices, 25% safe outcome, 15% stability (composure change)
    const stability = clamp((composureEnd - composureStart + 50) / 100, 0, 1); // maps -50..+50
    const score = Math.round(
      (0.60 * accuracy + 0.25 * (safeEnd ? 1 : 0) + 0.15 * stability) * 100
    );

    const weak = Object.entries(weakPoints)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);

    const tags = [
      ...scenario.tags,
      ...scenario.clinicalTargets.map((t) => `target:${t}`),
      `context:${scenario.context}`,
      `difficulty:${scenario.difficulty}`,
    ];

    return {
      gameId: "the_rehearsal",
      scenarioId: scenario.id,
      completed: true,
      score,
      accuracy,
      attempts,
      durationMs,
      composureStart,
      composureEnd,
      toolsUsed,
      exitsUsed,
      tags,
      weakPoints: weak,
      selfReport: { pre: preIntensity, post: postIntensity, label: selfLabel },
    };
  }

  function finish() {
    const result = computeResult();
    // End-of-round XP bump so completion feels meaningful
    const endBonus = clamp(Math.round(result.score / 12), 0, 10);
    if (endBonus > 0) onAwardXp(endBonus);

    onComplete?.(result);
    setPhase("summary");
  }

  // ---------- RENDER: SELECT ----------
  if (phase === "select") {
    return (
      <div className="h-full w-full p-6 bg-slate-50">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">The Rehearsal</h1>
            <p className="text-sm text-slate-600 mt-1">
              Practice boundary decisions under social heat—without real-world cost.
            </p>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-2xl font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
          >
            Exit
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {REHEARSAL_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedScenarioId(s.id);
                setPhase("pre");
              }}
              className="col-span-12 lg:col-span-4 text-left rounded-3xl border border-slate-200 bg-white shadow-sm p-5 hover:bg-slate-50"
            >
              <div className="text-xs uppercase tracking-wide text-slate-500">{s.context}</div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">{s.title}</div>
              <div className="mt-2 text-sm text-slate-600">
                Targets: {s.clinicalTargets.slice(0, 3).join(", ")}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.tags.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---------- RENDER: PRE CHECK-IN ----------
  if (phase === "pre") {
    return (
      <div className="h-full w-full p-6 bg-slate-50">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">The Rehearsal</h1>
            <p className="text-sm text-slate-600 mt-1">
              {scenario.title} • Context: {scenario.context} • Difficulty {scenario.difficulty}
            </p>
          </div>
          <div className="flex gap-2">
            {!scenarioId && (
              <button
                onClick={() => setPhase("select")}
                className="px-4 py-2 rounded-2xl font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
              >
                Back
              </button>
            )}
            <button
              onClick={onExit}
              className="px-4 py-2 rounded-2xl font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
            >
              Exit
            </button>
          </div>
        </div>

        <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="text-sm font-extrabold text-slate-900">Pre-Scene Check-In</div>
          <div className="mt-3 text-sm text-slate-600">
            Keep it fast. This is baseline arousal, not a journal entry.
          </div>

          <div className="mt-5">
            <div className="text-xs font-bold text-slate-700 mb-2">What’s strongest right now?</div>
            <div className="flex flex-wrap gap-2">
              {(["urge","anxiety","anger","shame","social_pressure"] as SelfReportLabel[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setSelfLabel(l)}
                  className={`px-3 py-2 rounded-2xl text-sm font-bold border ${
                    selfLabel === l
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {l.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-sm text-slate-700">
              <span>Intensity (0–10)</span>
              <span className="font-extrabold">{preIntensity}</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={preIntensity}
              onChange={(e) => setPreIntensity(parseInt(e.target.value, 10))}
              className="w-full mt-2"
            />
            <div className="mt-2 text-xs text-slate-500">
              Starting composure will adapt to this number.
            </div>
          </div>

          <button
            onClick={() => {
              setBeatId(scenario.entryBeatId);
              setPhase("run");
            }}
            className="mt-6 w-full px-4 py-3 rounded-2xl font-extrabold bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Enter Scene
          </button>
        </div>
      </div>
    );
  }

  // ---------- RENDER: RUN ----------
  if (phase === "run") {
    const isEnding = !!beat?.isEnd || !beat?.choices;

    return (
      <div className="h-full w-full p-6 bg-slate-50">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">The Rehearsal</h1>
            <p className="text-sm text-slate-600 mt-1">
              {scenario.title} • Pressure {beat?.pressure ?? 1}/5 • Composure is your window of tolerance.
            </p>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-2xl font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
          >
            Exit
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-4 rounded-2xl px-4 py-3 border ${
              toast.tone === "good"
                ? "bg-emerald-50 border-emerald-200 text-slate-900"
                : toast.tone === "warn"
                  ? "bg-amber-50 border-amber-200 text-slate-900"
                  : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          >
            <div className="font-semibold">{toast.text}</div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          {/* Left: Scene */}
          <div className="col-span-12 lg:col-span-8">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
              {/* Composure bar */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Attempts <span className="font-extrabold text-slate-900">{attempts}</span> • Safe moves{" "}
                  <span className="font-extrabold text-slate-900">{safeChoices}</span>
                </div>
                <div className="text-sm text-slate-600">
                  Composure <span className="font-extrabold text-slate-900">{composure}</span>
                </div>
              </div>

              <div className="mt-2 w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${clamp(composure, 0, 100)}%` }}
                />
              </div>

              {/* Conversation log */}
              <div className="mt-5 space-y-3 max-h-[360px] overflow-auto pr-1">
                {log.map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl px-4 py-3 border ${
                      m.who === "user"
                        ? "bg-emerald-50 border-emerald-200 ml-10"
                        : m.who === "npc"
                          ? "bg-white border-slate-200 mr-10"
                          : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                      {m.who === "npc" ? "NPC" : m.who === "user" ? "You" : "System"}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 whitespace-pre-line">{m.text}</div>
                  </div>
                ))}
              </div>

              {/* Choices */}
              <div className="mt-5">
                {isEnding ? (
                  <button
                    onClick={() => setPhase("post")}
                    className="w-full px-4 py-3 rounded-2xl font-extrabold bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Continue
                  </button>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {beat.choices!.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => choose(c)}
                        className="text-left px-4 py-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-extrabold text-slate-900">{c.label}</div>
                          <span
                            className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                              isSafeChoice(c)
                                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                                : "bg-amber-50 text-amber-900 border-amber-200"
                            }`}
                          >
                            {c.style.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-600">
                          Composure {c.composureDelta >= 0 ? "+" : ""}{c.composureDelta} • Efficacy {c.efficacy}/5
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tool offer button (if modal closed but offer exists) */}
              {beat.toolOffer && (
                <div className="mt-4">
                  <button
                    onClick={() =>
                      setToolModal({
                        open: true,
                        tools: beat.toolOffer!.allowedTools,
                        restore: beat.toolOffer!.composureRestore,
                        reason: beat.toolOffer!.reason,
                      })
                    }
                    className="w-full px-4 py-3 rounded-2xl font-extrabold bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50"
                  >
                    Use a Tool (+{beat.toolOffer.composureRestore} composure)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Guidance */}
          <div className="col-span-12 lg:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
              <div className="text-sm font-extrabold text-slate-900">What This Trains</div>
              <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                Stay regulated long enough to choose wisely. Under pressure, the brain narrows.
                The game teaches you to widen the moment—then act.
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs font-extrabold text-slate-900">Rule of thumb</div>
                <div className="text-xs text-slate-600 mt-2 leading-relaxed">
                  You don’t need approval to protect your recovery. You need clarity and follow-through.
                </div>
              </div>

              <div className="mt-5 text-xs text-slate-500">
                Pre-check-in: <span className="font-bold text-slate-700">{selfLabel}</span> {preIntensity}/10
              </div>
            </div>
          </div>
        </div>

        {/* Tool Modal */}
        {toolModal?.open && (
          <div className="fixed inset-0 bg-slate-900/50 grid place-items-center p-4">
            <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-xl p-5">
              <div className="text-lg font-extrabold text-slate-900">Tool Interrupt</div>
              <div className="mt-2 text-sm text-slate-600">{toolModal.reason}</div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {toolModal.tools.map((t) => (
                  <button
                    key={t}
                    onClick={() => useTool(t, toolModal.restore)}
                    className="px-4 py-4 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-left"
                  >
                    <div className="text-sm font-extrabold text-slate-900">{toolLabel(t)}</div>
                    <div className="mt-1 text-xs text-slate-600">
                      +{toolModal.restore} composure
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick micro-guides (fast, not preachy) */}
              <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs font-extrabold text-slate-900">Micro-guide</div>
                <ul className="mt-2 text-xs text-slate-600 list-disc pl-5 space-y-1">
                  <li><b>Box Breath:</b> 4 in, hold 4, out 4, hold 4 (2 cycles).</li>
                  <li><b>Defusion:</b> “I’m having the thought that…” (name it, don’t argue it).</li>
                  <li><b>Play the Tape:</b> picture 10 seconds into tomorrow if you say yes.</li>
                  <li><b>Grounding:</b> 5 things see, 4 feel, 3 hear, 2 smell, 1 taste.</li>
                  <li><b>Urge Surf:</b> notice rise/peak/fall; don’t add a story.</li>
                </ul>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setToolModal(null)}
                  className="px-4 py-2 rounded-2xl font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------- RENDER: POST CHECK-IN ----------
  if (phase === "post") {
    const ending = beat;
    const endType = ending?.endType ?? "safe";

    return (
      <div className="h-full w-full p-6 bg-slate-50">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Post-Scene Reflection</h1>
            <p className="text-sm text-slate-600 mt-1">
              {scenario.title} • Outcome:{" "}
              <span className={`font-extrabold ${endType === "safe" ? "text-emerald-700" : "text-amber-700"}`}>
                {endType.toUpperCase()}
              </span>
            </p>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-2xl font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
          >
            Exit
          </button>
        </div>

        <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="text-sm font-extrabold text-slate-900">How strong is it now?</div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-700">
              <span>{selfLabel.replace("_", " ")} intensity (0–10)</span>
              <span className="font-extrabold">{postIntensity}</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={postIntensity}
              onChange={(e) => setPostIntensity(parseInt(e.target.value, 10))}
              className="w-full mt-2"
            />
          </div>

          {ending?.applyQuest && (
            <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs font-extrabold text-slate-900">Apply Quest</div>
              <div className="mt-1 text-sm font-extrabold text-slate-900">{ending.applyQuest.title}</div>
              <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
                {ending.applyQuest.options.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={finish}
            className="mt-6 w-full px-4 py-3 rounded-2xl font-extrabold bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Finish & Save Result
          </button>
        </div>
      </div>
    );
  }

  // ---------- RENDER: SUMMARY ----------
  if (phase === "summary") {
    const result = computeResult();
    const ending = beat;

    return (
      <div className="h-full w-full p-6 bg-slate-50">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Scenario Summary</h1>
            <p className="text-sm text-slate-600 mt-1">{scenario.title}</p>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-2xl font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
          >
            Back to Arcade
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7 rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="text-sm font-extrabold text-slate-900">Results</div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs text-slate-500">Score</div>
                <div className="text-2xl font-extrabold text-slate-900">{result.score}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs text-slate-500">Accuracy</div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {Math.round(result.accuracy * 100)}%
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs text-slate-500">Composure</div>
                <div className="text-lg font-extrabold text-slate-900">
                  {result.composureStart} → {result.composureEnd}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs text-slate-500">Tools used</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {result.toolsUsed.length ? result.toolsUsed.map(toolLabel).join(", ") : "None"}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs font-extrabold text-slate-900">What the app learns</div>
              <div className="text-sm text-slate-700 mt-2">
                <div>
                  Baseline: <b>{result.selfReport?.label}</b> {result.selfReport?.pre}/10 → {result.selfReport?.post}/10
                </div>
                {result.weakPoints.length > 0 && (
                  <div className="mt-2">
                    Weak points: <b>{result.weakPoints.join(", ")}</b>
                  </div>
                )}
                <div className="mt-2">
                  Ending:{" "}
                  <b className={ending?.endType === "safe" ? "text-emerald-700" : "text-amber-700"}>
                    {ending?.endType?.toUpperCase()}
                  </b>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setPhase("pre")}
                className="px-4 py-3 rounded-2xl font-extrabold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Run Again
              </button>
              {!scenarioId && (
                <button
                  onClick={() => setPhase("select")}
                  className="px-4 py-3 rounded-2xl font-extrabold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
                >
                  Choose Another Scenario
                </button>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="text-sm font-extrabold text-slate-900">Apply Quest</div>
            {beat?.applyQuest ? (
              <>
                <div className="mt-2 text-lg font-extrabold text-slate-900">{beat.applyQuest.title}</div>
                <ul className="mt-3 text-sm text-slate-700 list-disc pl-5 space-y-2">
                  {beat.applyQuest.options.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="mt-2 text-sm text-slate-600">No quest found for this ending.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
