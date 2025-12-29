
import { AssessmentDefinition } from '../types';

export const ASSESSMENTS_REGISTRY: Record<string, AssessmentDefinition> = {
  'PHQ_9': {
    id: "PHQ_9",
    title: "PHQ-9",
    type: "clinical",
    description: "Screening for depression severity.",
    xpReward: 100,
    questions: [
      { id: 1, category: "Mood", text: "Little interest or pleasure in doing things?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 2, category: "Mood", text: "Feeling down, depressed, or hopeless?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 3, category: "Sleep", text: "Trouble falling or staying asleep, or sleeping too much?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 4, category: "Energy", text: "Feeling tired or having little energy?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 5, category: "Appetite", text: "Poor appetite or overeating?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 6, category: "Self-Worth", text: "Feeling bad about yourself or that you are a failure?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 7, category: "Focus", text: "Trouble concentrating on things?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 8, category: "Movement", text: "Moving or speaking slowly, or fidgety/restless?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 9, category: "Safety", text: "Thoughts that you would be better off dead or of hurting yourself?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] }
    ],
    scoringLogic: [
        { minScore: 0, maxScore: 4, resultLabel: "None/Minimal", resultDescription: "Few depressive symptoms." },
        { minScore: 5, maxScore: 9, resultLabel: "Mild", resultDescription: "Mild depressive symptoms." },
        { minScore: 10, maxScore: 14, resultLabel: "Moderate", resultDescription: "Moderate depressive symptoms." },
        { minScore: 15, maxScore: 19, resultLabel: "Moderately Severe", resultDescription: "Significant symptoms present." },
        { minScore: 20, maxScore: 27, resultLabel: "Severe", resultDescription: "Severe depressive symptoms." }
    ]
  },
  'GAD_7': {
    id: "GAD_7",
    title: "GAD-7",
    type: "clinical",
    description: "Screening for anxiety.",
    xpReward: 100,
    questions: [
      { id: 1, category: "Anxiety", text: "Feeling nervous, anxious, or on edge?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 2, category: "Worry", text: "Not being able to stop or control worrying?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 3, category: "Worry", text: "Worrying too much about different things?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 4, category: "Relaxation", text: "Trouble relaxing?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 5, category: "Restlessness", text: "Being so restless that it is hard to sit still?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 6, category: "Irritability", text: "Becoming easily annoyed or irritable?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] },
      { id: 7, category: "Fear", text: "Feeling afraid as if something awful might happen?", options: [{text: "Not at all", scoreValue: 0}, {text: "Several days", scoreValue: 1}, {text: "More than half", scoreValue: 2}, {text: "Nearly every day", scoreValue: 3}] }
    ],
    scoringLogic: [
        { minScore: 0, maxScore: 4, resultLabel: "None/Minimal", resultDescription: "Minimal anxiety." },
        { minScore: 5, maxScore: 9, resultLabel: "Mild", resultDescription: "Mild anxiety." },
        { minScore: 10, maxScore: 14, resultLabel: "Moderate", resultDescription: "Moderate anxiety." },
        { minScore: 15, maxScore: 21, resultLabel: "Severe", resultDescription: "Severe anxiety." }
    ]
  },
  'AUDIT_C': {
    id: "AUDIT_C",
    title: "AUDIT-C",
    type: "clinical",
    description: "Alcohol consumption screening.",
    xpReward: 50,
    questions: [
      { id: 1, category: "Frequency", text: "How often do you have a drink containing alcohol?", options: [{text: "Never", scoreValue: 0}, {text: "Monthly or less", scoreValue: 1}, {text: "2-4 times a month", scoreValue: 2}, {text: "2-3 times a week", scoreValue: 3}, {text: "4+ times a week", scoreValue: 4}] },
      { id: 2, category: "Quantity", text: "How many standard drinks do you have on a typical day when you are drinking?", options: [{text: "1 or 2", scoreValue: 0}, {text: "3 or 4", scoreValue: 1}, {text: "5 or 6", scoreValue: 2}, {text: "7 to 9", scoreValue: 3}, {text: "10 or more", scoreValue: 4}] },
      { id: 3, category: "Binge", text: "How often do you have 6 or more drinks on one occasion?", options: [{text: "Never", scoreValue: 0}, {text: "Less than monthly", scoreValue: 1}, {text: "Monthly", scoreValue: 2}, {text: "Weekly", scoreValue: 3}, {text: "Daily or almost daily", scoreValue: 4}] }
    ],
    scoringLogic: [
        { minScore: 0, maxScore: 3, resultLabel: "Low Risk", resultDescription: "Drinking is within low-risk limits." },
        { minScore: 4, maxScore: 12, resultLabel: "High Risk", resultDescription: "Drinking pattern suggests high risk." }
    ]
  },
  'DAST_10': {
    id: "DAST_10",
    title: "DAST-10",
    type: "clinical",
    description: "Drug abuse screening test.",
    xpReward: 100,
    questions: [
      { id: 1, category: "Use", text: "Have you used drugs other than those required for medical reasons?", options: [{text: "No", scoreValue: 0}, {text: "Yes", scoreValue: 1}] },
      { id: 2, category: "Abuse", text: "Do you abuse more than one drug at a time?", options: [{text: "No", scoreValue: 0}, {text: "Yes", scoreValue: 1}] },
      { id: 3, category: "Withdrawal", text: "Have you had withdrawal symptoms when you stopped taking drugs?", options: [{text: "No", scoreValue: 0}, {text: "Yes", scoreValue: 1}] },
      { id: 4, category: "Social", text: "Have you neglected your family because of your use of drugs?", options: [{text: "No", scoreValue: 0}, {text: "Yes", scoreValue: 1}] },
      { id: 5, category: "Legal", text: "Have you engaged in illegal activities in order to obtain drugs?", options: [{text: "No", scoreValue: 0}, {text: "Yes", scoreValue: 1}] }
    ],
    scoringLogic: [
        { minScore: 0, maxScore: 0, resultLabel: "No Problem", resultDescription: "No evidence of drug abuse." },
        { minScore: 1, maxScore: 2, resultLabel: "Low", resultDescription: "Low level of problems." },
        { minScore: 3, maxScore: 5, resultLabel: "Moderate", resultDescription: "Moderate level of problems." },
        { minScore: 6, maxScore: 10, resultLabel: "Substantial", resultDescription: "Substantial level of problems." }
    ]
  },
  'BRAVING_MATRIX': {
    id: 'BRAVING_MATRIX',
    title: 'Recovery Competency Matrix',
    type: 'personality', 
    description: 'A self-assessment to identify which of the 7 Key Recovery Domains you need to focus on right now.',
    xpReward: 150,
    questions: [
      { id: 1, category: 'Boundaries', text: 'Do you feel guilty when you say "no" to someone?', options: [{ text: 'Often', scoreValue: 1 }, { text: 'Sometimes', scoreValue: 3 }, { text: 'Rarely', scoreValue: 5 }] },
      { id: 2, category: 'Boundaries', text: 'Do you feel overwhelmed by other people\'s problems?', options: [{ text: 'Yes, I take them on.', scoreValue: 1 }, { text: 'I listen, but stay separate.', scoreValue: 5 }] },
      { id: 3, category: 'Reliability', text: 'Are you on time for appointments and meetings?', options: [{ text: 'Rarely', scoreValue: 1 }, { text: 'Mostly', scoreValue: 3 }, { text: 'Always', scoreValue: 5 }] },
      { id: 4, category: 'Reliability', text: 'Do you finish projects or tasks you start?', options: [{ text: 'I often struggle to finish.', scoreValue: 1 }, { text: 'I follow through.', scoreValue: 5 }] },
      { id: 5, category: 'Accountability', text: 'When things go wrong, do you look for who is to blame?', options: [{ text: 'Yes, it is usually others.', scoreValue: 1 }, { text: 'I look at my own role.', scoreValue: 5 }] },
      { id: 6, category: 'Accountability', text: 'How do you react to feedback?', options: [{ text: 'Defensively / Angry', scoreValue: 1 }, { text: 'I listen and learn.', scoreValue: 5 }] },
      { id: 7, category: 'Confidentiality', text: 'Do you engage in gossip or share others\' secrets?', options: [{ text: 'Frequently', scoreValue: 1 }, { text: 'Sometimes, to bond.', scoreValue: 2 }, { text: 'Never. I am a vault.', scoreValue: 5 }] },
      { id: 8, category: 'Integrity', text: 'Do your actions match your values, even when no one is watching?', options: [{ text: 'Not always', scoreValue: 1 }, { text: 'I try my best.', scoreValue: 3 }, { text: 'Yes.', scoreValue: 5 }] },
      { id: 9, category: 'Non-Judgment', text: 'Do you listen to understand, or listen to reply/judge?', options: [{ text: 'Listen to reply/judge', scoreValue: 1 }, { text: 'Listen to understand', scoreValue: 5 }] }
    ],
    scoringLogic: [
        { minScore: 0, maxScore: 6, resultLabel: 'Focus: Boundaries', resultDescription: 'Your fortress needs reinforcing. Prioritize the Boundaries module.', recommendedNodeIds: ['br_101'] },
        { minScore: 0, maxScore: 6, resultLabel: 'Focus: Reliability', resultDescription: 'Building trust starts with your word. Prioritize the Reliability module.', recommendedNodeIds: ['br_201'] },
        { minScore: 0, maxScore: 6, resultLabel: 'Focus: Accountability', resultDescription: 'Owning your story is your power. Prioritize the Accountability module.', recommendedNodeIds: ['br_301'] }
    ]
  }
};
