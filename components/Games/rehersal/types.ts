// recoveryquest (16)/Practice/games/rehearsal/types.ts

export type ToolId =
  | "box_breath"
  | "defusion"
  | "play_tape"
  | "grounding"
  | "urge_surf";

export type BeatSpeaker = "npc" | "system";

export type BeatPressure = 1 | 2 | 3 | 4 | 5;

export type ChoiceStyle =
  | "soft"
  | "firm"
  | "humor"
  | "exit"
  | "appease"
  | "attack"
  | "avoid"
  | "regulated"
  | "shutdown"
  | "collapse";

export type Choice = {
  id: string;
  label: string;
  style: ChoiceStyle;
  efficacy: 1 | 2 | 3 | 4 | 5;
  composureDelta: number; // + or -
  consequenceText: string;
  nextBeatId: string;
  teaches?: string; // optional micro-lesson tag
};

export type ToolOffer = {
  allowedTools: ToolId[];
  reason: string;
  composureRestore: number; // amount added if tool used
};

export type Beat = {
  id: string;
  speaker: BeatSpeaker;
  text: string;

  pressure: BeatPressure;
  tags: string[];

  choices?: Choice[];
  toolOffer?: ToolOffer;

  // If true, this beat is an ending. If absent, engine will treat "no choices" as ending anyway.
  isEnd?: boolean;
  endType?: "safe" | "unsafe";
  applyQuest?: {
    title: string;
    options: string[];
  };
};

export type ScenarioContext =
  | "friend"
  | "partner"
  | "family"
  | "dealer"
  | "coworker"
  | "boss";

export type SuccessCondition =
  | { type: "exit_safe" }
  | { type: "maintain_boundary" }
  | { type: "use_tool_then_choose" };

export type Scenario = {
  id: string;
  title: string;
  context: ScenarioContext;
  clinicalTargets: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  entryBeatId: string;
  tags: string[]; // scenario-level tags (unit/domain)
  beats: Record<string, Beat>;
  successConditions: SuccessCondition[];
};

export type SelfReportLabel = "urge" | "anxiety" | "anger" | "shame" | "social_pressure";

export type GameResult = {
  gameId: "the_rehearsal";
  scenarioId: string;
  completed: boolean;

  score: number;         // 0–100 normalized
  accuracy: number;      // 0–1
  attempts: number;
  durationMs: number;

  composureStart: number; // 0–100
  composureEnd: number;   // 0–100
  toolsUsed: ToolId[];
  exitsUsed: number;

  tags: string[];
  weakPoints: string[];
  selfReport?: { pre?: number; post?: number; label?: SelfReportLabel };
};
