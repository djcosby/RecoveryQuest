// recoveryquest (16)/Practice/games/FilterFeed.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { buildDeck, ThoughtCard, Specialization } from "./filterFeed/filterFeedDeck";

type GameProps = {
  onExit: () => void;
  onAwardXp: (xp: number) => void;

  // Optional but recommended: let PracticeArena store telemetry uniformly
  onComplete?: (result: GameResult) => void;

  // Optional inputs to align deck to curriculum
  unitTag?: string; // "cravings" | "boundaries" | ...
  difficulty?: 1 | 2 | 3 | 4 | 5;
  specialization?: "stoic" | "mystic" | "scientist" | "all";
  durationSec?: number; // default 75
};

export type GameResult = {
  gameId: "filter_feed";
  completed: boolean;

  score: number;         // 0–100 normalized
  accuracy: number;      // 0–1
  reactionTimeMs: number;// mean RT
  streakMax: number;
  attempts: number;
  durationMs: number;

  tags: string[];        // ["defusion","cbt","unit:cravings","distortion:mind_reading",...]
  insights: {
    topMaladaptiveTags: { tag: string; count: number }[];
    distortionMistakes: { distortion: string; count: number }[];
  };

  composureStart: number;
  composureEnd: number;
};

type Swipe = "FILTER" | "FEED";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function now() {
  return Date.now();
}

// Correct action rule (MVP):
// - maladaptive => FILTER
// - adaptive => FEED
// - neutral => FEED (later can become HOLD)
function correctSwipeFor(card: ThoughtCard): Swipe {
  if (card.category === "maladaptive") return "FILTER";
  return "FEED";
}

export const FilterFeed: React.FC<GameProps> = ({
  onExit,
  onAwardXp,
  onComplete,
  unitTag,
  difficulty = 2,
  specialization = "all",
  durationSec = 75,
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [deck, setDeck] = useState<ThoughtCard[]>(() =>
    /* Fix: Cast difficulty and specialization to ensure they match the literal types expected by buildDeck */
    buildDeck({ unitTag, difficulty: difficulty as 1 | 2 | 3 | 4 | 5, specialization: specialization as Specialization, size: 45 })
  );
  const [index, setIndex] = useState(0);

  const card = deck[index] ?? null;

  const startedAtRef = useRef(now());
  const cardShownAtRef = useRef(now());

  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);

  const [streak, setStreak] = useState(0);
  const [streakMax, setStreakMax] = useState(0);

  const [composure, setComposure] = useState(100);
  const composureStartRef = useRef(100);

  // reaction time
  /* Fix: Explicitly type numeric refs to avoid 'any' or 'unknown' errors in arithmetic */
  const rtSumRef = useRef<number>(0);
  const rtCountRef = useRef<number>(0);

  // insights
  /* Fix: Explicitly type record refs to ensure values are treated as numbers */
  const maladaptiveTagCounts = useRef<Record<string, number>>({});
  const distortionMistakes = useRef<Record<string, number>>({});

  // micro-feedback
  const [toast, setToast] = useState<{ tone: "good" | "warn"; text: string } | null>(null);

  // pointer-based swipe
  const drag = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
  });

  const progressTags = useMemo(() => {
    const tags = ["defusion", "cbt"];
    if (unitTag) tags.push(`unit:${unitTag}`);
    tags.push(`difficulty:${difficulty}`);
    return tags;
  }, [unitTag, difficulty]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // Finish round
  useEffect(() => {
    if (timeLeft > 0) return;

    const durationMs = now() - startedAtRef.current;
    const acc = attempts ? correct / attempts : 0;

    /* Fix: Ensure meanRt calculation uses correctly typed values from refs */
    const meanRt = rtCountRef.current ? Math.round(rtSumRef.current / rtCountRef.current) : 0;

    // Normalized score (simple + fair):
    // 70% accuracy + 20% reaction time + 10% streak.
    const rtScore =
      meanRt === 0
        ? 0
        : clamp(
            1 - (meanRt - 650) / 850, // 650ms good, 1500ms poor
            0,
            1
          );

    const streakScore = clamp(streakMax / 18, 0, 1);

    const score = Math.round((0.70 * acc + 0.20 * rtScore + 0.10 * streakScore) * 100);

    /* Fix: Use type assertion on entries to ensure values are treated as numbers */
    const topTags = Object.entries(maladaptiveTagCounts.current)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, count: count as number }));

    const topDistMistakes = Object.entries(distortionMistakes.current)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 6)
      .map(([distortion, count]) => ({ distortion, count: count as number }));

    const result: GameResult = {
      gameId: "filter_feed",
      completed: true,
      score,
      accuracy: acc,
      reactionTimeMs: meanRt,
      streakMax,
      attempts,
      durationMs,
      tags: [
        ...progressTags,
        ...topDistMistakes.map((d) => `distortion:${d.distortion}`),
      ],
      insights: {
        topMaladaptiveTags: topTags,
        distortionMistakes: topDistMistakes,
      },
      composureStart: composureStartRef.current,
      composureEnd: composure,
    };

    // Award XP (lightly) at end as well, so good rounds feel meaningful.
    // This doesn’t replace per-swipe XP; it reinforces consistency.
    const endBonus = Math.round(score / 10); // 0–10 xp
    if (endBonus > 0) onAwardXp(endBonus);

    onComplete?.(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function nextCard() {
    const next = index + 1;
    setIndex(next);
    cardShownAtRef.current = now();

    // If we run out, rebuild quickly and keep going (within same round)
    if (next >= deck.length - 3) {
      /* Fix: Cast difficulty and specialization to ensure they match the literal types expected by buildDeck */
      setDeck(buildDeck({ unitTag, difficulty: difficulty as 1 | 2 | 3 | 4 | 5, specialization: specialization as Specialization, size: 45 }));
      setIndex(0);
      cardShownAtRef.current = now();
    }
  }

  function registerMistake(card: ThoughtCard) {
    if (card.category === "maladaptive") {
      // count top sabotage themes for personalization
      for (const t of card.tags) {
        maladaptiveTagCounts.current[t] = (maladaptiveTagCounts.current[t] ?? 0) + 1;
      }
    }
    if (card.distortion) {
      distortionMistakes.current[card.distortion] = (distortionMistakes.current[card.distortion] ?? 0) + 1;
    }
  }

  function awardPerSwipeXp(isCorrect: boolean, card: ThoughtCard, currentStreak: number) {
    // XP is “ticks,” not jackpots.
    let xp = isCorrect ? 3 : 0;

    // Slight reward for “poison honey” difficulty
    if (isCorrect) xp += Math.max(0, card.difficulty - 2);

    // Streak bonus every 10 correct
    if (isCorrect && currentStreak > 0 && currentStreak % 10 === 0) xp += 6;

    if (xp > 0) onAwardXp(xp);
  }

  function feedbackCorrect(card: ThoughtCard) {
    setToast({ tone: "good", text: "Clean sort." });
    // brief, optional replacement cue (non-preachy)
    if (card.replacement && card.category === "maladaptive") {
      setTimeout(() => setToast({ tone: "good", text: card.replacement! }), 420);
    }
  }

  function feedbackWrong(card: ThoughtCard) {
    // 1 sentence max, clinically aligned
    const msg =
      card.distortion === "mind_reading"
        ? "That was mind reading—you don’t know what they think."
        : card.distortion === "catastrophizing"
          ? "That was catastrophizing—discomfort isn’t disaster."
          : card.distortion === "all_or_nothing"
            ? "That was all-or-nothing—progress still counts."
            : card.distortion === "labeling"
              ? "That was labeling—behavior isn’t identity."
              : card.distortion === "should"
                ? "That ‘should’ is fear dressed as a rule."
                : "Notice the thought. Don’t negotiate with it.";

    setToast({ tone: "warn", text: msg });
  }

  function applyComposureOnMistake() {
    // Gentle: only drains meaningfully when mistakes stack quickly.
    setComposure((c) => clamp(c - 4, 0, 100));
  }

  function applyComposureOnCorrect() {
    setComposure((c) => clamp(c + 1, 0, 100));
  }

  function decide(action: Swipe) {
    if (!card || timeLeft <= 0) return;

    const rt = now() - cardShownAtRef.current;
    rtSumRef.current += rt;
    rtCountRef.current += 1;

    setAttempts((a) => a + 1);

    const correctAction = correctSwipeFor(card);
    const isCorrect = action === correctAction;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setStreakMax((m) => Math.max(m, next));
        awardPerSwipeXp(true, card, next);
        return next;
      });
      applyComposureOnCorrect();
      feedbackCorrect(card);
    } else {
      registerMistake(card);
      setStreak(0);
      awardPerSwipeXp(false, card, 0);
      applyComposureOnMistake();
      feedbackWrong(card);
    }

    nextCard();
  }

  // Pointer swipe handlers (simple + robust)
  function onPointerDown(e: React.PointerEvent) {
    if (timeLeft <= 0) return;
    drag.current.isDown = true;
    drag.current.startX = e.clientX;
    drag.current.startY = e.clientY;
    drag.current.dx = 0;
    drag.current.dy = 0;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.isDown) return;
    drag.current.dx = e.clientX - drag.current.startX;
    drag.current.dy = e.clientY - drag.current.startY;
  }

  function onPointerUp() {
    if (!drag.current.isDown) return;
    drag.current.isDown = false;

    const { dx } = drag.current;
    const threshold = 90; // swipe distance threshold

    if (dx <= -threshold) decide("FILTER");
    else if (dx >= threshold) decide("FEED");
    // else: no action (keep it calm)
  }

  const banner = useMemo(() => {
    if (!card) return "";
    return card.category === "maladaptive" ? "Filter the sabotage. Don’t debate it." : "Feed what aligns with reality + recovery.";
  }, [card]);

  return (
    <div className="h-full w-full p-6 bg-slate-50">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Filter / Feed</h1>
          <p className="text-sm text-slate-600 mt-1">
            Cognitive defusion practice • {unitTag ? `Unit: ${unitTag}` : "Standard deck"} • Difficulty {difficulty}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2">
            <div className="text-[11px] text-slate-600">Time</div>
            <div className="text-lg font-extrabold text-slate-900">{timeLeft}s</div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2">
            <div className="text-[11px] text-slate-600">Composure</div>
            <div className="text-lg font-extrabold text-slate-900">{composure}</div>
          </div>

          <button
            onClick={onExit}
            className="px-4 py-2 rounded-2xl font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`mb-4 rounded-2xl px-4 py-3 border ${
            toast.tone === "good"
              ? "bg-emerald-50 border-emerald-200 text-slate-900"
              : "bg-amber-50 border-amber-200 text-slate-900"
          }`}
        >
          <div className="font-semibold">{toast.text}</div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Main Card Area */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Attempts <span className="font-bold text-slate-900">{attempts}</span> • Correct{" "}
                <span className="font-bold text-slate-900">{correct}</span> • Streak{" "}
                <span className="font-bold text-slate-900">{streak}</span>
              </div>
              <div className="text-xs text-slate-500">{banner}</div>
            </div>

            <div className="mt-4">
              {/* Swipe surface */}
              <div
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="select-none touch-none rounded-3xl border border-slate-200 bg-slate-50 p-6 min-h-[260px] flex items-center justify-center"
              >
                <div className="max-w-xl w-full">
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-3">
                    Swipe Left = Filter • Swipe Right = Feed
                  </div>

                  <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
                    <div className="text-xl font-extrabold text-slate-900 leading-snug">
                      {card ? card.text : "—"}
                    </div>

                    {card && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {card.tags.slice(0, 5).map((t) => (
                          <span
                            key={t}
                            className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                        {card.distortion && (
                          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                            {card.distortion}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => decide("FILTER")}
                      disabled={timeLeft <= 0 || !card}
                      className="flex-1 px-4 py-3 rounded-2xl font-extrabold bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Filter (Trash)
                    </button>
                    <button
                      onClick={() => decide("FEED")}
                      disabled={timeLeft <= 0 || !card}
                      className="flex-1 px-4 py-3 rounded-2xl font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Feed (Keep)
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-slate-600">
                    Clinically: you’re practicing “I’m having the thought that…” without getting pulled into it.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel: quick stats + “what the app learns” */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="text-sm font-extrabold text-slate-900">Round Signals</div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Accuracy</span>
                <span className="font-extrabold">
                  {attempts ? Math.round((correct / attempts) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max streak</span>
                <span className="font-extrabold">{streakMax}</span>
              </div>
              <div className="flex justify-between">
                <span>Deck focus</span>
                <span className="font-extrabold">{unitTag ?? "standard"}</span>
              </div>
              <div className="flex justify-between">
                <span>Difficulty</span>
                <span className="font-extrabold">{difficulty}</span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs font-extrabold text-slate-900">Micro-instruction</div>
              <div className="text-xs text-slate-600 mt-2 leading-relaxed">
                You don’t have to *win an argument* with a thought. You only have to stop granting it authority.
                Sort fast. Stay kind. Move on.
              </div>
            </div>

            {timeLeft <= 0 && (
              <div className="mt-5">
                <div className="text-sm font-extrabold text-slate-900">Round complete</div>
                <div className="text-xs text-slate-600 mt-2">
                  Exit back to the Arcade to see how you want to use this insight (lesson, tool, or another round).
                </div>
                <button
                  onClick={onExit}
                  className="mt-3 w-full px-4 py-3 rounded-2xl font-extrabold bg-white border border-slate-200 hover:bg-slate-50"
                >
                  Back to Arcade
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
