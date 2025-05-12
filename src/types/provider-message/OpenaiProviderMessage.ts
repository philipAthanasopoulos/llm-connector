/**
 * Message format for OpenAI.
 */
type OpenaiProviderMessage = {
	role: 'user' | 'assistant' | 'system';
	content: string;
};

export type { OpenaiProviderMessage };
