
import { HealthQuest, HedisMeasure, HedisGap, BiometricRecord, Provider, Appointment, WellnessStrategyContent, AssessmentQuestion, PersonalityProfile, MoodLog, CaseFile, WellnessDimension } from '../types';

export const DEFAULT_CASE_FILE: CaseFile = {
  lastUpdated: new Date().toISOString(),
  dignity: {
    wallet: false, belt: false, stateId: false, socialSecurityCard: false,
    birthCertificate: false, cellPhone: false, seasonalClothing: false,
    hygieneKit: false, foodSource: 'None'
  },
  health: {
    hasPCP: false, hasDentist: false, needsGlasses: false,
    insuranceProvider: '', medicationAdherence: false
  },
  recovery: {
    hasSponsor: false, homeGroup: '', recoveryPathway: '',
    housingStatus: 'Homeless', isEnvironmentSafe: false
  },
  legal: {
    probationOfficer: '', hasWarrants: false, licenseStatus: 'None'
  },
  purpose: {
    employmentStatus: 'Unemployed', educationLevel: '', primaryStrength: ''
  }
};

export const HEDIS_QUESTS: HealthQuest[] = [
  { id: 'q1', title: 'Annual Wellness Visit', hedisCategory: 'AAP-Access', description: 'Complete your annual check-up.', frequency: 'Yearly', isComplete: false, xpReward: 500 },
  { id: 'q2', title: 'Flu Shot', hedisCategory: 'IMA-Immunization', description: 'Get your seasonal influenza vaccine.', frequency: 'Yearly', isComplete: true, xpReward: 200 },
  { id: 'q3', title: 'Dental Exam', hedisCategory: 'ADV-Dental', description: 'Visit dentist for cleaning.', frequency: 'Yearly', isComplete: false, xpReward: 300 },
  { id: 'q4', title: 'Depression Screening', hedisCategory: 'DEP-Screening', description: 'Complete PHQ-9 assessment.', frequency: 'Quarterly', isComplete: false, xpReward: 100 }
];

export const MOCK_HEDIS_MEASURES: HedisMeasure[] = [
  { id: 'm1', name: 'Antidepressant Med Mgmt', domain: 'Behavioral', currentRate: 65, goalRate: 75, financialImpact: 5000, gapCount: 12, trend: 'up' },
  { id: 'm2', name: 'Follow-Up After ED Visit', domain: 'Behavioral', currentRate: 45, goalRate: 60, financialImpact: 12000, gapCount: 8, trend: 'down' }
];

export const MOCK_HEDIS_GAPS: HedisGap[] = [
  { id: 'g1', patientName: 'John Doe', patientId: 'P1001', measureName: 'AMM-Acute', triggerEvent: 'New Rx', dueDate: '2023-12-01', status: 'Open' },
  { id: 'g2', patientName: 'Jane Smith', patientId: 'P1002', measureName: 'FUA-7Day', triggerEvent: 'ED Visit', dueDate: '2023-11-20', status: 'Open' }
];

export const MOCK_BIOMETRICS_HISTORY: BiometricRecord[] = [
  { id: 'b1', date: '2023-11-01', heightFt: 5, heightIn: 10, weightLbs: 180, systolicBP: 120, diastolicBP: 80, a1c: 5.5, cholesterol: 190, restingHeartRate: 72 },
  { id: 'b2', date: '2023-10-01', heightFt: 5, heightIn: 10, weightLbs: 185, systolicBP: 125, diastolicBP: 82, a1c: 5.6, cholesterol: 195, restingHeartRate: 75 }
];

export const MOCK_PROVIDERS: Provider[] = [
  { id: 'dr_smith', name: 'Dr. Smith', specialty: 'Primary Care', phone: '555-0123', lastVisit: '2023-10-15' },
  { id: 'dr_jones', name: 'Dr. Jones', specialty: 'Therapist', phone: '555-0456', lastVisit: '2023-11-01' }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'apt_1', providerId: 'dr_jones', date: 'Nov 15', time: '2:00 PM', type: 'Therapy Session', status: 'upcoming' },
  { id: 'apt_2', providerId: 'dr_smith', date: 'Oct 15', time: '10:00 AM', type: 'Check-up', status: 'completed' }
];

export const WELLNESS_STRATEGIES_DB: Record<string, Record<string, WellnessStrategyContent>> = {
  'Emotional': {
    'low': { rangeLabel: 'Critical', narrative: 'Your emotional tank is empty.', strategies: ['Deep Breathing', 'Call a friend'] },
    'mid': { rangeLabel: 'Stable', narrative: 'You are doing okay.', strategies: ['Journaling', 'Meditation'] },
    'high': { rangeLabel: 'Thriving', narrative: 'You are emotionally strong.', strategies: ['Mentoring others', 'Gratitude practice'] }
  },
  'Physical': { 
    low: { rangeLabel: 'Low', narrative: 'Body needs rest.', strategies: ['Sleep', 'Hydrate'] }, 
    mid: { rangeLabel: 'Mid', narrative: 'Doing alright.', strategies: ['Walk', 'Stretch'] }, 
    high: { rangeLabel: 'High', narrative: 'Peak condition.', strategies: ['Intense workout'] } 
  },
  'Social': { 
    low: { rangeLabel: 'Low', narrative: 'Feeling isolated.', strategies: ['Call sponsor', 'Go to meeting'] }, 
    mid: { rangeLabel: 'Mid', narrative: 'Connected.', strategies: ['Coffee with friend'] }, 
    high: { rangeLabel: 'High', narrative: 'Social butterfly.', strategies: ['Host dinner'] } 
  },
  'Spiritual': { low: { rangeLabel: 'Low', narrative: 'Disconnected.', strategies: ['Pray', 'Nature walk'] }, mid: { rangeLabel: 'Mid', narrative: 'Centered.', strategies: ['Meditate'] }, high: { rangeLabel: 'High', narrative: 'Enlightened.', strategies: ['Service'] } },
  // FIX: Fixed syntax error in narrative and added missing strategies array for 'mid' Financial wellness
  'Financial': { low: { rangeLabel: 'Low', narrative: 'Stressed.', strategies: ['Budget', 'Save'] }, mid: { rangeLabel: 'Mid', narrative: 'Manageable.', strategies: ['Review goals', 'Track spending'] }, high: { rangeLabel: 'High', narrative: 'Secure.', strategies: ['Invest'] } },
  'Occupational': { low: { rangeLabel: 'Low', narrative: 'Unfulfilled.', strategies: ['Update resume'] }, mid: { rangeLabel: 'Mid', narrative: 'Working.', strategies: ['Learn skill'] }, high: { rangeLabel: 'High', narrative: 'Thriving.', strategies: ['Mentor'] } },
  'Intellectual': { low: { rangeLabel: 'Low', narrative: 'Bored.', strategies: ['Read'] }, mid: { rangeLabel: 'Mid', narrative: 'Curious.', strategies: ['Puzzle'] }, high: { rangeLabel: 'High', narrative: 'Sharp.', strategies: ['Teach'] } },
  'Environmental': { low: { rangeLabel: 'Low', narrative: 'Chaotic.', strategies: ['Clean room'] }, mid: { rangeLabel: 'Mid', narrative: 'Organized.', strategies: ['Decorate'] }, high: { rangeLabel: 'High', narrative: 'Sanctuary.', strategies: ['Garden'] } },
};

export const WELLNESS_DIMENSION_QUESTIONS = [
  { dimension: "Emotional" as WellnessDimension, text: "I can cope with stress." },
  { dimension: "Physical" as WellnessDimension, text: "I exercise regularly." },
  { dimension: "Social" as WellnessDimension, text: "I have a support system." },
  { dimension: "Occupational" as WellnessDimension, text: "I find meaning in my work." },
  { dimension: "Financial" as WellnessDimension, text: "I feel secure financially." },
  { dimension: "Environmental" as WellnessDimension, text: "My home is safe." },
  { dimension: "Spiritual" as WellnessDimension, text: "I feel a sense of purpose." },
  { dimension: "Intellectual" as WellnessDimension, text: "I engage in learning." }
];

export const MOOD_HISTORY: MoodLog[] = [
  { date: 'Mon', mood: 'Okay', value: 3 },
  { date: 'Tue', mood: 'Strong', value: 4 },
  { date: 'Wed', mood: 'Struggling', value: 2 },
  { date: 'Thu', mood: 'Okay', value: 3 },
  { date: 'Fri', mood: 'Strong', value: 4 },
  { date: 'Sat', mood: 'Strong', value: 4 },
  { date: 'Sun', mood: 'Okay', value: 3 }
];

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  { id: 1, category: "Energy", text: "How do you recharge?", options: [{ text: "Alone", traitValue: "I" }, { text: "With people", traitValue: "E" }] },
  { id: 2, category: "Information", text: "How do you process info?", options: [{ text: "Facts", traitValue: "S" }, { text: "Concepts", traitValue: "N" }] },
  { id: 3, category: "Decisions", text: "How do you decide?", options: [{ text: "Logic", traitValue: "T" }, { text: "Values", traitValue: "F" }] },
  { id: 4, category: "Structure", text: "How do you organize?", options: [{ text: "Plan", traitValue: "J" }, { text: "Flow", traitValue: "P" }] }
];

export const PERSONALITY_ARCHETYPES: Record<string, any> = {
  "INTJ": { title: "The Architect", strengths: ["Strategy", "Logic"], riskAreas: ["Isolation", "Overthinking"] },
  // Default fallback if code not found
  "default": { title: "The Seeker", strengths: ["Resilience"], riskAreas: ["Uncertainty"] }
};
