
import { CompetencyDefinition } from './types';

// Gamification
export { ACHIEVEMENTS_LIST, LEAGUE_DATA, FEED_POSTS } from './data/gamification';

// Clinical & Wellness
export { 
  DEFAULT_CASE_FILE,
  HEDIS_QUESTS, 
  MOCK_HEDIS_MEASURES, 
  MOCK_HEDIS_GAPS, 
  MOCK_BIOMETRICS_HISTORY, 
  MOCK_PROVIDERS, 
  MOCK_APPOINTMENTS, 
  WELLNESS_STRATEGIES_DB, 
  WELLNESS_DIMENSION_QUESTIONS,
  MOOD_HISTORY,
  ASSESSMENT_QUESTIONS,
  PERSONALITY_ARCHETYPES
} from './data/clinical';

// Resources
export { RESOURCES_DB, RAW_MEETINGS_CSV, RECOVERY_TOOLS } from './data/resources';

// Courses
export { BOSS_SCENARIOS, CURRICULUM_TREE, COURSES } from './data/courses';

// Library
export { PRESET_BOOKS } from './data/library';

// Emotions (was already external)
export { FEELINGS_DB } from './data/emotions';

// Assessments (was already external)
export { ASSESSMENTS_REGISTRY } from './data/assessments';

export const COMPETENCY_CONFIG: CompetencyDefinition[] = [
  {
    key: 'reliability',
    label: 'Reliability',
    domain: 'Self-Confidence',
    ideal: 'Punctuality not as a courtesy, but as a discipline of respect.',
    shadow: 'The "Flake" Factor: A pattern of chronic lateness and excuses.',
    ranks: [
      { min: 0, label: 'Chaos Agent' },
      { min: 30, label: 'Observer' },
      { min: 60, label: 'Consistent' },
      { min: 90, label: 'The Go-To Person' }
    ]
  },
  {
    key: 'accountability',
    label: 'Accountability',
    domain: 'Self-Confidence',
    ideal: 'Standing in the wreckage of a mistake and saying, "I did this."',
    shadow: 'The "Yeah, But..." Syndrome: Every apology is a justification.',
    ranks: [
      { min: 0, label: 'The Victim' },
      { min: 30, label: 'Aware' },
      { min: 60, label: 'Owner' },
      { min: 90, label: 'Radical Leader' }
    ]
  },
  {
    key: 'integrity',
    label: 'Integrity',
    domain: 'Self-Confidence',
    ideal: 'Choosing courage over comfort. Doing right when no one is watching.',
    shadow: 'The Chameleon: Changing values depending on who is in the room.',
    ranks: [
      { min: 0, label: 'The Chameleon' },
      { min: 40, label: 'Testing' },
      { min: 70, label: 'Aligned' },
      { min: 90, label: 'Wholeness' }
    ]
  },
  {
    key: 'theVault',
    label: 'The Vault',
    domain: 'Boundaries',
    ideal: 'The discipline of silence. Treating vulnerability as sacred ground.',
    shadow: 'The Gossip Monger: Sharing private info to bond or feel in-the-know.',
    ranks: [
      { min: 0, label: 'Leak' },
      { min: 35, label: 'Gossip' },
      { min: 65, label: 'Keeper' },
      { min: 90, label: 'The Vault' }
    ]
  },
  {
    key: 'theFortress',
    label: 'The Fortress',
    domain: 'Boundaries',
    ideal: 'The ability to say "No" as a complete sentence.',
    shadow: 'The Doormat: Agreeing out of fear of rejection; deep resentment.',
    ranks: [
      { min: 0, label: 'Doormat' },
      { min: 30, label: 'Fencing' },
      { min: 60, label: 'Warden' },
      { min: 90, label: 'The Fortress' }
    ]
  },
  {
    key: 'vulnerability',
    label: 'Vulnerability',
    domain: 'Emotional Intelligence',
    ideal: 'Taking off the armor. Admitting fear and asking for help.',
    shadow: 'The Iron Wall: Using anger or shutdown to prevent hurt.',
    ranks: [
      { min: 0, label: 'Iron Wall' },
      { min: 30, label: 'Exposed' },
      { min: 60, label: 'Open' },
      { min: 90, label: 'Steel Strength' }
    ]
  },
  {
    key: 'grace',
    label: 'Grace',
    domain: 'Emotional Intelligence',
    ideal: 'Maintaining a posture of non-judgment for others and self.',
    shadow: 'The Judge: Scanning others for faults to feel superior.',
    ranks: [
      { min: 0, label: 'The Judge' },
      { min: 40, label: 'Kind' },
      { min: 70, label: 'Merciful' },
      { min: 90, label: 'Unconditional' }
    ]
  }
];
