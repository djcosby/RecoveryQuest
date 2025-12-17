
import { EmotionDef } from '../types';

export const FEELINGS_DB: EmotionDef[] = [
  { 
    id: 'resentment', 
    name: 'Resentment', 
    parent: 'Mad', 
    definition: 'Bitter indignation at having been treated unfairly.', 
    scenario: 'You feel like you do all the work and nobody notices.' 
  },
  { 
    id: 'frustration', 
    name: 'Frustration', 
    parent: 'Mad', 
    definition: 'The feeling of being upset or annoyed, especially because of inability to change or achieve something.', 
    scenario: 'You are stuck in traffic on the way to a meeting.' 
  },
  { 
    id: 'loneliness', 
    name: 'Loneliness', 
    parent: 'Sad', 
    definition: 'Sadness because one has no friends or company.', 
    scenario: 'You are surrounded by people but feel like nobody knows the real you.' 
  },
  { 
    id: 'grief', 
    name: 'Grief', 
    parent: 'Sad', 
    definition: 'Deep sorrow, especially that caused by someone\'s death or a major loss.', 
    scenario: 'You are thinking about the years you lost to addiction.' 
  },
  { 
    id: 'anxiety', 
    name: 'Anxiety', 
    parent: 'Fear', 
    definition: 'A feeling of worry, nervousness, or unease about an imminent event or something with an uncertain outcome.', 
    scenario: 'You have a job interview tomorrow.' 
  },
  { 
    id: 'serenity', 
    name: 'Serenity', 
    parent: 'Glad', 
    definition: 'The state of being calm, peaceful, and untroubled.', 
    scenario: 'You wake up without a hangover and drink coffee in peace.' 
  },
  { 
    id: 'overwhelmed', 
    name: 'Overwhelmed', 
    parent: 'Fear', 
    definition: 'Buried or drowned beneath a huge mass of pressure.', 
    scenario: 'You have 5 past-due bills and your boss just emailed you.' 
  },
  { 
    id: 'guilt', 
    name: 'Guilt', 
    parent: 'Shame', 
    definition: 'Feeling bad about something you DID.', 
    scenario: 'You canceled plans with a friend to stay home and isolate.' 
  },
  { 
    id: 'shame', 
    name: 'Shame', 
    parent: 'Shame', 
    definition: 'Feeling bad about who you ARE.', 
    scenario: 'You make a small mistake and tell yourself "I am a failure".' 
  },
  { 
    id: 'hopeful', 
    name: 'Hopeful', 
    parent: 'Glad', 
    definition: 'Feeling excitement about a future possibility.', 
    scenario: 'You just applied for a job you really want.' 
  },
  { 
    id: 'boredom', 
    name: 'Boredom', 
    parent: 'Sad', 
    definition: 'Feeling weary and restless through lack of interest.', 
    scenario: 'It is Friday night, you are sober, and have nothing to do.' 
  },
];
