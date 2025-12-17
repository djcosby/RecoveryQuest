
import { UnitData, Course, BossScenario } from '../types';

export const BOSS_SCENARIOS: Record<number, BossScenario> = {
  104: {
    id: 104,
    title: 'The Party Invitation',
    initialSceneId: 'start',
    scenes: {
      'start': {
        id: 'start',
        text: 'An old friend texts you: "Hey, big party tonight. Just like old times. You in?"',
        options: [
          { text: 'Go, but don\'t drink', outcome: 'risk', feedback: 'High risk environment. Can you handle it?', damage: 1, nextSceneId: 'party_arrival' },
          { text: 'Ignore the text', outcome: 'safe', feedback: 'Safe choice. You prioritized your peace.', xp: 50 },
          { text: 'Reply: "I\'m sober now, can\'t make it."', outcome: 'safe', feedback: 'Honesty and boundaries. Excellent.', xp: 75 }
        ]
      },
      'party_arrival': {
        id: 'party_arrival',
        text: 'You arrive. The music is loud, and someone hands you a drink immediately.',
        options: [
          { text: 'Take it to be polite', outcome: 'risk', feedback: 'Slippery slope. You relapsed.', damage: 3 },
          { text: 'Say "No thanks" and leave', outcome: 'neutral', feedback: 'Good recovery, but a close call.', xp: 25 }
        ]
      }
    }
  },
  105: {
    id: 105,
    title: 'The Bad Day',
    initialSceneId: 'start',
    scenes: {
      'start': {
        id: 'start',
        text: 'You had a terrible day at work. Your boss yelled at you in front of everyone. You feel humiliated and angry.',
        options: [
          { text: 'Call your sponsor immediately', outcome: 'safe', feedback: 'Excellent use of your support network.', xp: 100 },
          { text: 'Go home and isolate', outcome: 'risk', feedback: 'Isolation feeds the addiction.', damage: 1, nextSceneId: 'alone_home' },
          { text: 'Go for a run to blow off steam', outcome: 'safe', feedback: 'Healthy coping mechanism. Good job.', xp: 80 }
        ]
      },
      'alone_home': {
        id: 'alone_home',
        text: 'You are alone in your apartment. The silence is loud. The thought of using creeps in.',
        options: [
          { text: 'Just one drink to take the edge off', outcome: 'risk', feedback: 'Relapse. It starts with just one.', damage: 3 },
          { text: 'Put on a movie and distract yourself', outcome: 'neutral', feedback: 'You survived, but it was close.', xp: 20 },
          { text: 'Call a friend', outcome: 'safe', feedback: 'Breaking the isolation is key.', xp: 60 }
        ]
      }
    }
  },
  106: {
    id: 106,
    title: 'The Found Stash',
    initialSceneId: 'start',
    scenes: {
      'start': {
        id: 'start',
        text: 'While cleaning an old jacket, you find a small baggie you thought you lost months ago.',
        options: [
          { text: 'Flush it immediately', outcome: 'safe', feedback: 'Decisive action. Well done.', xp: 150 },
          { text: 'Stare at it and remember the "good times"', outcome: 'risk', feedback: 'Romancing the drug is dangerous.', damage: 1, nextSceneId: 'temptation' },
          { text: 'Keep it "just in case"', outcome: 'risk', feedback: 'Reservation. This is a setup for relapse.', damage: 2 }
        ]
      },
      'temptation': {
        id: 'temptation',
        text: 'The memories are strong. Your heart is racing. No one would know.',
        options: [
          { text: 'Use it', outcome: 'risk', feedback: 'Relapse.', damage: 3 },
          { text: 'Call someone and tell on yourself', outcome: 'safe', feedback: 'Secrets keep us sick. Telling someone breaks the power.', xp: 100 }
        ]
      }
    }
  }
};

export const CURRICULUM_TREE: UnitData[] = [
  {
    id: 'unit_1',
    title: 'Unit 1: Stabilization',
    description: 'Building the foundation.',
    color: 'bg-indigo-600',
    requirements: { minXP: 0 },
    nodes: [
      { 
        id: '101', 
        type: 'lesson', 
        title: 'The First Step', 
        xpReward: 50, 
        description: 'Admitting powerlessness.', 
        position: {x: 0, y: 0}, 
        status: 'unlocked',
        content: {
            description: "We admitted we were powerless over our addiction - that our lives had become unmanageable.",
            maladaptiveBehaviors: ["Denial", "Rationalization", "Blaming others"],
            microSkills: [{ title: "Honesty", description: "Telling the truth to yourself and others." }],
            selfCheck: {
                question: "How honest have you been with yourself lately?",
                anchors: [
                    { score: 1, label: "Total Denial", description: "I have no problem." },
                    { score: 5, label: "Radical Honesty", description: "I see things clearly." }
                ]
            },
            challengeLadder: [
                { difficulty: 'Easy', title: 'Journal for 5 mins', description: 'Write about powerlessness.', xp: 20 }
            ]
        }
      },
      { id: '102', type: 'activity', title: 'Identify Triggers', xpReward: 50, description: 'Know your enemy.', position: {x: 0, y: 0}, status: 'locked' },
      { id: '103', type: 'trait_module', title: 'Boundaries 101', xpReward: 100, description: 'Protect your peace.', position: {x: 0, y: 0}, status: 'locked' },
      { id: '104', type: 'boss', title: 'The Party', xpReward: 200, description: 'Test your resolve.', bossScenarioId: 104, position: {x: 0, y: 0}, status: 'locked', prerequisites: ['101', '102'] }
    ]
  },
  {
    id: 'unit_2',
    title: 'Unit 2: Action',
    description: 'Moving into the solution.',
    color: 'bg-emerald-600',
    requirements: { minXP: 500 },
    nodes: [
      { id: '201', type: 'lesson', title: 'Asking for Help', xpReward: 75, description: 'Surrender your ego.', position: {x: 0, y: 0}, status: 'locked', prerequisites: ['104'] },
      { id: '202', type: 'activity', title: 'Build Your Network', xpReward: 75, description: 'Connect with peers.', position: {x: 0, y: 0}, status: 'locked', prerequisites: ['201'] },
      { id: '203', type: 'boss', title: 'The Bad Day', xpReward: 250, description: 'Handle stress without using.', bossScenarioId: 105, position: {x: 0, y: 0}, status: 'locked', prerequisites: ['202'] }
    ]
  },
  {
    id: 'unit_3',
    title: 'Unit 3: Maintenance',
    description: 'Living life on life\'s terms.',
    color: 'bg-purple-600',
    requirements: { minXP: 1200 },
    nodes: [
      { id: '301', type: 'lesson', title: 'Emotional Sobriety', xpReward: 100, description: 'Balance your feelings.', position: {x: 0, y: 0}, status: 'locked', prerequisites: ['203'] },
      { id: '302', type: 'boss', title: 'The Found Stash', xpReward: 300, description: 'Integrity test.', bossScenarioId: 106, position: {x: 0, y: 0}, status: 'locked', prerequisites: ['301'] }
    ]
  }
];

export const COURSES: Course[] = [
  {
    id: 'hero',
    title: 'The Hero\'s Journey',
    description: 'Classic recovery path.',
    icon: '🛡️',
    themeColor: 'amber',
    units: CURRICULUM_TREE
  },
  {
    id: 'stoic',
    title: 'The Stoic Path',
    description: 'Logic and resilience.',
    icon: '🏛️',
    themeColor: 'slate',
    units: CURRICULUM_TREE 
  },
  {
    id: '12_step',
    title: '12-Step Path',
    description: 'Spiritual foundation.',
    icon: '🙏',
    themeColor: 'indigo',
    units: CURRICULUM_TREE
  },
  {
    id: 'smart',
    title: 'SMART Recovery',
    description: 'Self-Management.',
    icon: '🧠',
    themeColor: 'cyan',
    units: CURRICULUM_TREE
  },
  {
    id: 'refuge',
    title: 'Refuge Path',
    description: 'Mindfulness based.',
    icon: '🧘',
    themeColor: 'rose',
    units: CURRICULUM_TREE
  }
];
