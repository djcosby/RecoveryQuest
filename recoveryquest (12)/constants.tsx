
// Re-export types if needed, or consumers can import from types directly.
// We'll keep this file as a central export point for data constants to avoid breaking imports in other files.

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
