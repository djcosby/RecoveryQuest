// recoveryquest (16)/Practice/games/filterFeed/filterFeedDeck.ts

export type Specialization = "stoic" | "mystic" | "scientist" | "all";
export type Distortion =
  | "mind_reading"
  | "catastrophizing"
  | "all_or_nothing"
  | "labeling"
  | "should"
  | "emotional_reasoning"
  | "fortune_telling"
  | "personalization"
  | "minimization"
  | "permission"
  | "comparison";

export type ThoughtCategory = "adaptive" | "maladaptive" | "neutral";

export type ThoughtCard = {
  id: string;
  text: string;                 // "Just one won't matter."
  category: ThoughtCategory;     // adaptive=KEEP, maladaptive=TRASH, neutral=optional KEEP (MVP keeps it)
  tags: string[];               // ["craving","permission","minimization"]
  distortion?: Distortion;      // only for maladaptive (usually)
  difficulty: 1 | 2 | 3 | 4 | 5;
  rationale: string;            // 1–2 lines max
  replacement?: string;         // optional “better thought”
  unitTag?: string;             // e.g. "cravings", "boundaries"
  specialization?: Specialization;
};

// --- Starter deck: clinically safe, no “diagnostic labeling,” no shame language beyond cards that *name shame*.
// Keep rationales short: fast feedback, not therapy-in-the-moment.

export const FILTER_FEED_DECK: ThoughtCard[] = [
  // --- Cravings / permission / minimization (maladaptive) ---
  {
    id: "m1",
    text: "Just one won’t matter.",
    category: "maladaptive",
    tags: ["craving", "minimization"],
    distortion: "minimization",
    difficulty: 1,
    rationale: "Minimization turns a risk into a ‘small exception.’",
    replacement: "One leads to two. I can pause for 60 seconds.",
    unitTag: "cravings",
    specialization: "all",
  },
  {
    id: "m2",
    text: "I’ve been good… I earned this.",
    category: "maladaptive",
    tags: ["craving", "permission"],
    distortion: "permission",
    difficulty: 3,
    rationale: "Permission thinking reframes relapse as a reward.",
    replacement: "My reward is waking up clear tomorrow.",
    unitTag: "cravings",
    specialization: "all",
  },
  {
    id: "m3",
    text: "Nobody will know.",
    category: "maladaptive",
    tags: ["craving", "secrecy", "permission"],
    distortion: "permission",
    difficulty: 2,
    rationale: "Secrecy lowers accountability and raises risk.",
    replacement: "I will know. Call someone before deciding.",
    unitTag: "cravings",
    specialization: "all",
  },

  // --- Shame / all-or-nothing (maladaptive) ---
  {
    id: "m4",
    text: "I already messed up, so why try?",
    category: "maladaptive",
    tags: ["shame", "all_or_nothing"],
    distortion: "all_or_nothing",
    difficulty: 2,
    rationale: "All-or-nothing turns a slip into surrender.",
    replacement: "Progress counts. Reset the next choice.",
    unitTag: "shame_resilience",
    specialization: "all",
  },
  {
    id: "m5",
    text: "If I’m not perfect, it doesn’t count.",
    category: "maladaptive",
    tags: ["shame", "all_or_nothing", "perfectionism"],
    distortion: "all_or_nothing",
    difficulty: 3,
    rationale: "Perfectionism is a trap disguised as standards.",
    replacement: "Consistency beats perfection.",
    unitTag: "values",
    specialization: "all",
  },
  {
    id: "m6",
    text: "I’m a loser.",
    category: "maladaptive",
    tags: ["shame", "labeling"],
    distortion: "labeling",
    difficulty: 2,
    rationale: "Labeling turns behavior into identity.",
    replacement: "I’m learning. I’m not done.",
    unitTag: "shame_resilience",
    specialization: "all",
  },

  // --- Relationship triggers / mind reading (maladaptive) ---
  {
    id: "m7",
    text: "She hates me.",
    category: "maladaptive",
    tags: ["relationships", "mind_reading"],
    distortion: "mind_reading",
    difficulty: 1,
    rationale: "Mind reading pretends you know what others think.",
    replacement: "I can ask for clarity instead of guessing.",
    unitTag: "social_connection",
    specialization: "all",
  },
  {
    id: "m8",
    text: "They’re judging me.",
    category: "maladaptive",
    tags: ["relationships", "mind_reading", "shame"],
    distortion: "mind_reading",
    difficulty: 2,
    rationale: "Assumptions amplify anxiety without evidence.",
    replacement: "Focus on my values, not their imagined thoughts.",
    unitTag: "social_connection",
    specialization: "all",
  },

  // --- Catastrophizing / emotional reasoning (maladaptive) ---
  {
    id: "m9",
    text: "I can’t handle this feeling.",
    category: "maladaptive",
    tags: ["distress_tolerance", "catastrophizing"],
    distortion: "catastrophizing",
    difficulty: 2,
    rationale: "Catastrophizing makes discomfort feel fatal.",
    replacement: "This is uncomfortable—not dangerous.",
    unitTag: "distress_tolerance",
    specialization: "all",
  },
  {
    id: "m10",
    text: "Because I feel anxious, something bad will happen.",
    category: "maladaptive",
    tags: ["anxiety", "emotional_reasoning"],
    distortion: "emotional_reasoning",
    difficulty: 4,
    rationale: "Emotional reasoning treats feelings as proof.",
    replacement: "Feelings are signals, not forecasts.",
    unitTag: "distress_tolerance",
    specialization: "all",
  },

  // --- Boundaries / “should” (maladaptive) ---
  {
    id: "m11",
    text: "I should say yes so nobody gets mad.",
    category: "maladaptive",
    tags: ["boundaries", "people_pleasing", "should"],
    distortion: "should",
    difficulty: 3,
    rationale: "‘Should’ turns fear of conflict into a rule.",
    replacement: "I can say no and tolerate discomfort.",
    unitTag: "boundaries",
    specialization: "all",
  },

  // --- Adaptive (KEEP / Feed) ---
  {
    id: "a1",
    text: "This feeling will pass.",
    category: "adaptive",
    tags: ["distress_tolerance", "regulation"],
    difficulty: 1,
    rationale: "Urges and emotions crest and recede like waves.",
    unitTag: "distress_tolerance",
    specialization: "all",
  },
  {
    id: "a2",
    text: "I can pause for 60 seconds.",
    category: "adaptive",
    tags: ["cravings", "impulse_interruption"],
    difficulty: 1,
    rationale: "A small pause protects the next decision.",
    unitTag: "cravings",
    specialization: "all",
  },
  {
    id: "a3",
    text: "Call someone before you decide.",
    category: "adaptive",
    tags: ["social_connection", "support"],
    difficulty: 2,
    rationale: "Connection interrupts secrecy and escalation.",
    unitTag: "social_connection",
    specialization: "all",
  },
  {
    id: "a4",
    text: "Progress counts, not perfection.",
    category: "adaptive",
    tags: ["values", "self_compassion"],
    difficulty: 2,
    rationale: "Recovery is direction, not flawless execution.",
    unitTag: "values",
    specialization: "all",
  },
  {
    id: "a5",
    text: "My values are bigger than this moment.",
    category: "adaptive",
    tags: ["values", "meaning"],
    difficulty: 3,
    rationale: "Values give the mind a north star under stress.",
    unitTag: "values",
    specialization: "all",
  },

  // --- Neutral (MVP: treat as KEEP, later could become HOLD) ---
  {
    id: "n1",
    text: "I’m tired today.",
    category: "neutral",
    tags: ["stabilization", "body"],
    difficulty: 1,
    rationale: "Neutral observation—use it to make wise choices.",
    unitTag: "stabilization",
    specialization: "all",
  },
  {
    id: "n2",
    text: "This is hard.",
    category: "neutral",
    tags: ["distress_tolerance"],
    difficulty: 1,
    rationale: "Neutral truth—hard doesn’t mean impossible.",
    unitTag: "distress_tolerance",
    specialization: "all",
  },
];

// Select a deck slice aligned to unitTag + difficulty + specialization.
// MVP rule: keep it fair and “winnable.”
export function buildDeck(params: {
  unitTag?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  specialization?: Specialization;
  size?: number; // how many cards to draw
}) {
  const { unitTag, difficulty, specialization = "all", size = 40 } = params;

  const eligible = FILTER_FEED_DECK.filter((c) => {
    const specOk = !c.specialization || c.specialization === "all" || specialization === "all" || c.specialization === specialization;
    const unitOk = !unitTag || c.unitTag === unitTag || c.tags.includes(unitTag);
    const diffOk = c.difficulty <= Math.min(5, difficulty + 1); // allow slight stretch
    return specOk && unitOk && diffOk;
  });

  // Deck composition: more obvious at low difficulty, more “poison honey” as difficulty increases.
  const maladaptiveWeight = difficulty <= 2 ? 0.55 : difficulty === 3 ? 0.60 : 0.65;
  const adaptiveWeight = 1 - maladaptiveWeight;

  const mal = eligible.filter((c) => c.category === "maladaptive");
  const adp = eligible.filter((c) => c.category === "adaptive");
  const neu = eligible.filter((c) => c.category === "neutral");

  const pick = <T,>(arr: T[], n: number) => {
    const copy = [...arr];
    const out: T[] = [];
    while (copy.length && out.length < n) {
      const i = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(i, 1)[0]);
    }
    return out;
  };

  const malCount = Math.max(8, Math.round(size * maladaptiveWeight));
  const adpCount = Math.max(8, Math.round(size * adaptiveWeight));
  const neuCount = Math.max(0, size - malCount - adpCount);

  const chosen = [
    ...pick(mal, malCount),
    ...pick(adp, adpCount),
    ...pick(neu, neuCount),
  ];

  // shuffle
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
  }

  return chosen;
}
