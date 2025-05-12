/**
 * Message format for web-llm.
 */
type WebLlmProviderMessage = {
	role: 'user' | 'assistant' | 'system';
	content: string;
};

export type { WebLlmProviderMessage };
