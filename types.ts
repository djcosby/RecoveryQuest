
export type TabId = 'home' | 'league' | 'feed' | 'silverbook' | 'profile' | 'quests' | 'library' | 'practice';
export const ALL_TABS: TabId[] = ['home', 'quests', 'league', 'feed', 'silverbook', 'profile', 'library', 'practice'];

export type WellnessDimension = 
  | 'Emotional' | 'Physical' | 'Social' | 'Occupational' 
  | 'Financial' | 'Environmental' | 'Spiritual' | 'Intellectual';

export type RecoveryStage = 'Onboarding' | 'Stabilization' | 'Action' | 'Maintenance' | 'Growth';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'crisis';

// --- NEW GAME MAKER ENGINE TYPES ---

export type SegmentType =
  | "flash_card"
  | "match_pairs"
  | "sentence_builder"
  | "listening_comprehension"
  | "fill_gap"
  | "concept_sort"
  | "scenario_bridge"
  | "timed_challenge"
  | "conversation"
  | "markdown"
  | "multiple_choice"
  | "video_segment" // Added for multimedia
  | "audio_segment" // Added for multimedia
  | "review";

export type Feedback = {
  correct: string;
  incorrect: string;
  rationale?: string;
  tip?: string;
};

export type SkillTag = {
  framework: "BRAVE" | "BRAVING" | "RP" | "CBT" | "DBT" | "MI" | "WELLNESS";
  tag: string;
};

export type MasteryRule = {
  passAccuracy?: number;
  maxAttempts?: number;
  timeLimitMs?: number;
};

export interface FlashCardContent {
  front: string;
  back: string;
  example?: string;
}

export interface MatchPairContent {
  pairs: { id: string; left: string; right: string }[];
  shuffleLeft?: boolean;
  shuffleRight?: boolean;
}

export interface SentenceBuilderContent {
  segments: string[]; 
  correctOrder: string[]; 
  showWordBank?: boolean;
  hint?: string;
}

export interface MultipleChoiceContent {
  options: { id: string; text: string; isCorrect: boolean; explanation?: string }[];
}

export interface VideoSegmentContent {
  mediaUrl: string;
  posterUrl?: string;
  transcript?: string;
  comprehensionQuestion?: {
    text: string;
    options: { id: string; text: string; isCorrect: boolean }[];
  };
}

export interface AudioSegmentContent {
  mediaUrl: string;
  transcript?: string;
}

export interface FillGapPlaceholder {
  index: number;
  options: string[];
  correctOptionIndex: number;
}

export interface FillGapContent {
  textWithPlaceholder: string; 
  placeholders: FillGapPlaceholder[];
  shuffleOptions?: boolean;
}

export interface ConceptSortContent {
  buckets: { id: string; label: string }[];
  items: { id: string; text: string; bucketId: string }[];
  shuffleItems?: boolean;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  style: string;
  nextBeatId: string;
  efficacy?: number;
  composureDelta?: number;
  consequenceText?: string;
}

export interface ScenarioBeat {
  speaker: 'npc' | 'user' | 'system';
  text: string;
  choices?: ScenarioChoice[];
  isEnd?: boolean;
  score?: number;
}

export interface ScenarioBridgeContent {
  beats: Record<string, ScenarioBeat>;
  scoring?: { passScoreAtLeast: number };
}

export interface InteractiveSegment {
  id: string;
  type: SegmentType;
  prompt: string;
  content: any; // Discriminated by type
  feedback: Feedback;
  xpReward: number;
  teaches?: SkillTag[];
  difficulty?: 1 | 2 | 3 | 4 | 5;
  estimatedSeconds?: number;
  mastery?: MasteryRule;
  mediaUrl?: string;
  version?: string;
}

export type SegmentResult = {
  segmentId: string;
  type: SegmentType;
  isCorrect: boolean;
  accuracy?: number;
  attempts: number;
  timeMs: number;
  mistakes?: string[];
  selectedChoiceId?: string;
  metadata?: Record<string, unknown>;
};

export type ContentBlock = InteractiveSegment;

export interface PathNodeData {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  xpReward: number;
  status?: 'locked' | 'unlocked' | 'completed';
  contentBlocks?: InteractiveSegment[];
  educationalContent?: string;
  content?: any;
  targetDimension?: WellnessDimension;
  recoveryStage?: RecoveryStage;
  riskLevel?: RiskLevel;
  bossScenarioId?: number | string;
  prerequisites?: string[];
}

export type NodeType = 'lesson' | 'activity' | 'challenge' | 'boss' | 'chest' | 'trait_module';

export interface UserState {
  profile: UserProfile;
  level: number;
  xp: number;
  gems: number; 
  hearts: number;
  maxHearts: number;
  streak: number;
  lastActiveDate: string; 
  recoveryStage: RecoveryStage; 
  activeCourseId: string;
  inventory: string[]; 
  activeEffects: string[]; 
  completedNodes: string[];
  userTasks: UserTask[]; 
  notifications: string[]; 
  meetingsLogged: number;
  wellnessScores?: WellnessScores;
  competencies: CompetencyScores;
  gameMastery: Record<string, GameMasteryData>;
  assessmentHistory: AssessmentLogEntry[];
  baseline?: BaselineData;
  caseFile: CaseFile;
  feed: FeedPost[];
  clinicalProfile?: ClinicalConceptualization;
  dailyQuests: DailyQuest[];
  completedQuests: string[];
  checklistProgress: Record<string, any>;
}

export interface GameMasteryData {
  level: number;
  exp: number;
  bestScore: number;
  roundsPlayed: number;
  currentStreak: number;
  maxStreak: number;
}

export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  hasCompletedTutorial?: boolean;
  socials: Record<string, string>;
  focusAreas?: string[];
  notifications?: boolean;
  haptics?: boolean;
  defaultHashtags?: string;
  treatmentPlan?: { id: string; label: string; currentCount: number; targetCount: number }[];
}

export interface UserTask {
  id: string;
  text: string;
  type: 'daily' | 'weekly';
  isCompleted: boolean;
  isSystemSuggested?: boolean;
  category?: string;
  createdAt: string;
}

export interface WellnessScores {
  Emotional: number; Physical: number; Social: number; Occupational: number;
  Financial: number; Environmental: number; Spiritual: number; Intellectual: number;
}

export interface CompetencyScores {
  reliability: number; accountability: number; integrity: number;
  theVault: number; theFortress: number; vulnerability: number; grace: number;
}

export interface CaseFile {
  lastUpdated: string;
  dignity: any; health: any; recovery: any; legal: any; purpose: any;
}

export interface AssessmentLogEntry {
  id: string; date: string; assessmentTitle: string; score: number; resultLabel: string; assessmentId: string;
}

export interface ClinicalConceptualization {
  summary: string; strengths: string[]; riskFactors: string[]; recommendedFocus: string; lastUpdated: string;
}

export interface UnitData {
  id: string; title: string; description: string; color: string; nodes: PathNodeData[]; requirements: any;
}

export interface Course {
  id: string; title: string; description: string; icon: string; themeColor: string; units: UnitData[];
}

export interface FeedPost {
  id: number; author: string; role: string; content: string; type: 'milestone' | 'text' | 'announcement' | 'video';
  likes: number; time: string; thumbnail?: string; isPrivate?: boolean;
}

export interface RecoveryTool {
  id: string; name: string; skill: string; description: string; studyContent: string; icon: string; dimension: WellnessDimension;
}

export interface Resource {
  id: string | number; name: string; type: string; address: string; tags: string[]; verified: boolean;
  phone?: string; website?: string; description?: string; rating?: number; reviews?: number; lat?: number; lng?: number;
  kind?: 'provider' | 'meeting' | 'other';
}

export interface BaselineData {
  completedDate: string;
  demographics: { ageRange: string; genderIdentity: string; zipCode: string; };
  history: { primarySubstance: string; yearsOfUse: string; previousTreatments: number; familyHistory: boolean; };
  goals: { primaryGoal: string; biggestBarrier: string; motivationLevel: number; };
}

export interface ShopItem {
  id: string; name: string; description: string; cost: number; icon: string; type: 'consumable' | 'cosmetic'; effectId?: string;
}

export interface DailyQuest {
  id: string; label: string; target: number; progress: number; rewardGem: number; isClaimed: boolean; icon: string; 
}

export interface EmotionDef {
  id: string; name: string; parent: string; definition: string; scenario: string; 
}

export interface LibraryBook {
  id: string; title: string; author: string; coverEmoji: string; description: string; type: 'preset' | 'upload';
  progress: number; isVerified: boolean; themeColor: string; uploadedAt: string; quizzesTaken: number; masteryLevel: number; chapters: Chapter[];
}

export interface Chapter {
  id: string; title: string; content: string; quizCompleted?: boolean; lastScore?: number;
}

export interface QuizOption {
  id: string; text: string; isCorrect: boolean; explanation: string;
}

export type BookSkin = 'standard' | 'scholar' | 'street' | 'mystic' | 'gamer';
export interface GeneratedQuiz { id: string; relatedChapterId: string; questions: any[]; xpReward: number; completed: boolean; }

export interface PersonalityProfile {
  code: string;
  title: string;
  traits: {
    energy: string;
    mind: string;
    nature: string;
    tactics: string;
  };
  strengths: string[];
  riskAreas: string[];
}

export interface AIPathConfiguration {
  theme: string;
  focusNodes: string[];
  narrativeTone: string;
}

export interface QuizQuestion {
  id: number;
  category: string;
  text: string;
  options: string[]; 
  correctIndex: number;
  explanation?: string;
}

export type SponsorQuest = DailyQuest;
export type LessonUnit = UnitData;

export interface CompetencyRank {
  min: number;
  label: string;
}

export interface CompetencyDefinition {
  key: keyof CompetencyScores;
  label: string;
  domain: string;
  ideal: string;
  shadow: string;
  ranks: CompetencyRank[];
}

export interface ScenarioOption {
  id?: string;
  text: string;
  outcome: 'safe' | 'risk' | 'neutral';
  feedback: string;
  damage?: number;
  xp?: number;
  nextSceneId?: string;
  tags?: string[];
}

export interface ScenarioScene {
  id: string;
  text: string;
  options: ScenarioOption[];
}

export interface BossScenario {
  id: string | number;
  title: string;
  initialSceneId: string;
  description?: string; 
  scenes: Record<string, ScenarioScene>;
}

export type ConnectionType = 'peer' | 'sponsor' | 'sponsee' | 'care_team';
export interface Connection {
  peerId: string;
  type: ConnectionType;
  since: string;
}

export interface Peer {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  level: number;
  role: string;
  tags: string[];
  status: 'online' | 'away' | 'offline';
  lastActive: string;
  bio: string;
  lat?: number;
  lng?: number;
  programId?: string;
  isSponsor?: boolean;
}

export interface Meeting {
  id: string;
  name: string;
  type: string;
  format: 'AA' | 'NA' | 'SMART' | 'Other';
  address: string;
  dayOfWeek: string;
  time: string;
  tags: string[];
  lat?: number;
  lng?: number;
  hostResourceId?: string | number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  lastVisit: string;
}

export interface Appointment {
  id: string;
  providerId: string;
  date: string;
  time: string;
  type: string;
  status: 'upcoming' | 'completed';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  level: number;
  maxLevel: number;
  progress: number;
  target: number;
  icon: string;
  color: string;
}

export interface AssessmentDefinition {
  id: string;
  title: string;
  type: 'clinical' | 'personality';
  description: string;
  xpReward: number;
  questions: {
    id: number;
    category: string;
    text: string;
    options: { text: string; scoreValue: number }[];
  }[];
  scoringLogic?: {
    minScore: number;
    maxScore: number;
    resultLabel: string;
    resultDescription: string;
    recommendedToolIds?: string[];
    recommendedNodeIds?: string[];
  }[];
}

export type ToolId = "box_breath" | "defusion" | "play_tape" | "grounding" | "urge_surf";
export type BeatSpeaker = "npc" | "system";
export type BeatPressure = 1 | 2 | 3 | 4 | 5;
export type ChoiceStyle = "soft" | "firm" | "humor" | "exit" | "appease" | "attack" | "avoid" | "regulated" | "shutdown" | "collapse";

export interface Beat {
  id: string;
  speaker: BeatSpeaker;
  text: string;
  pressure: BeatPressure;
  tags: string[];
  choices?: {
    id: string;
    label: string;
    style: ChoiceStyle;
    efficacy: 1 | 2 | 3 | 4 | 5;
    composureDelta: number;
    consequenceText: string;
    nextBeatId: string;
    teaches?: string;
  }[];
  toolOffer?: {
    allowedTools: ToolId[];
    reason: string;
    composureRestore: number;
  };
  isEnd?: boolean;
  endType?: "safe" | "unsafe";
  applyQuest?: {
    title: string;
    options: string[];
  };
  score?: number; 
}

export interface Scenario {
  id: string;
  title: string;
  context: "friend" | "partner" | "family" | "dealer" | "coworker" | "boss";
  clinicalTargets: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  entryBeatId: string;
  tags: string[];
  beats: Record<string, Beat>;
  successConditions: { type: "exit_safe" | "maintain_boundary" | "use_tool_then_choose" }[];
  initialSceneId?: string; 
}

export interface DesignerScenarioOption {
  id: string;
  text: string;
  outcome: 'safe' | 'risk' | 'neutral';
  feedback: string;
  damage?: number;
  xp?: number;
  nextSceneId?: string;
  tags?: string[];
}

export interface DesignerScenarioScene {
  id: string;
  text: string;
  options: DesignerScenarioOption[];
}

export interface DesignerBossScenario {
  id: string | number;
  title: string;
  description?: string;
  initialSceneId: string;
  scenes: DesignerScenarioScene[];
}

export interface DesignerUnit {
  id: string;
  title: string;
  description: string;
  color: string;
  nodes: any[];
}

export interface DesignerCurriculum {
  units: DesignerUnit[];
  bossScenarios: DesignerBossScenario[];
}

export interface LintIssue {
  level: 'error' | 'warning';
  scope: string;
  message: string;
  unitId?: string;
  nodeId?: string;
  bossId?: string | number;
  sceneId?: string;
  optionId?: string;
}

export interface LintResult {
  issues: LintIssue[];
  errorCount: number;
  warningCount: number;
}

export interface BiometricRecord {
  id: string;
  date: string;
  heightFt: number;
  heightIn: number;
  weightLbs: number;
  systolicBP?: number;
  diastolicBP?: number;
  a1c?: number;
  cholesterol?: number;
  restingHeartRate?: number;
}

export interface HealthQuest {
  id: string;
  title: string;
  hedisCategory: string;
  description: string;
  frequency: string;
  isComplete: boolean;
  xpReward: number;
}

export interface HedisMeasure {
  id: string;
  name: string;
  domain: string;
  currentRate: number;
  goalRate: number;
  financialImpact: number;
  gapCount: number;
  trend: 'up' | 'down' | 'flat';
}

export interface HedisGap {
  id: string;
  patientName: string;
  patientId: string;
  measureName: string;
  triggerEvent: string;
  dueDate: string;
  status: string;
}

export interface WellnessStrategyContent {
  rangeLabel: string;
  narrative: string;
  strategies: string[];
}

export interface AssessmentQuestion {
  id: number;
  category: string;
  text: string;
  options: { text: string; traitValue?: string; scoreValue?: number }[];
}

export interface MoodLog {
  date: string;
  mood: string;
  value: number;
}

export type LessonLevel = PathNodeData;
export type LeagueUser = {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  status: 'up' | 'down' | 'same';
  avatarEmoji: string;
};
