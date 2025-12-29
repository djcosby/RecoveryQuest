
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PersonalityProfile, UserState, AIPathConfiguration, QuizQuestion, BookSkin, GeneratedQuiz, ClinicalConceptualization, AssessmentLogEntry, CaseFile, UserTask, ContentBlock } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'overdose on', 'end it all',
  'can’t go on', 'want to die', 'self-harm', 'cut myself'
];

const containsCrisisLanguage = (text: string): boolean => {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(k => lower.includes(k));
};

const BASE_SYSTEM_INSTRUCTION = `
You are a supportive, empathetic, and knowledgeable AI Sponsor for a recovery app called RecoveryQuest. 
Your role is to help the user ("The Architect") navigate their recovery journey. 

Tone & Style:
- Analytical yet Lyrical: Use metaphors (building, path, navigation).
- Trauma-Informed: Be sensitive to triggers, avoid shaming language.
- Strengths-Based: Focus on what the user CAN do.
- Concise: Text-message length responses.
`;

/**
 * Converts raw text into a structured curriculum block array for the lesson engine.
 */
export const generateCurriculumBlocks = async (rawText: string): Promise<ContentBlock[]> => {
  const prompt = `
    You are a Curriculum Architect for a Recovery App.
    Convert the following text into a JSON array of "ContentBlock" objects.
    
    Rules:
    1. Break text into logical 'markdown' blocks.
    2. Identify key concepts and create 'interaction' blocks (flash_card, multiple_choice, sentence_builder, fill_gap).
    3. Assign unique IDs (e.g., 'seg-1') and XP rewards.
    4. Provide clinical feedback for correct and incorrect answers.
    5. Return ONLY a valid JSON array.
    
    Input Text:
    "${rawText}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You only output raw JSON arrays of curriculum blocks. No markdown formatting in the output itself."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ContentBlock[];
    }
    return [];
  } catch (e) {
    console.error("AI Curriculum Generation Failed", e);
    return [];
  }
};

export const generatePathCustomization = async (
  userState: UserState, 
  personality: PersonalityProfile | null
): Promise<AIPathConfiguration | null> => {
  const context = {
    personality: personality ? `${personality.code} (${personality.title})` : "Unknown",
    strengths: personality?.strengths || [],
    riskAreas: personality?.riskAreas || [],
    baseline: userState.baseline ? {
      goal: userState.baseline.goals.primaryGoal,
      barrier: userState.baseline.goals.biggestBarrier,
      motivation: userState.baseline.goals.motivationLevel,
      substance: userState.baseline.history.primarySubstance
    } : "Not completed",
    wellnessScores: userState.wellnessScores || "Not completed",
    caseFileNeeds: userState.caseFile ? Object.entries(userState.caseFile.dignity).filter(([_, v]) => v === false).map(([k]) => k) : [],
    currentLevel: userState.level
  };

  const prompt = `
    You are the "Recovery Architect". Analyze the user's assessment data to fine-tune their path.
    USER DATA:
    ${JSON.stringify(context, null, 2)}
    Respond in JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.5,
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIPathConfiguration;
    }
    return null;
  } catch (e) {
    console.error("AI Path Customization Failed", e);
    return null;
  }
};

export const sendMessageToGemini = async (message: string, profile?: PersonalityProfile | null): Promise<string> => {
  if (containsCrisisLanguage(message)) {
    return "I’m really glad you said that out loud here. What you’re describing sounds like a crisis. Please use the SOS button or contact 988.";
  }

  let systemInstructionText = BASE_SYSTEM_INSTRUCTION;
  if (profile) {
    systemInstructionText += `\nUser Profile: ${profile.code} ("${profile.title}").`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: systemInstructionText,
        temperature: 0.7,
      }
    });
    return response.text || "I'm listening.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection issues. Let's take a breath.";
  }
};

export const generateTaskSuggestions = async (userState: UserState): Promise<Partial<UserTask>[]> => {
  const context = {
    wellness: userState.wellnessScores,
    caseFile: userState.caseFile,
    stage: userState.recoveryStage
  };
  const prompt = `Suggest 3 small tasks. Context: ${JSON.stringify(context)}. Return JSON only.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) { return []; }
};

export const generateEncouragingPhrase = async (userState: UserState, context: string): Promise<string> => {
  const prompt = `Generate a 1-sentence encouraging phrase. Level ${userState.level}. Event: ${context}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: "You are Leo the Guide. Under 15 words." }
    });
    return response.text || "Keep moving forward.";
  } catch (e) { return "Keep going."; }
};

export const validateContentSafety = async (content: string): Promise<{ safe: boolean; reason?: string }> => {
  if (containsCrisisLanguage(content)) return { safe: false, reason: "Please reach out to live help." };
  try {
    const prompt = `Analyze content safety for recovery community: "${content}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    if (response.text) return JSON.parse(response.text);
    return { safe: true };
  } catch (error) { return { safe: true }; }
};

export const analyzeTextWithSkin = async (text: string, skin: BookSkin): Promise<string> => {
  const prompt = `Analyze text as ${skin}: "${text.substring(0, 2000)}"`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "Could not analyze.";
  } catch (e) { return "Error."; }
};

export const generateQuizFromText = async (chapterId: string, text: string): Promise<GeneratedQuiz | null> => {
  const prompt = `Generate a 3-question quiz: "${text.substring(0, 2000)}"`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    if (response.text) {
      const data = JSON.parse(response.text);
      return { id: `quiz_${Date.now()}`, relatedChapterId: chapterId, questions: data.questions, xpReward: 50, completed: false };
    }
  } catch (e) { console.error(e); }
  return null;
};

export const generatePersonaResponse = async (message: string, persona: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction: `Respond as ${persona}.` }
    });
    return response.text || "...";
  } catch (e) { return "Error."; }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) { return null; }
};

export function decodeBase64ToBytes(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes;
}

export async function decodePCMData(data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000, numChannels: number = 1): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; }
  }
  return buffer;
}

export const generateUserConceptualization = async (history: AssessmentLogEntry[], caseFile: CaseFile | undefined): Promise<ClinicalConceptualization | null> => {
  const prompt = `Clinical conceptualization of history: ${JSON.stringify(history)}. Respond in JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    if (response.text) return { ...JSON.parse(response.text), lastUpdated: new Date().toISOString() };
  } catch (e) { console.error(e); }
  return null;
};
