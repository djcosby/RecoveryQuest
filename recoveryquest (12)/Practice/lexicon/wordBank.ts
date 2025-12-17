// src/practice/lexicon/wordBank.ts

export type Specialization = "stoic" | "mystic" | "scientist" | "all";
export type WordDifficulty = 1 | 2 | 3 | 4 | 5;

export type WordEntry = {
  word: string; // stored uppercase
  tags: string[]; // e.g. ["boundaries","stability"]
  difficulty: WordDifficulty;
  definition?: string; // 1 sentence max
  power?: boolean; // requires unlock if true
  unlock?: { type: "lesson" | "boss"; id: string };
  specialization?: Specialization;
};

const W = (
  word: string,
  tags: string[],
  difficulty: WordDifficulty,
  definition?: string,
  power?: boolean,
  unlock?: WordEntry["unlock"],
  specialization: Specialization = "all"
): WordEntry => ({
  word: word.toUpperCase(),
  tags,
  difficulty,
  definition,
  power,
  unlock,
  specialization,
});

/**
 * Seed pack: intentionally “recovery-adjacent” and clinically safe.
 * Expand freely—this structure is what makes the game endless.
 */
export const WORD_BANK: WordEntry[] = [
  // Stabilization / basics
  W("SAFE", ["stabilization", "safety"], 1, "A condition where you are not in immediate danger."),
  W("REST", ["stabilization", "sleep"], 1, "Intentional recovery for the body and mind."),
  W("SLEEP", ["stabilization", "sleep"], 1, "A biological reset that protects judgment."),
  W("WATER", ["stabilization", "body"], 1, "Hydration supports mood and cognition."),
  W("EAT", ["stabilization", "body"], 1, "Fuel first; clarity follows."),
  W("ROUTINE", ["stabilization", "structure"], 2, "Simple structure that reduces chaos."),
  W("GROUND", ["stabilization", "distress_tolerance"], 2, "Return attention to the present moment."),
  W("STEADY", ["stabilization", "regulation"], 2, "Less reactive; more anchored."),

  // Cravings / distress tolerance
  W("PAUSE", ["cravings", "distress_tolerance"], 1, "A deliberate gap between urge and action."),
  W("BREATHE", ["cravings", "distress_tolerance"], 2, "Use breath to signal safety to the nervous system."),
  W("WAIT", ["cravings", "distress_tolerance"], 1, "Delay creates choice."),
  W("WAVE", ["cravings", "distress_tolerance"], 1, "Urges rise, peak, and pass."),
  W("URGE", ["cravings"], 1, "A strong impulse that is not a command."),
  W("CRAVE", ["cravings"], 1, "A desire that can be observed without obeying."),
  W("COPE", ["distress_tolerance"], 1, "A skillful response to pain or stress."),
  W("TOOLS", ["distress_tolerance"], 2, "Learned strategies you can apply under pressure."),

  // Boundaries / assertiveness
  W("NO", ["boundaries", "assertiveness"], 1, "A complete sentence."),
  W("LIMIT", ["boundaries", "assertiveness"], 2, "A line that protects what matters."),
  W("SPACE", ["boundaries", "regulation"], 1, "Distance that allows self-control."),
  W("RESPECT", ["boundaries", "values"], 2, "Behavior that honors dignity—yours and others’."),
  W("ASK", ["boundaries", "communication"], 1, "Request clarity rather than guess."),
  W("LEAVE", ["boundaries", "safety"], 1, "Exit high-risk situations early."),
  W("BOUNDARY", ["boundaries", "assertiveness"], 3, "A protective rule that defines what is acceptable."),
  W("CONSENT", ["boundaries", "communication"], 3, "Agreement that is informed, specific, and freely given."),
  W("ASSERT", ["boundaries", "communication"], 3, "State needs clearly without hostility."),

  // Values / identity building
  W("TRUTH", ["values", "integrity"], 2, "Reality-based living—no side stories."),
  W("HONOR", ["values", "integrity"], 3, "Act in alignment with what you claim to value."),
  W("GRACE", ["values", "self_compassion"], 2, "Kindness that doesn’t require perfection."),
  W("COURAGE", ["values", "resilience"], 3, "Move forward with fear in the room."),
  W("SERVICE", ["values", "social_connection"], 3, "Recovery grows when it’s shared."),
  W("ENOUGH", ["values", "self_worth"], 2, "You can stop chasing approval."),
  W("PURPOSE", ["values", "meaning"], 3, "A reason that outlasts cravings."),
  W("DIGNITY", ["values", "self_worth"], 4, "Inherent worth—unearned and non-negotiable."),

  // Emotional literacy (keep words clinically useful; avoid slurs/labels)
  W("CALM", ["emotional_literacy", "regulation"], 1, "A settled state; not numbness."),
  W("ANGER", ["emotional_literacy"], 1, "A signal that something feels threatened or unjust."),
  W("SHAME", ["emotional_literacy", "shame_resilience"], 2, "The painful belief that you are flawed, not just your behavior."),
  W("GRIEF", ["emotional_literacy"], 2, "Love with nowhere to go."),
  W("LONELY", ["emotional_literacy", "social_connection"], 2, "A signal to reconnect, not to collapse."),
  W("AFRAID", ["emotional_literacy"], 2, "A fear response; often asking for safety."),
  W("TRUST", ["emotional_literacy", "relationships"], 2, "Confidence built through consistent actions."),
  W("PEACE", ["emotional_literacy", "meaning"], 2, "Quiet strength, not the absence of struggle."),
  W("HOPE", ["emotional_literacy", "resilience"], 1, "Belief that change is possible."),

  // CBT concepts (harder)
  W("RUMINATION", ["cbt", "distress_tolerance"], 4, "Repetitive thinking that amplifies distress without solving."),
  W("TRIGGER", ["relapse_prevention"], 2, "A cue that increases risk; not fate."),
  W("RELAPSE", ["relapse_prevention"], 3, "A return to use patterns; information, not identity."),
  W("RECOVERY", ["values", "meaning"], 3, "A life built, not a lecture learned."),
  W("ACCOUNTABLE", ["values", "integrity"], 4, "Owning actions without self-destruction."),
  W("MINDFUL", ["distress_tolerance", "regulation"], 3, "Aware without being hijacked."),
  W("REGULATE", ["regulation", "distress_tolerance"], 4, "Shift your state with skill, not force."),

  // Power Words (gated)
  W(
    "GRIT",
    ["values", "resilience"],
    2,
    "Sustained effort under stress—without drama.",
    true,
    { type: "lesson", id: "unit_resilience_01" }
  ),
  W(
    "INTEGRITY",
    ["values", "integrity"],
    4,
    "Alignment between your values and your actions.",
    true,
    { type: "boss", id: "boss_boundary_breaker" }
  ),
  W(
    "SOBER",
    ["stabilization", "relapse_prevention"],
    2,
    "Not using—so your real life can show up.",
    true,
    { type: "lesson", id: "unit_stabilization_01" }
  ),
];

export const DEFAULT_TAGS = [
  "stabilization",
  "cravings",
  "distress_tolerance",
  "boundaries",
  "emotional_literacy",
  "relapse_prevention",
  "values",
  "social_connection",
  "shame_resilience",
  "cbt",
] as const;

export function normalizeWord(w: string) {
  return (w || "").trim().toUpperCase();
}

export function getBankIndex(bank: WordEntry[] = WORD_BANK) {
  const byWord = new Map<string, WordEntry>();
  for (const e of bank) byWord.set(e.word, e);
  return byWord;
}
