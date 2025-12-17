
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PersonalityProfile, UserState, AIPathConfiguration, QuizQuestion, BookSkin, GeneratedQuiz, ClinicalConceptualization, AssessmentLogEntry, CaseFile } from "../types";

// 🔹 Centralize AI config
const AI_CONFIG = {
  apiKey: process.env.API_KEY,
  temperature: 0.7,
  maxOutputTokens: 200,
};

const ai = new GoogleGenAI({ apiKey: AI_CONFIG.apiKey || '' });

// 🔹 Light-weight local screen so we don’t rely on the model
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

Guidelines:
- Validate their feelings but encourage healthy coping mechanisms.
- If they mention a crisis (self-harm, overdose, immediate relapse risk), gently suggest immediate professional help and remind them of the SOS button.
- Do not be overly clinical; use the language of recovery (one day at a time, boundaries, tools).
`;

/**
 * Analyzes the user's entire profile data (Baseline, Personality, Case File, Wellness)
 * to generate a personalized path configuration.
 */
export const generatePathCustomization = async (
  userState: UserState, 
  personality: PersonalityProfile | null
): Promise<AIPathConfiguration | null> => {
  
  if (!AI_CONFIG.apiKey) {
    console.warn("No API Key for Path Customization");
    return null;
  }

  // Construct the context payload
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

    TASK:
    1. Identify the biggest area of need based on wellness scores (low scores) and case file gaps.
    2. Create a "Custom Daily Quest" that addresses their specific barrier or risk area.
    3. Select 3 existing Node IDs (from standard curriculum) that should be prioritized/highlighted.
       (Standard IDs like: 101, 102, 103, 201, 202, 301, 302, conf_101, bound_101).
    4. Write a short, motivating message explaining this focus.

    Respond in JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            architectMessage: { type: Type.STRING, description: "A 2-sentence insight explaining why you chose this focus." },
            focusArea: { type: Type.STRING, description: "One word theme (e.g. 'Stability', 'Connection', 'Dignity')." },
            recommendedNodeIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of node IDs to highlight (e.g. ['102', 'conf_101'])."
            },
            customDailyQuest: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                xp: { type: Type.NUMBER }
              },
              required: ["title", "description", "xp"]
            },
            suggestedTools: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["architectMessage", "focusArea", "recommendedNodeIds", "customDailyQuest"]
        }
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
  // 🔹 Local crisis detection as a pre-filter
  if (containsCrisisLanguage(message)) {
    return (
      "I’m really glad you said that out loud here. What you’re describing sounds like a crisis.\n\n" +
      "• If you are in immediate danger, call 911 or your local emergency number.\n" +
      "• You can also use the SOS button in the app to reach live support.\n" +
      "• In the U.S., you can dial or text 988 for the Suicide & Crisis Lifeline.\n\n" +
      "You do not have to go through this alone. Reaching out is not a burden—it’s a safety plan."
    );
  }

  if (!AI_CONFIG.apiKey) {
    return "I'm listening, but I can't access the network right now. (API Key missing)";
  }

  let systemInstructionText = BASE_SYSTEM_INSTRUCTION;

  if (profile) {
    systemInstructionText += `
    CRITICAL: The user has completed a personality assessment. 
    User Profile: ${profile.code} ("${profile.title}").
    Traits: ${JSON.stringify(profile.traits)}.
    Known Risk Areas: ${profile.riskAreas.join(", ")}.
    
    Tailor your advice to their personality. 
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstructionText,
        temperature: AI_CONFIG.temperature,
        maxOutputTokens: AI_CONFIG.maxOutputTokens,
      }
    });

    return response.text || "I'm listening, but I can't find the words right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the network right now. Let's take a breath and try again in a moment.";
  }
};

export const validateContentSafety = async (content: string): Promise<{ safe: boolean; reason?: string }> => {
  // Local crisis check first
  if (containsCrisisLanguage(content)) {
    return {
      safe: false,
      reason: "This post sounds like you might be in crisis. Please reach out to live help instead of posting this to the feed.",
    };
  }

  if (!AI_CONFIG.apiKey) return { safe: true }; 

  try {
    const prompt = `Analyze the following social media post for a recovery community app. 
      Content: "${content}"
      
      Check for:
      1. Relapse intent or glorification of use.
      2. Despair/Suicide risk.
      3. Aggression/Bullying.
      4. Drug seeking behavior.
      `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
          },
          required: ["safe"],
        },
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    return { safe: true };
  } catch (error) {
    console.error("Safety Check Error:", error);
    return { safe: true }; 
  }
};

// --- NEW LIBRARY AI FUNCTIONS ---

export const analyzeTextWithSkin = async (text: string, skin: BookSkin): Promise<string> => {
  if (!AI_CONFIG.apiKey) {
    // Fallback if no API key
    return `[AI Unavailable] Analyzing text as ${skin}... Content focus: ${text.substring(0, 50)}...`;
  }

  let personaInstruction = "";
  switch (skin) {
    case 'gamer':
      personaInstruction = "You are a hardcore gamer explaining this text as if it were game mechanics, loot, or lore. Use terms like 'XP', 'Grind', 'Boss Fight', 'NPC'.";
      break;
    case 'street':
      personaInstruction = "You are a street-smart mentor who keeps it real. Use straightforward, no-nonsense language. Focus on survival and loyalty.";
      break;
    case 'mystic':
      personaInstruction = "You are a spiritual mystic. Interpret the text through the lens of energy, vibration, alignment, and the universe.";
      break;
    case 'scholar':
      personaInstruction = "You are an academic professor. Analyze the text's rhetoric, structure, and historical context. Use formal language.";
      break;
    default:
      personaInstruction = "You are a supportive study partner. Summarize the key points clearly.";
  }

  const prompt = `
    Analyze the following text based on your persona.
    TEXT: "${text.substring(0, 3000)}"
    
    Output a short, engaging summary or insight (max 100 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: personaInstruction,
        maxOutputTokens: 200,
      }
    });
    return response.text || "Could not analyze.";
  } catch (e) {
    console.error(e);
    return "Error connecting to AI.";
  }
};

export const generateQuizFromText = async (chapterId: string, text: string): Promise<GeneratedQuiz | null> => {
  if (!AI_CONFIG.apiKey) return null;

  const prompt = `Generate a 3-question multiple choice quiz based on this text to test comprehension.
  Text: "${text.substring(0, 2000)}"
  
  Return JSON with fields: questions (array of {text, options[], correctIndex, explanation}).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ['text', 'options', 'correctIndex', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });
    
    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: `quiz_${Date.now()}`,
        relatedChapterId: chapterId,
        questions: data.questions,
        xpReward: 50,
        completed: false
      };
    }
  } catch (e) { console.error(e); }
  return null;
};

// --- NEW PRACTICE ARENA AI FUNCTIONS ---

export type PersonaType = 'supportive' | 'indifferent' | 'toxic' | 'factual';

export const generatePersonaResponse = async (
  message: string, 
  persona: PersonaType
): Promise<string> => {
  if (!AI_CONFIG.apiKey) return "AI Offline";

  let systemPrompt = "";
  
  switch(persona) {
    case 'supportive':
      systemPrompt = "You are a loving, empathetic, and patient Recovery Sponsor. You care deeply about the user. Validate their feelings and offer hope.";
      break;
    case 'indifferent':
      systemPrompt = "You are a busy stranger at a bus stop. You don't really care. You are dismissive, brief, and aloof. You aren't mean, you just have no emotional investment.";
      break;
    case 'toxic':
      systemPrompt = "You are a 'drinking buddy' who doesn't want the user to recover. You minimize their problems and suggest unhealthy behaviors (without violating safety policies).";
      break;
    case 'factual':
      systemPrompt = "You are a neuroscientist. Explain the biological/chemical reaction happening in the user's brain regarding this situation. Be clinical and emotionless.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 100, // Keep it punchy
        temperature: 0.8
      }
    });
    return response.text || "...";
  } catch (e) {
    console.error(e);
    return "Connection error.";
  }
};

// --- TEXT-TO-SPEECH FUNCTIONS ---

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!AI_CONFIG.apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export function decodeBase64ToBytes(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodePCMData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- CLINICAL CONCEPTUALIZATION ---

export const generateUserConceptualization = async (
  history: AssessmentLogEntry[], 
  caseFile: CaseFile | undefined
): Promise<ClinicalConceptualization | null> => {
  if (!AI_CONFIG.apiKey) return null;

  // Prepare simple summary of history
  const historySummary = history.map(h => 
    `${h.date.split('T')[0]}: ${h.assessmentTitle} Score ${h.score} (${h.resultLabel})`
  ).join('\n');

  const caseSummary = caseFile ? `
    Stability: ${caseFile.recovery.housingStatus}, 
    Safety: ${caseFile.recovery.isEnvironmentSafe ? 'Safe' : 'Unsafe'}, 
    Support: ${caseFile.recovery.hasSponsor ? 'Has Sponsor' : 'No Sponsor'}
  ` : 'No Case File';

  const prompt = `
    You are a Clinical Director reviewing a client's chart.
    Analyze the following assessment history and case file data to generate a "Clinical Conceptualization".
    
    ASSESSMENT HISTORY:
    ${historySummary}

    CASE FILE:
    ${caseSummary}

    TASK:
    1. Identify trends (e.g. "Anxiety increasing", "Stable").
    2. Correlate data (e.g. "Housing instability may be driving anxiety").
    3. Generate a JSON profile.

    Output JSON ONLY with this schema:
    {
      "summary": "2-3 sentences synthesizing their current clinical status.",
      "strengths": ["List 3 key strengths or protective factors"],
      "riskFactors": ["List 3 key risks or barriers"],
      "recommendedFocus": "One specific clinical focus area (e.g. 'Distress Tolerance', 'Housing First')"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedFocus: { type: Type.STRING }
          },
          required: ["summary", "strengths", "riskFactors", "recommendedFocus"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        ...data,
        lastUpdated: new Date().toISOString()
      };
    }
  } catch (e) {
    console.error("Clinical Conceptualization Failed", e);
  }
  return null;
};
