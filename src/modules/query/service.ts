export const QueryService = {
  async ask(userId: string, inputText: string, language: string, persona: string, state: string) {
    throw new Error("Gemini API calls must be performed from the frontend.");
  },

  async misinformationCheck(userId: string, claim: string, language: string, state?: string) {
    throw new Error("Gemini API calls must be performed from the frontend.");
  }
};
