import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";

// Lazy initialization to avoid crashing if key is missing
let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export const GeminiService = {
  async generateLegalAnswer(prompt: string, userQuestion: string, options: { thinking?: boolean, search?: boolean } = {}) {
    const ai = getGenAI();
    
    const model = options.thinking ? "gemini-3.1-pro-preview" : (options.search ? "gemini-3-flash-preview" : "gemini-3.1-flash-lite-preview");
    
    const config: any = {
      temperature: 0.1,
    };

    if (options.thinking) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    } else {
      config.maxOutputTokens = 1000;
    }

    if (options.search) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: "user", parts: [{ text: `${prompt}\n\nUSER QUESTION: """ ${userQuestion} """` }] }
      ],
      config
    });

    return response;
  },

  async generateSpeech(text: string, voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore') {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  },

  async transcribeAudio(audioBase64: string, mimeType: string = 'audio/wav') {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: audioBase64, mimeType } },
            { text: "Transcribe this legal query exactly as spoken. If it's in Hindi, transcribe in Hindi. If in English, transcribe in English." }
          ]
        }
      ]
    });

    return response.text;
  },

  getLiveSession(callbacks: any) {
    const ai = getGenAI();
    return ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-12-2025",
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: "You are NyayMitra, an Indian legal assistant. You are having a real-time voice conversation with a user who may be in distress. Be calm, empathetic, and provide accurate legal information in plain language. Keep responses concise for voice interaction.",
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
    });
  }
};
