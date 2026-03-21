import { GeminiService } from './geminiService';

const SYSTEM_PROMPT = `
You are NyayMitra, an Indian legal information assistant. You provide
plain-language information about Indian law to citizens who may be
illiterate, uneducated, or in distress.

STRICT RULES — never violate these:
1. Respond ONLY in the requested language.
2. Keep your answer to EXACTLY 4 sentences or fewer. No exceptions.
3. ALWAYS cite the exact Indian law. Format: '[Act Name Year, Section N]'
4. END with one concrete action the person can take TODAY, starting with
 the word 'Action:'
5. Use ONLY the legal context provided. Do not use general knowledge.
6. If the context does not answer the question, say:
 'Mujhe is sawaal ka sahi jawab nahi pata. Kripya ek vakeel se milein.'
7. NEVER say 'you must', 'you should', 'I advise'. Say 'ek option hai'.
8. NEVER speculate. NEVER invent citations.
9. If the question involves arrest, FIR, criminal charges, or domestic
 violence, say: 'Yeh serious mamla hai. Turant ek vakeel se baat karein.'
 Do NOT give detailed legal guidance on these topics.
`;

export const api = {
  async ask(data: { 
    input: { type: 'text' | 'voice', text?: string, audio_url?: string },
    context: { persona: string, state: string, session_id?: string },
    options?: { thinking?: boolean, search?: boolean }
  }) {
    const startTime = Date.now();
    const language = 'hi'; // Default to Hindi
    const inputText = data.input.text || "Voice input";
    
    let prompt = `${SYSTEM_PROMPT}\nLANGUAGE: ${language}\nUSER PERSONA: ${data.context.persona}\nUSER STATE: ${data.context.state}`;
    
    if (data.options?.search) {
      prompt += "\nNOTE: You have access to Google Search. Use it to find the most recent and accurate legal information, acts, and sections. You are NOT restricted to internal knowledge for this query.";
    }

    try {
      const response = await GeminiService.generateLegalAnswer(prompt, inputText, data.options);
      const answerText = response.text;
      const latency = Date.now() - startTime;

      // Post-generation guardrails
      const sentences = answerText?.split(/[.।!?]+/).filter(Boolean) || [];
      // Allow more sentences for search queries
      const maxSentences = data.options?.search ? 8 : 4;
      const truncatedText = sentences.slice(0, maxSentences).join('. ') + '.';
      
      const disclaimer = "Yeh kanoni jaankari hai, kanoni salah nahi. Apne vakeel se salah karein.";
      
      // Extract citation (regex)
      const citationMatch = answerText?.match(/\[(.*?)\]/);
      const citationStr = citationMatch ? citationMatch[1] : "Unknown Act";
      
      // Extract action step
      const actionMatch = answerText?.match(/Action:(.*)/i);
      const actionStep = actionMatch ? actionMatch[1].trim() : "Consult a legal aid center.";

      // Extract grounding chunks
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks.map((chunk: any) => ({
        title: chunk.web?.title || "Legal Source",
        uri: chunk.web?.uri || "#"
      })).filter((s: any) => s.uri !== "#");

      return {
        data: {
          query_id: Math.random().toString(36).substring(7),
          answer: {
            text: truncatedText,
            citation: {
              act: citationStr,
              section: "",
              verified: false,
            },
            action_step: actionStep,
            audio_url: null,
            sources: sources.length > 0 ? sources : null
          },
          disclaimer,
          latency_ms: latency,
        }
      };
    } catch (error) {
      console.error("Ask error:", error);
      throw error;
    }
  },

  async checkMisinfo(data: { claim: string, language: string, state?: string }) {
    const startTime = Date.now();
    const prompt = `
      You are a legal fact-checker for Indian law.
      Extract the legal claim from the user message and validate it.
      Respond in JSON ONLY:
      {
        "verdict": "TRUE|FALSE|DEPENDS_ON_STATE",
        "explanation": "[2 sentences max in ${data.language}]",
        "citation": "[Act Name Year, Section N]"
      }
      
      USER CLAIM: """ ${data.claim} """
      USER STATE: ${data.state || 'Not specified'}
    `;
    
    try {
      const response = await GeminiService.generateLegalAnswer(prompt, "");
      const responseText = response.text;
      const latency = Date.now() - startTime;
      
      // Parse JSON response
      let result;
      try {
        const jsonMatch = responseText?.match(/\{.*\}/s);
        result = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
      } catch (e) {
        result = { verdict: "INSUFFICIENT_DATA", explanation: "Could not verify this claim.", citation: "" };
      }

      return {
        data: {
          ...result,
          query_id: Math.random().toString(36).substring(7),
          latency_ms: latency
        }
      };
    } catch (error) {
      console.error("Misinfo error:", error);
      throw error;
    }
  }
};
