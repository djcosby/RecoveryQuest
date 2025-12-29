// src/practice/lexicon/LexiconOfLight.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getBankIndex, normalizeWord, WORD_BANK, WordEntry } from "./wordBank";
import {
  computeSubmitOutcome,
  defaultDurationSec,
  LexiconDifficulty,
  LexiconMode,
  LexiconRoundConfig,
} from "./lexiconScoring";

export type LexiconGameResult = {
  gameId: "lexicon_of_light";
  mode: LexiconMode;
  difficulty: LexiconDifficulty;
  unitTag?: string;
  durationSec: number;
  completedAtIso: string;

  attempts: number;
  correct: number;
  accuracy: number;

  words: { word: string; xp: number; tags: string[]; power: boolean; theme: boolean }[];
  uniqueWords: number;
  avgWordLength: number;

  timeToFirstWordMs: number | null;
  performanceByQuartile: { q1: number; q2: number; q3: number; q4: number }; // accuracy per time quartile

  // “composure” is gentle stakes—no shame penalty
  composureStart: number;
  composureEnd: number;
};

type Props = {
  config?: Partial<LexiconRoundConfig>;

  // Your app can connect economy + telemetry here:
  onComplete?: (result: LexiconGameResult) => void;
  onAwardXp?: (xp: number) => void;

  // power word gating (pass what the user has unlocked)
  unlockedIds?: string[]; // array of unlock ids: ["unit_resilience_01", "boss_boundary_breaker"]

  // optional: restrict bank further (e.g., per tenant / clinic)
  bankOverride?: WordEntry[];

  // optional: called on exit
  onExit?: () => void;
};

type RackTile = { id: string; ch: string; used: boolean };

function randInt(n: number) {
  return Math.floor(Math.random() * n);
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWeightedVowel(difficulty: LexiconDifficulty) {
  // fewer vowels as difficulty rises
  const vowelPool =
    difficulty <= 2
      ? ["A", "E", "I", "O", "U", "A", "E", "I", "O", "A", "E"]
      : difficulty === 3
        ? ["A", "E", "I", "O", "U", "A", "E", "I", "O"]
        : ["A", "E", "I", "O", "U", "A", "E", "I"];
  return vowelPool[randInt(vowelPool.length)];
}

function pickWeightedConsonant() {
  // slightly biased toward common letters for playability
  const pool = [
    "N","R","T","L","S",
    "D","G","C","M","P",
    "B","H","Y","F","W",
    "K","V","X","J","Q","Z"
  ];
  return pool[randInt(pool.length)];
}

function generateRack(difficulty: LexiconDifficulty, size = 7): RackTile[] {
  const vowelCount =
    difficulty === 1 ? 3 :
    difficulty === 2 ? 3 :
    difficulty === 3 ? 2 :
    difficulty === 4 ? 2 : 1;

  const consonantCount = Math.max(0, size - vowelCount);

  const letters: string[] = [];
  for (let i = 0; i < vowelCount; i++) letters.push(pickWeightedVowel(difficulty));
  for (let i = 0; i < consonantCount; i++) letters.push(pickWeightedConsonant());

  const mixed = shuffle(letters);

  return mixed.map((ch, idx) => ({
    id: `${Date.now()}_${idx}_${Math.random().toString(16).slice(2)}`,
    ch,
    used: false,
  }));
}

function quartileIndex(progress01: number) {
  if (progress01 < 0.25) return "q1";
  if (progress01 < 0.5) return "q2";
  if (progress01 < 0.75) return "q3";
  return "q4";
}

export default function LexiconOfLight(props: Props) {
  const bank = props.bankOverride ?? WORD_BANK;
  const index = useMemo(() => getBankIndex(bank), [bank]);

  const cfg: LexiconRoundConfig = {
    mode: props.config?.mode ?? "free",
    difficulty: (props.config?.difficulty ?? 2) as LexiconDifficulty,
    unitTag: props.config?.unitTag,
    specialization: props.config?.specialization ?? "all",
    durationSec: props.config?.durationSec,
  };

  const durationSec = cfg.durationSec ?? defaultDurationSec(cfg.difficulty);

  const unlockedWordIds = useMemo(() => new Set(props.unlockedIds ?? []), [props.unlockedIds]);

  const [rack, setRack] = useState<RackTile[]>(() => generateRack(cfg.difficulty));
  const [currentWordTileIds, setCurrentWordTileIds] = useState<string[]>([]);
  const currentWord = useMemo(() => {
    /* Fix: Explicitly type the Map to prevent 'unknown' type errors for values */
    const map = new Map<string, RackTile>(rack.map(t => [t.id, t]));
    return currentWordTileIds.map(id => map.get(id)?.ch ?? "").join("");
  }, [currentWordTileIds, rack]);

  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [startedAt] = useState(() => Date.now());
  const [firstCorrectAt, setFirstCorrectAt] = useState<number | null>(null);

  // gentle stakes: composure drains only on rapid repeated errors
  const [composure, setComposure] = useState(100);
  const composureStartRef = useRef(100);

  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);

  const [found, setFound] = useState<
    { word: string; xp: number; tags: string[]; power: boolean; theme: boolean }[]
  >([]);

  const foundSet = useMemo(() => new Set(found.map(f => f.word)), [found]);

  const [message, setMessage] = useState<{ tone: "ok" | "warn" | "good"; text: string } | null>(null);

  const quartiles = useRef({
    q1: { a: 0, c: 0 },
    q2: { a: 0, c: 0 },
    q3: { a: 0, c: 0 },
    q4: { a: 0, c: 0 },
  });

  // timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // end round
  useEffect(() => {
    if (timeLeft > 0) return;

    const duration = durationSec;
    const uniqueWords = new Set(found.map(f => f.word)).size;
    const avgWordLength =
      found.length === 0 ? 0 : found.reduce((a, b) => a + b.word.length, 0) / found.length;

    const qb = quartiles.current;
    const accuracyByQ = {
      q1: qb.q1.a ? qb.q1.c / qb.q1.a : 0,
      q2: qb.q2.a ? qb.q2.c / qb.q2.a : 0,
      q3: qb.q3.a ? qb.q3.c / qb.q3.a : 0,
      q4: qb.q4.a ? qb.q4.c / qb.q4.a : 0,
    };

    const result = {
      gameId: "lexicon_of_light" as const,
      mode: cfg.mode,
      difficulty: cfg.difficulty,
      unitTag: cfg.unitTag,
      durationSec: duration,
      completedAtIso: new Date().toISOString(),

      attempts,
      correct,
      accuracy: attempts ? correct / attempts : 0,

      words: found,
      uniqueWords,
      avgWordLength,

      timeToFirstWordMs: firstCorrectAt ? firstCorrectAt - startedAt : null,
      performanceByQuartile: accuracyByQ,

      composureStart: composureStartRef.current,
      composureEnd: composure,
    } satisfies LexiconGameResult;

    props.onComplete?.(result);
    // completing restores composure gently (you can map this to hearts if you want)
    // we do NOT mutate global state here; caller decides.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function clearCurrentWord() {
    setRack(prev => prev.map(t => (currentWordTileIds.includes(t.id) ? { ...t, used: false } : t)));
    setCurrentWordTileIds([]);
  }

  function backspace() {
    const last = currentWordTileIds[currentWordTileIds.length - 1];
    if (!last) return;
    setRack(prev => prev.map(t => (t.id === last ? { ...t, used: false } : t)));
    setCurrentWordTileIds(prev => prev.slice(0, -1));
  }

  function pickTile(tileId: string) {
    const tile = rack.find(t => t.id === tileId);
    if (!tile || tile.used) return;
    setRack(prev => prev.map(t => (t.id === tileId ? { ...t, used: true } : t)));
    setCurrentWordTileIds(prev => [...prev, tileId]);
  }

  function shuffleRack() {
    // preserve used flags but shuffle visual order
    setRack(prev => shuffle(prev));
    setMessage({ tone: "ok", text: "Rack shuffled." });
  }

  function newRack() {
    setRack(generateRack(cfg.difficulty));
    setCurrentWordTileIds([]);
    setMessage({ tone: "ok", text: "New rack." });
  }

  function submit() {
    const word = normalizeWord(currentWord);
    if (!word) return;

    const progress01 = Math.min(1, Math.max(0, (durationSec - timeLeft) / durationSec));
    const q = quartileIndex(progress01) as "q1" | "q2" | "q3" | "q4";
    quartiles.current[q].a += 1;

    setAttempts(a => a + 1);

    if (foundSet.has(word)) {
      // no shame, just guide
      setMessage({ tone: "warn", text: "You already forged that word. Try another." });
      clearCurrentWord();
      return;
    }

    const entry = index.get(word);

    const outcome = computeSubmitOutcome({
      word,
      entry,
      unlockedWordIds,
      config: cfg,
    });

    if (outcome.ok === false) {
      // gentle composure drain only if repeated fast mistakes
      setComposure(c => Math.max(0, c - 3));

      if (outcome.reason === "not_found") setMessage({ tone: "warn", text: "Not in your recovery lexicon—try again." });
      else if (outcome.reason === "locked") setMessage({ tone: "warn", text: "That’s a Power Word—unlock it through lessons or bosses." });
      else if (outcome.reason === "too_hard") setMessage({ tone: "warn", text: "That word is advanced for this round—level up and return." });
      else setMessage({ tone: "warn", text: "That word doesn’t match your current path—try another." });

      clearCurrentWord();
      return;
    }

    quartiles.current[q].c += 1;

    setCorrect(c => c + 1);
    if (!firstCorrectAt) setFirstCorrectAt(Date.now());

    // composure reward (gentle)
    setComposure(c => Math.min(100, c + 2));

    props.onAwardXp?.(outcome.xp);

    setFound(prev => [
      ...prev,
      {
        word,
        xp: outcome.xp,
        tags: outcome.entry.tags,
        power: !!outcome.isPower,
        theme: outcome.isTheme,
      },
    ]);

    // micro-definition for power words (optional but clinically nice)
    if (outcome.isPower && outcome.entry.definition) {
      setMessage({ tone: "good", text: `${word}: ${outcome.entry.definition}` });
    } else {
      const tagText =
        cfg.mode === "themeLock" && cfg.unitTag
          ? (outcome.isTheme ? "Theme word bonus." : "Off-theme word (reduced score).")
          : outcome.isPower
            ? "Power Word bonus."
            : "Clean ignition.";
      setMessage({ tone: "good", text: `${tagText} +${outcome.xp} XP` });
    }

    clearCurrentWord();
    // light pacing: sometimes refresh rack after a good submission
    // (keeps novelty without chaos)
    if ((correct + 1) % 3 === 0) {
      setTimeout(() => setRack(generateRack(cfg.difficulty)), 250);
    }
  }

  const headerSubtitle = useMemo(() => {
    const parts = [
      cfg.mode === "free" ? "Free Forge" : cfg.mode === "themeLock" ? "Theme Lock" : "Power Hunt",
      `Difficulty ${cfg.difficulty}`,
    ];
    if (cfg.unitTag) parts.push(`Unit: ${cfg.unitTag}`);
    return parts.join(" • ");
  }, [cfg]);

  const canSubmit = currentWord.length > 0 && timeLeft > 0;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>The Lexicon of Light</div>
          <div style={styles.subtitle}>{headerSubtitle}</div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.timerBox}>
            <div style={styles.timerLabel}>Time</div>
            <div style={styles.timerValue}>{timeLeft}s</div>
          </div>

          <div style={styles.timerBox}>
            <div style={styles.timerLabel}>Composure</div>
            <div style={styles.timerValue}>{composure}</div>
          </div>

          <button style={styles.exitBtn} onClick={() => props.onExit?.()}>
            Exit
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            ...styles.message,
            ...(message.tone === "good"
              ? styles.messageGood
              : message.tone === "warn"
                ? styles.messageWarn
                : styles.messageOk),
          }}
        >
          {message.text}
        </div>
      )}

      <div style={styles.panelGrid}>
        {/* LEFT: Gameplay */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Forge</div>
            <div style={styles.cardMeta}>
              Attempts: <b>{attempts}</b> • Correct: <b>{correct}</b>
            </div>
          </div>

          <div style={styles.wordSlot}>
            <div style={styles.wordLabel}>Current Word</div>
            <div style={styles.wordValue}>{currentWord || "—"}</div>
            <div style={styles.wordActions}>
              <button style={styles.smallBtn} onClick={backspace} disabled={!currentWordTileIds.length || timeLeft <= 0}>
                Back
              </button>
              <button style={styles.smallBtn} onClick={clearCurrentWord} disabled={!currentWordTileIds.length || timeLeft <= 0}>
                Clear
              </button>
              <button style={{ ...styles.smallBtn, ...styles.smallBtnGhost }} onClick={shuffleRack} disabled={timeLeft <= 0}>
                Shuffle
              </button>
              <button style={{ ...styles.smallBtn, ...styles.smallBtnGhost }} onClick={newRack} disabled={timeLeft <= 0}>
                New Rack
              </button>
            </div>
          </div>

          <div style={styles.rack}>
            {rack.map(tile => (
              <button
                key={tile.id}
                onClick={() => pickTile(tile.id)}
                disabled={tile.used || timeLeft <= 0}
                style={{
                  ...styles.tile,
                  ...(tile.used ? styles.tileUsed : {}),
                }}
                aria-label={`Letter ${tile.ch}`}
              >
                {tile.ch}
              </button>
            ))}
          </div>

          <div style={styles.submitRow}>
            <button style={{ ...styles.submitBtn, ...(canSubmit ? {} : styles.submitBtnDisabled) }} onClick={submit} disabled={!canSubmit}>
              Submit
            </button>

            <div style={styles.hint}>
              Tip: build words your future self would trust.
            </div>
          </div>

          <div style={styles.modeNote}>
            {cfg.mode === "themeLock" && cfg.unitTag && (
              <span>
                Theme Lock: words tagged <b>{cfg.unitTag}</b> score higher.
              </span>
            )}
            {cfg.mode === "powerHunt" && (
              <span>
                Power Hunt: gated words pay out more. Unlock via lessons/bosses.
              </span>
            )}
            {cfg.mode === "free" && <span>Free Forge: score by length + difficulty.</span>}
          </div>
        </div>

        {/* RIGHT: Results */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Ignitions</div>
            <div style={styles.cardMeta}>
              Unique: <b>{new Set(found.map(f => f.word)).size}</b> • Avg Len:{" "}
              <b>{found.length ? (found.reduce((a, b) => a + b.word.length, 0) / found.length).toFixed(1) : "—"}</b>
            </div>
          </div>

          <div style={styles.list}>
            {found.length === 0 ? (
              <div style={styles.empty}>No words yet. Start forging.</div>
            ) : (
              found
                .slice()
                .reverse()
                .map((f, i) => (
                  <div key={`${f.word}_${i}`} style={styles.listRow}>
                    <div style={styles.listWord}>
                      {f.word}
                      {f.power && <span style={styles.badgePower}>POWER</span>}
                      {f.theme && <span style={styles.badgeTheme}>THEME</span>}
                    </div>
                    <div style={styles.listXp}>+{f.xp} XP</div>
                  </div>
                ))
            )}
          </div>

          <div style={styles.footerStats}>
            <div>
              Accuracy:{" "}
              <b>{attempts ? Math.round((correct / attempts) * 100) : 0}%</b>
            </div>
            <div>
              Time-to-first:{" "}
              <b>{firstCorrectAt ? `${Math.round((firstCorrectAt - startedAt) / 1000)}s` : "—"}</b>
            </div>
          </div>

          <div style={styles.softDivider} />

          <div style={styles.reflect}>
            <div style={styles.reflectTitle}>Optional reflection</div>
            <div style={styles.reflectText}>
              Which word felt most true today—and what would “living it” look like for the next 2 hours?
            </div>
          </div>
        </div>
      </div>

      {timeLeft <= 0 && (
        <div style={styles.endOverlay}>
          <div style={styles.endCard}>
            <div style={styles.endTitle}>Round Complete</div>
            <div style={styles.endMeta}>
              Words: <b>{found.length}</b> • Accuracy:{" "}
              <b>{attempts ? Math.round((correct / attempts) * 100) : 0}%</b> • Composure: <b>{composure}</b>
            </div>

            <div style={styles.endActions}>
              <button
                style={styles.submitBtn}
                onClick={() => {
                  // restart quickly
                  quartiles.current = {
                    q1: { a: 0, c: 0 },
                    q2: { a: 0, c: 0 },
                    q3: { a: 0, c: 0 },
                    q4: { a: 0, c: 0 },
                  };
                  composureStartRef.current = 100;
                  setComposure(100);
                  setAttempts(0);
                  setCorrect(0);
                  setFound([]);
                  setCurrentWordTileIds([]);
                  setRack(generateRack(cfg.difficulty));
                  setMessage(null);
                  setTimeLeft(durationSec);
                  setFirstCorrectAt(null);
                }}
              >
                Play Again
              </button>
              <button style={styles.exitBtn} onClick={() => props.onExit?.()}>
                Back to Arcade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    padding: 18,
    maxWidth: 1100,
    margin: "0 auto",
    color: "#0b1220",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: 800, letterSpacing: 0.2 },
  subtitle: { fontSize: 13, opacity: 0.8, marginTop: 4 },
  headerRight: { display: "flex", gap: 10, alignItems: "center" },
  timerBox: {
    border: "1px solid rgba(15, 118, 110, 0.25)",
    borderRadius: 12,
    padding: "8px 10px",
    minWidth: 92,
    background: "rgba(15, 118, 110, 0.06)",
  },
  timerLabel: { fontSize: 11, opacity: 0.75 },
  timerValue: { fontSize: 16, fontWeight: 800, marginTop: 2 },

  exitBtn: {
    border: "1px solid rgba(2,6,23,0.12)",
    background: "#fff",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  message: {
    borderRadius: 14,
    padding: "10px 12px",
    marginBottom: 14,
    border: "1px solid rgba(2,6,23,0.10)",
  },
  messageGood: { background: "rgba(16, 185, 129, 0.10)" },
  messageWarn: { background: "rgba(245, 158, 11, 0.12)" },
  messageOk: { background: "rgba(15, 118, 110, 0.08)" },

  panelGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr",
    gap: 14,
  },

  card: {
    border: "1px solid rgba(2,6,23,0.10)",
    borderRadius: 18,
    background: "#fff",
    padding: 14,
    boxShadow: "0 8px 18px rgba(2, 6, 23, 0.06)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: 800, letterSpacing: 0.2 },
  cardMeta: { fontSize: 12, opacity: 0.75 },

  wordSlot: {
    borderRadius: 16,
    background: "rgba(15, 118, 110, 0.06)",
    border: "1px solid rgba(15, 118, 110, 0.18)",
    padding: 12,
    marginBottom: 12,
  },
  wordLabel: { fontSize: 11, opacity: 0.75 },
  wordValue: { fontSize: 22, fontWeight: 900, marginTop: 6, letterSpacing: 2 },
  wordActions: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" },

  smallBtn: {
    border: "1px solid rgba(2,6,23,0.12)",
    background: "#fff",
    borderRadius: 12,
    padding: "8px 10px",
    fontWeight: 700,
    cursor: "pointer",
  },
  smallBtnGhost: {
    background: "rgba(15, 118, 110, 0.08)",
    borderColor: "rgba(15, 118, 110, 0.20)",
  },

  rack: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 10,
    marginBottom: 12,
  },
  tile: {
    borderRadius: 14,
    border: "1px solid rgba(2,6,23,0.12)",
    background: "#fff",
    height: 54,
    fontSize: 20,
    fontWeight: 900,
    cursor: "pointer",
  },
  tileUsed: {
    opacity: 0.35,
    cursor: "not-allowed",
    background: "rgba(2,6,23,0.04)",
  },

  submitRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  submitBtn: {
    borderRadius: 14,
    padding: "12px 16px",
    fontWeight: 900,
    border: "1px solid rgba(15, 118, 110, 0.30)",
    background: "rgba(15, 118, 110, 0.12)",
    cursor: "pointer",
  },
  submitBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  hint: { fontSize: 12, opacity: 0.75 },

  modeNote: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.8,
  },

  list: {
    maxHeight: 360,
    overflow: "auto",
    borderRadius: 14,
    border: "1px solid rgba(2,6,23,0.08)",
  },
  empty: { padding: 14, opacity: 0.7, fontSize: 13 },
  listRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderBottom: "1px solid rgba(2,6,23,0.06)",
    alignItems: "center",
  },
  listWord: { fontWeight: 900, letterSpacing: 1, display: "flex", gap: 8, alignItems: "center" },
  listXp: { fontWeight: 900, opacity: 0.85 },

  badgePower: {
    fontSize: 10,
    fontWeight: 900,
    padding: "3px 7px",
    borderRadius: 999,
    background: "rgba(245, 158, 11, 0.16)",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    letterSpacing: 0.3,
  },
  badgeTheme: {
    fontSize: 10,
    fontWeight: 900,
    padding: "3px 7px",
    borderRadius: 999,
    background: "rgba(15, 118, 110, 0.12)",
    border: "1px solid rgba(15, 118, 110, 0.30)",
    letterSpacing: 0.3,
  },

  footerStats: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 12,
    fontSize: 12,
    opacity: 0.8,
  },

  softDivider: {
    height: 1,
    background: "rgba(2,6,23,0.08)",
    margin: "12px 0",
  },
  reflect: { borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.03)" },
  reflectTitle: { fontSize: 12, fontWeight: 900, marginBottom: 6 },
  reflectText: { fontSize: 12, opacity: 0.78, lineHeight: 1.35 },

  endOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,0.55)",
    display: "grid",
    placeItems: "center",
    padding: 16,
  },
  endCard: {
    width: "min(560px, 92vw)",
    borderRadius: 22,
    background: "#fff",
    border: "1px solid rgba(2,6,23,0.12)",
    boxShadow: "0 20px 40px rgba(2,6,23,0.25)",
    padding: 16,
  },
  endTitle: { fontSize: 18, fontWeight: 900 },
  endMeta: { marginTop: 8, fontSize: 13, opacity: 0.82 },
  endActions: { display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" },
};
