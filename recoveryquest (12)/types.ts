
export type TabId = 'home' | 'league' | 'feed' | 'silverbook' | 'profile' | 'quests' | 'library' | 'practice';
export const ALL_TABS: TabId[] = ['home', 'quests', 'league', 'feed', 'silverbook', 'profile', 'library', 'practice'];

export type WellnessDimension = 
  | 'Emotional' | 'Physical' | 'Social' | 'Occupational' 
  | 'Financial' | 'Environmental' | 'Spiritual' | 'Intellectual';

export type RecoveryStage = 'Onboarding' | 'Stabilization' | 'Action' | 'Maintenance' | 'Growth';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'crisis';

export interface WellnessScores {
  Emotional: number;
  Physical: number;
  Social: number;
  Occupational: number;
  Financial: number;
  Environmental: number;
  Spiritual: number;
  Intellectual: number;
}

export interface AIPathConfiguration {
  architectMessage: string;
  focusArea: string;
  recommendedNodeIds: string[];
  customDailyQuest: {
    title: string;
    description: string;
    xp: number;
  };
  suggestedTools: string[];
}

export interface WellnessStrategyContent {
  rangeLabel: string;
  narrative: string;
  strategies: string[];
}

export interface CaseFile {
  lastUpdated: string;
  dignity: {
    wallet: boolean;
    belt: boolean;
    stateId: boolean;
    socialSecurityCard: boolean;
    birthCertificate: boolean;
    cellPhone: boolean;
    seasonalClothing: boolean;
    hygieneKit: boolean;
    foodSource: 'SNAP' | 'Pantry' | 'Family' | 'None';
  };
  health: {
    hasPCP: boolean;
    hasDentist: boolean;
    needsGlasses: boolean;
    insuranceProvider: string;
    medicationAdherence: boolean;
  };
  recovery: {
    hasSponsor: boolean;
    homeGroup: string;
    recoveryPathway: '12-Step' | 'SMART' | 'Faith' | 'Other' | '';
    housingStatus: 'Independent' | 'Sober Living' | 'Shelter' | 'Homeless' | 'Family';
    isEnvironmentSafe: boolean;
  };
  legal: {
    probationOfficer: string;
    hasWarrants: boolean;
    licenseStatus: 'Valid' | 'Suspended' | 'Revoked' | 'None';
  };
  purpose: {
    employmentStatus: 'Full-time' | 'Part-time' | 'Unemployed' | 'Disabled';
    educationLevel: string;
    primaryStrength: string;
  };
  topPriorities: string[];
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

export interface BaselineData {
  completedDate: string;
  demographics: {
    ageRange: string;
    genderIdentity: string;
    zipCode: string;
  };
  history: {
    primarySubstance: string;
    yearsOfUse: string;
    previousTreatments: number;
    familyHistory: boolean;
  };
  goals: {
    primaryGoal: string;
    biggestBarrier: string;
    motivationLevel: number;
  };
}

export interface UserProfile {
  id?: string;
  name: string;
  bio: string;
  avatar: string;
  email?: string;
  notifications: boolean;
  haptics: boolean;
  defaultHashtags?: string;
  hasCompletedTutorial?: boolean;
  focusAreas?: string[]; // NEW: User selected focus
  socials: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  treatmentPlan?: TreatmentRequirement[];
}

export interface DailyQuest {
  id: string;
  label: string;
  target: number;
  progress: number;
  rewardGem: number;
  isClaimed: boolean;
  icon: string; 
  isCustom?: boolean; 
}

// NEW: User Defined Tasks
export interface UserTask {
  id: string;
  text: string;
  type: 'daily' | 'weekly';
  isCompleted: boolean;
  isSystemSuggested?: boolean; // If true, added by Assessment Logic
  category?: string; // e.g., 'Social', 'Health'
  createdAt: string;
}

export interface SponsorQuest extends DailyQuest {
  assignedBy: string; 
  bossScenarioId?: number; 
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

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  type: 'consumable' | 'cosmetic' | 'subscription';
  effectId?: string;
}

export interface AssessmentLogEntry {
  id: string;
  date: string;
  assessmentId: string;
  assessmentTitle: string;
  score: number;
  resultLabel: string;
  rawAnswers?: number[];
  aiFeedback?: string;
}

export interface ClinicalConceptualization {
  summary: string;
  strengths: string[];
  riskFactors: string[];
  recommendedFocus: string;
  lastUpdated: string;
}

export interface UserState {
  profile: UserProfile;
  level: number;
  xp: number;
  gems: number; 
  hearts: number;
  maxHearts: number;
  streak: number;
  lastActiveDate: string; 
  lastWellnessCheck?: string; 
  recoveryStage: RecoveryStage; 
  activeCourseId: string;
  inventory: string[]; 
  activeEffects: string[]; 
  completedNodes: string[];
  checklistProgress: Record<string, string[]>; 
  completedQuests: string[];
  dailyQuests: (DailyQuest | SponsorQuest)[]; 
  userTasks: UserTask[]; // NEW: The Planner List
  notifications: string[]; 
  aiPathConfig?: AIPathConfiguration; 
  meetingsLogged: number;
  wellnessScores?: WellnessScores;
  caseFile?: CaseFile;
  biometrics?: BiometricRecord[];
  baseline?: BaselineData;
  assessmentHistory: AssessmentLogEntry[];
  clinicalProfile?: ClinicalConceptualization;
}

export type ConnectionType = 'sponsor' | 'sponsee' | 'peer' | 'care_team';

export interface Peer {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  level: number;
  xp: number;
  streak: number;
  role: string;
  tags: string[];
  status: 'online' | 'offline' | 'away';
  lastActive: string;
  lat?: number;
  lng?: number;
  programId?: string; 
  isSponsor?: boolean; 
}

export interface Connection {
  peerId: string;
  type: ConnectionType;
  since: string;
}

export type NodeType = 'lesson' | 'activity' | 'challenge' | 'boss' | 'chest' | 'trait_module';

export type ExerciseType = 'match_pairs' | 'reorder' | 'fill_blank';

export interface InteractiveExercise {
  type: ExerciseType;
  prompt: string;
  items: { id: string; text: string; matchId?: string }[];
  correctOrder?: string[];
  xpReward: number;
}

export interface MicroSkill {
  title: string;
  description: string;
  challenge?: string;
}

export interface Challenge {
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  title: string;
  description: string;
  xp: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  xp: number;
}

export interface TraitModule {
  description: string;
  maladaptiveBehaviors: string[];
  microSkills: MicroSkill[];
  selfCheck: {
    question: string;
    anchors: { score: number; label: string; description: string }[];
  };
  challengeLadder: Challenge[];
  checklist?: ChecklistItem[]; 
}

export interface PathNodeData {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  xpReward: number;
  toolRewardId?: string;
  targetDimension?: WellnessDimension;
  recoveryStage?: RecoveryStage;
  riskLevel?: RiskLevel;
  bossScenarioId?: number;
  position?: { x: number, y: number };
  status?: 'locked' | 'unlocked' | 'completed';
  content?: TraitModule;
  prerequisites?: string[];
  exercises?: InteractiveExercise[];
}

export interface UnitData {
  id: string;
  title: string;
  description: string;
  color: string;
  nodes: PathNodeData[];
  requirements: {
    minXP: number;
    minMeetings?: number;
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  themeColor: string;
  units: UnitData[];
}

export interface ScenarioOption {
  text: string;
  outcome: 'safe' | 'risk' | 'neutral';
  feedback: string;
  damage?: number; 
  xp?: number;
  nextSceneId?: string; 
}

export interface ScenarioScene {
  id: string;
  text: string;
  options: ScenarioOption[];
}

export interface BossScenario {
  id: number;
  title: string;
  initialSceneId: string;
  scenes: Record<string, ScenarioScene>;
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
  id: number;
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
  nodes: PathNodeData[];
}

export interface DesignerCurriculum {
  units: DesignerUnit[];
  bossScenarios: DesignerBossScenario[];
}

export interface LintIssue {
  level: 'error' | 'warning';
  message: string;
  scope: 'unit' | 'node' | 'bossScenario' | 'scene' | 'option';
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

export interface Meeting {
  id: string;
  name: string;
  type: 'meeting';
  format: 'AA' | 'NA' | 'SMART' | 'Other';
  address: string;
  dayOfWeek: string;
  time: string;
  tags: string[];
  lat?: number;
  lng?: number;
  hostResourceId?: number | string;
}

export interface Resource {
  id: number | string;
  name: string;
  type: string;
  rating?: number;
  reviews?: number;
  address: string;
  tags: string[];
  verified: boolean;
  lat?: number;
  lng?: number;
  kind?: 'provider' | 'meeting' | 'other';
  phone?: string;
  website?: string;
  description?: string;
}

export interface FeedPost {
  id: number;
  author: string;
  role: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'announcement' | 'milestone';
  likes: number;
  time: string;
  thumbnail?: string;
}

export interface LeagueUser {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  status: 'up' | 'down' | 'same';
  avatarEmoji?: string;
  peerId?: string; 
}

export interface MoodLog {
  date: string;
  mood: string;
  value: number;
  dimensionImpact?: WellnessDimension;
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
  status: 'upcoming' | 'completed' | 'cancelled';
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

export interface AssessmentOption {
  text: string;
  traitValue?: string; 
  scoreValue?: number;
}

export interface AssessmentQuestion {
  id: number;
  category: string; 
  text: string;
  options: AssessmentOption[];
}

export interface AssessmentResultLogic {
  minScore: number;
  maxScore: number;
  resultLabel: string;
  resultDescription: string;
  recommendedNodeIds?: string[];
  recommendedToolIds?: string[];
}

export type AssessmentType = 'personality' | 'clinical' | 'capital';

export interface AssessmentDefinition {
  id: string;
  title: string;
  type: AssessmentType;
  description: string;
  questions: AssessmentQuestion[];
  scoringLogic?: AssessmentResultLogic[]; 
  xpReward: number;
}

export interface PersonalityProfile {
  code: string;
  title: string;
  traits: {
    energy: string;
    mind: string;
    nature: string;
    tactics: string;
    identity?: string;
  };
  strengths: string[];
  riskAreas: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface RecoveryTool {
  id: string;
  name: string;
  skill: string;
  description: string;
  studyContent: string;
  icon: string;
  dimension: WellnessDimension;
}

// --- NEW LIBRARY TYPES ---

export type BookSkin = 'standard' | 'scholar' | 'street' | 'mystic' | 'gamer';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  summary?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  coverEmoji: string;
  description: string;
  type: 'preset' | 'upload';
  chapters: Chapter[];
  progress: number;
  isVerified: boolean;
  themeColor: string;
  uploadedAt: string;
  quizzesTaken: number;
  masteryLevel: number;
}

export interface TreatmentRequirement {
  id: string;
  label: string; 
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number; 
  currentCount: number;
  resetDay?: string; 
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface GeneratedQuiz {
  id: string;
  relatedChapterId: string;
  questions: QuizQuestion[];
  xpReward: number;
  completed: boolean;
}

// --- NEW PRACTICE ARENA TYPES ---

export interface EmotionDef {
  id: string;
  name: string;
  parent: 'Mad' | 'Sad' | 'Glad' | 'Fear' | 'Shame';
  definition: string;
  scenario: string; 
}
