
export interface SimulationChallenge {
    id: string;
    stage: number;
    title: string;
    instruction: string;
    type: 'classification' | 'selection' | 'mapping';
    items: {
        id: string;
        text: string;
        isCorrect: boolean;
        category?: string;
        feedback: string;
    }[];
}

export const NAVIGATOR_SIMULATION: SimulationChallenge[] = [
    {
        id: 'early_warning',
        stage: 1,
        title: 'The Early Warning System',
        instruction: 'Identify the subtle "cues" that your recovery is at risk (Session 1).',
        type: 'selection',
        items: [
            { id: '1', text: 'Thinking you can control your use now', isCorrect: true, feedback: 'Correct: This is a dangerous shift in attitude.' },
            { id: '2', text: 'Not caring about recovery efforts', isCorrect: true, feedback: 'Correct: Apathy is a major early warning sign.' },
            { id: '3', text: 'Noticing unusual feelings of depression', isCorrect: true, feedback: 'Correct: Emotional shifts are internal sirens.' },
            { id: '4', text: 'Finding excuses to visit old hangouts', isCorrect: true, feedback: 'Correct: Behavioral shifts often precede relapse.' },
            { id: '5', text: 'Enjoying a new hobby', isCorrect: false, feedback: 'Incorrect: New enjoyments are part of a healthy recovery.' },
            { id: '6', text: 'Feeling tired after a long day', isCorrect: false, feedback: 'Incorrect: Normal tiredness is not a clinical warning, though HALT applies.' }
        ]
    },
    {
        id: 'personal_rights',
        stage: 2,
        title: 'The Rights of the Architect',
        instruction: 'Validate your inherent Personal Rights as a recovering person (Session 5).',
        type: 'classification',
        items: [
            { id: 'r1', text: 'I have the right to ask for what I want.', isCorrect: true, category: 'Right', feedback: 'Correct: You are allowed to state your needs.' },
            { id: 'r2', text: 'I have the right to say "No."', isCorrect: true, category: 'Right', feedback: 'Correct: No is a complete sentence.' },
            { id: 'r3', text: 'I have the right to change my mind.', isCorrect: true, category: 'Right', feedback: 'Correct: Growth involves re-evaluating decisions.' },
            { id: 'r4', text: 'I have the right to hold a different opinion.', isCorrect: true, category: 'Right', feedback: 'Correct: You do not need to agree to be accepted.' },
            { id: 'd1', text: 'I should say yes to keep the peace.', isCorrect: false, category: 'Distortion', feedback: 'Correct: This is a passive communication trap.' },
            { id: 'd2', text: 'I must explain every choice I make.', isCorrect: false, category: 'Distortion', feedback: 'Correct: You do not owe an elaborate justification for your boundaries.' }
        ]
    },
    {
        id: 'health_check',
        stage: 3,
        title: 'The Life-Support Inventory',
        instruction: 'Match the self-care habit to its recovery function (Session 7).',
        type: 'mapping',
        items: [
            { id: 'h1', text: 'Getting 8-9 hours of rest', isCorrect: true, category: 'Sleep', feedback: 'Crucial for cognitive judgment.' },
            { id: 'h2', text: 'Drinking 8 glasses of water', isCorrect: true, category: 'Nutrition', feedback: 'Hydration stabilizes mood.' },
            { id: 'h3', text: 'Walking 30 minutes, 3x a week', isCorrect: true, category: 'Exercise', feedback: 'Physical movement is a proven stress-buster.' },
            { id: 'h4', text: 'Playing "like a kid"', isCorrect: true, category: 'Relax', feedback: 'Pure enjoyment is a threat to the addiction cycle.' }
        ]
    }
];
