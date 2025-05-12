/**
 * Message format for Google Gemini.
 */
type GeminiProviderMessage = {
	role: 'user' | 'model';
	content: string;
};

export type { GeminiProviderMessage };
