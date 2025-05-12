/**
 * Message format for wllama.
 */
type WllamaProviderMessage = {
	role: 'user' | 'assistant' | 'system';
	content: string;
};

export type { WllamaProviderMessage };
