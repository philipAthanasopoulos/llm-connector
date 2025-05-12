import { Message } from 'react-chatbotify';
import { WllamaProviderMessage } from '../provider-message/WllamaProviderMessage';
import { AssetsPathConfig, LoadModelConfig, WllamaConfig } from '@wllama/wllama';

/**
 * Configurations for WllamaProvider.
 */
type WllamaProviderConfig = {
	modelUrl: string;
	systemMessage?: string;
	responseFormat?: 'stream' | 'json';
	assetsPathConfig?: AssetsPathConfig;
	wllamaConfig?: WllamaConfig;
	loadModelConfig?: LoadModelConfig;
	chatCompletionOptions?: Record<string, unknown>;
	messageParser?: (messages: Message[]) => WllamaProviderMessage[];
};

export type { WllamaProviderConfig };
