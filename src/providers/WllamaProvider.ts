import { WllamaProviderConfig } from '../types/provider-config/WllamaProviderConfig';
import { Provider } from '../types/Provider';
import { Message } from 'react-chatbotify';
import { AssetsPathConfig, LoadModelConfig, Wllama, WllamaConfig } from '@wllama/wllama';
import { WllamaProviderMessage } from '../types/provider-message/WllamaProviderMessage';

class WllamaProvider implements Provider {
	private modelUrl!: string;
	private systemMessage?: string;
	private responseFormat!: 'stream' | 'json';
	private assetsPathConfig: AssetsPathConfig;
	private wllamaConfig: WllamaConfig;
	private loadModelConfig: LoadModelConfig;
	private chatCompletionOptions: Record<string, unknown>;
	private messageParser?: (messages: Message[]) => WllamaProviderMessage[];
	private wllama?: Wllama;

	/**
	 * Sets default values for the provider based on given configuration. Configuration guide here:
	 * https://github.com/React-ChatBotify-Plugins/llm-connector/blob/main/docs/providers/Wllama.md
	 *
	 * @param config configuration for setup
	 */
	constructor(config: WllamaProviderConfig) {
		this.modelUrl = config.modelUrl;
		this.systemMessage = config.systemMessage;
		this.responseFormat = config.responseFormat ?? 'stream';
		this.messageParser = config.messageParser;
		this.assetsPathConfig = config.assetsPathConfig ?? {
			'single-thread/wllama.wasm': '/single-thread/wllama.wasm',
			'multi-thread/wllama.wasm': '/multi-thread/wllama.wasm',
		};
		this.wllamaConfig = config.wllamaConfig ?? {};
		this.loadModelConfig = config.loadModelConfig ?? {};
		this.chatCompletionOptions = config.chatCompletionOptions ?? {};
	}

	/**
	 * Calls Wllama and yields each chunk (or the full text).
	 *
	 * @param messages messages to include in the request
	 */
	public async *sendMessages(messages: Message[]): AsyncGenerator<string> {
		if (!this.wllama) {
			const { Wllama, ModelManager } = await import('@wllama/wllama');
			const modelManager = new ModelManager();
			this.wllama = new Wllama(this.assetsPathConfig, this.wllamaConfig);
			const resolvedUrl = new URL(this.modelUrl!, window.location.origin).toString();
			const model = await modelManager.downloadModel(resolvedUrl);
			await this.wllama.loadModel(model, this.loadModelConfig ?? {});
		}

		if (this.responseFormat === 'stream') {
			const stream = await this.wllama.createChatCompletion(this.constructMessages(messages), {
				...(this.chatCompletionOptions ?? {}),
				stream: true,
			});

			// special handling because chunk.currentText returns entire accumulated response so far
			let previous = '';
			for await (const chunk of stream) {
				const full = chunk.currentText;
				const delta = full.slice(previous.length);
				if (delta) {
					yield delta;
				}
				previous = full;
			}
		} else {
			const text = await this.wllama.createChatCompletion(this.constructMessages(messages), {
				...(this.chatCompletionOptions ?? {}),
				stream: false,
			});
			yield text;
		}
	}

	/**
	 * Maps the chatbot message sender to the provider message sender.
	 *
	 * @param sender sender from the chatbot
	 */
	private roleMap = (sender: string): 'system' | 'user' | 'assistant' => {
		switch (sender) {
			case 'USER':
				return 'user';
			case 'SYSTEM':
				return 'system';
			default:
				return 'assistant';
		}
	};

	/**
	 * Constructs messages for the provider.
	 *
	 * @param messages messages to parse
	 */
	private constructMessages = (messages: Message[]) => {
		if (this.messageParser) {
			// use parser if specified
			return this.messageParser(messages);
		}
		// only handle message contents of type string and exclude chatbot system messages
		const filteredMessages = messages.filter(
			(message) => typeof message.content === 'string' && message.sender.toUpperCase() !== 'SYSTEM'
		);
		let parsedMessages = filteredMessages.map((message) => {
			const role = this.roleMap(message.sender.toUpperCase()) as 'user' | 'assistant' | 'system';
			const text = message.content as string;
			return {
				role,
				content: text,
			};
		});

		// append system message if specified
		if (this.systemMessage) {
			parsedMessages = [{ role: 'system', content: this.systemMessage }, ...parsedMessages];
		}

		return parsedMessages;
	};
}

export default WllamaProvider;
