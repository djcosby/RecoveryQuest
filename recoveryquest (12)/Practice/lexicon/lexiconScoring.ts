// src/practice/lexicon/lexiconScoring.ts
import { WordEntry } from "./wordBank";

export type LexiconMode = "free" | "themeLock" | "powerHunt";
export type LexiconDifficulty = 1 | 2 | 3 | 4 | 5;

export type LexiconRoundConfig = {
  mode: LexiconMode;
  difficulty: LexiconDifficulty;
  unitTag?: string; // e.g. "boundaries"
  specialization?: "stoic" | "mystic" | "scientist" | "all";
  durationSec?: number; // default based on difficulty
};

export type LexiconSubmitOutcome =
  | { ok: true; xp: number; isTheme: boolean; isPower: boolean; entry: WordEntry }
  | { ok: false; reason: "not_found" | "locked" | "too_hard" | "specialization_mismatch" };

export function defaultDurationSec(difficulty: LexiconDifficulty) {
  // “friction changes” rather than pure timer shrink
  if (difficulty === 1) return 120;
  if (difficulty === 2) return 105;
  if (difficulty === 3) return 90;
  if (difficulty === 4) return 80;
  return 70;
}

export function wordBaseXp(wordLen: number, entryDifficulty: number) {
  // simple, transparent economy
  const lengthBonus = Math.max(0, wordLen - 3); // 0..+
  return 8 + lengthBonus * 2 + entryDifficulty * 3;
}

export function computeSubmitOutcome(args: {
  word: string;
  entry: WordEntry | undefined;
  unlockedWordIds: Set<string>; // unlock ids for power words (lesson/boss ids)
  config: LexiconRoundConfig;
}) : LexiconSubmitOutcome {
  const { word, entry, unlockedWordIds, config } = args;

  if (!entry) return { ok: false, reason: "not_found" };

  // specialization gate (optional)
  const spec = config.specialization ?? "all";
  if (entry.specialization && entry.specialization !== "all" && spec !== "all" && entry.specialization !== spec) {
    return { ok: false, reason: "specialization_mismatch" };
  }

  // difficulty gate: allow “slightly above,” but not wildly above
  if (entry.difficulty > config.difficulty + 1) {
    return { ok: false, reason: "too_hard" };
  }

  // power word gate
  const isPower = !!entry.power;
  if (isPower) {
    const unlockId = entry.unlock?.id;
    if (unlockId && !unlockedWordIds.has(unlockId)) {
      return { ok: false, reason: "locked" };
    }
  }

  const isTheme = !!config.unitTag && entry.tags.includes(config.unitTag);

  let xp = wordBaseXp(word.length, entry.difficulty);

  if (config.mode === "themeLock") {
    // Theme words matter more; off-theme still counts but lower.
    xp = isTheme ? Math.round(xp * 1.35) : Math.round(xp * 0.75);
  }

  if (config.mode === "powerHunt") {
    // power words get a meaningful spike
    if (isPower) xp = Math.round(xp * 1.75);
  }

  return { ok: true, xp, isTheme, isPower, entry };
}
