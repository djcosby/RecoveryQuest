
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
  }
};

export const CURRICULUM_TREE: UnitData[] = [
  {
    id: 'unit_1',
    title: 'Unit 1: The Hijacked Brain',
    description: 'Understanding dopamine loops and neuroplasticity.',
    color: 'bg-indigo-600',
    requirements: { minXP: 0 },
    nodes: [
      { 
        id: '101', 
        type: 'lesson', 
        title: 'The Dopamine Slot Machine', 
        xpReward: 100, 
        description: 'How substances hack your reward system.', 
        status: 'unlocked',
        educationalContent: `
# The Dopamine Slot Machine

In your brain, dopamine is the currency of **anticipation**. It doesn't signal "pleasure" so much as "This is important! Do it again!"

When we use substances or engage in addictive behaviors, we flood the brain with a massive surge of dopamine—far more than nature intended. Over time, the brain tries to maintain balance by **downregulating**—shutting down receptors. 

This leads to:
* **Tolerance**: Needing more to feel "normal."
* **Anhedonia**: Inability to feel pleasure from normal things like a sunset or a good meal.

**Recovery is the process of letting these receptors grow back.**
        `,
        content: {
            description: "Learn the biology of why it feels so hard to stop.",
            maladaptiveBehaviors: ["Impulse acting", "Ignoring physical signals", "Chasing the first high"],
            microSkills: [{ title: "Delaying", description: "Wait 60 seconds when an urge hits. Let the logic brain catch up." }],
            selfCheck: {
                question: "How often do you feel a 'gray' mood (anhedonia)?",
                anchors: [
                    { score: 1, label: "Always", description: "Nothing feels good." },
                    { score: 5, label: "Rarely", description: "I enjoy simple things." }
                ]
            },
            quiz: [
                {
                    question: "What is 'Downregulation'?",
                    options: [
                        { id: 'a', text: "A mood disorder.", isCorrect: false, explanation: "No, downregulation is a biological process in the synapses." },
                        { id: 'b', text: "The brain shutting down receptors to protect itself from over-stimulation.", isCorrect: true, explanation: "Correct! This is why tolerance builds up." },
                        { id: 'c', text: "Feeling sad during the holidays.", isCorrect: false, explanation: "That is a common trigger, but not the biological term for receptor loss." }
                    ]
                }
            ],
            challengeLadder: [
                { difficulty: 'Easy', title: 'The 60-Second Pause', description: 'When you feel a craving for anything (coffee, sugar, phone), wait 60 seconds before acting.', xp: 50 }
            ]
        }
      },
      { 
        id: '102', 
        type: 'trait_module', 
        title: 'The HALT Signal', 
        xpReward: 100, 
        description: 'Vulnerability awareness.', 
        educationalContent: `
# HALT: Your Early Warning System

Recovery failure rarely happens in a vacuum. It usually happens when our baseline needs aren't met. We use the acronym **HALT** to check our engine lights:

*   **H**ungry: Low blood sugar equals low willpower.
*   **A**ngry: Resentment is the "luxury of normal people."
*   **L**onely: Addiction is a disease of isolation.
*   **T**ired: Exhaustion bypasses your logic.

Before making a big decision or giving in to an urge, HALT.
        `,
        content: {
            description: "Master the most famous acronym in recovery.",
            maladaptiveBehaviors: ["Skipping meals", "Isolating when sad", "Working until burnout"],
            microSkills: [{ title: "Self-Scanning", description: "Checking in with your body 3 times a day." }],
            selfCheck: {
                question: "Can you name your physical state right now?",
                anchors: [
                    { score: 1, label: "Numb", description: "I have no idea." },
                    { score: 5, label: "Connected", description: "I know exactly what I need." }
                ]
            },
            quiz: [
                {
                    question: "What does the 'A' in HALT stand for?",
                    options: [
                        { id: 'a', text: "Anxious", isCorrect: false, explanation: "Anxiety is important, but 'Angry' is the specific clinical check in HALT." },
                        { id: 'b', text: "Angry", isCorrect: true, explanation: "Correct! Anger and resentment are primary relapse triggers." },
                        { id: 'c', text: "Achey", isCorrect: false, explanation: "Physical pain is a trigger, but not what the A represents." }
                    ]
                }
            ],
            challengeLadder: [
                { difficulty: 'Medium', title: 'The HALT Log', description: 'Write down your HALT status every time you have a meal today.', xp: 75 }
            ]
        }
      },
      { 
        id: '104', 
        type: 'boss', 
        title: 'Boss: The Social Trap', 
        xpReward: 200, 
        description: 'Applying your skills.', 
        bossScenarioId: 104, 
        educationalContent: "Apply your refusal skills in a high-pressure social situation.", // Fixed: Added educationalContent
        prerequisites: ['101', '102'] 
      }
    ]
  },
  {
    id: 'unit_2',
    title: 'Unit 2: The Architecture of Choice',
    description: 'Executive function and refusal skills.',
    color: 'bg-emerald-600',
    requirements: { minXP: 500 },
    nodes: [
      { 
        id: '201', 
        type: 'lesson', 
        title: 'Broken Record Technique', 
        xpReward: 150, 
        description: 'How to say no without explaining.',
        educationalContent: `
# The Broken Record

When people push your boundaries, they are often looking for an "anchor point" for an argument. 

Example:
*   "Come on, just one!" 
*   "No thanks, I'm not drinking."
*   "Why not? You used to be the life of the party!"
*   "I understand, but I'm not drinking."

**The Rule**: Do not provide a reason. A reason is something they can argue with. "I'm not drinking" is a fact. Repeat it like a broken record.
        `,
        content: {
            description: "Learn to protect your boundaries with iron-clad refusal.",
            maladaptiveBehaviors: ["Over-explaining", "Apologizing for boundaries", "Giving in to avoid conflict"],
            microSkills: [{ title: "The Solid No", description: "Saying no without an attached 'sorry'." }],
            selfCheck: {
                question: "Do you feel the need to justify your sobriety to others?",
                anchors: [
                    { score: 1, label: "Always", description: "I make up excuses." },
                    { score: 5, label: "Never", description: "My 'No' is enough." }
                ]
            },
            quiz: [
                {
                    question: "Why should you avoid giving a 'reason' when refusing a drink?",
                    options: [
                        { id: 'a', text: "It's none of their business.", isCorrect: false, explanation: "True, but not the primary tactical reason." },
                        { id: 'b', text: "Reasons provide a 'hook' for the other person to argue against.", isCorrect: true, explanation: "Exactly. If you say 'I'm on meds,' they say 'Just skip them tonight!' No hook = no argument." },
                        { id: 'c', text: "It's rude to explain.", isCorrect: false, explanation: "Explaining isn't rude, but it's often counter-productive in high-pressure recovery moments." }
                    ]
                }
            ],
            challengeLadder: [
                { difficulty: 'Hard', title: 'The Boundary Test', description: 'Say no to one minor request today (e.g. extra work, a social outing) without giving a reason.', xp: 100 }
            ]
        }
      }
    ]
  }
];

export const COURSES: Course[] = [
  {
    id: 'hero',
    title: 'The Master Curriculum',
    description: 'The standard path of recovery science and practice.',
    icon: '🛡️',
    themeColor: 'amber',
    units: CURRICULUM_TREE
  }
];
