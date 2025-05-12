import { WebLlmProviderConfig } from '../types/provider-config/WebLlmProviderConfig';
import { Provider } from '../types/Provider';
import { Message } from 'react-chatbotify';
import { ChatCompletionChunk, MLCEngine, MLCEngineConfig } from '@mlc-ai/web-llm';
import { WebLlmProviderMessage } from '../types/provider-message/WebLlmProviderMessage';

/**
 * Provider for MLC’s WebLLM runtime, for running models in the browser.
 */
class WebLlmProvider implements Provider {
	private model!: string;
	private systemMessage?: string;
	private responseFormat!: 'stream' | 'json';
	private engineConfig: MLCEngineConfig;
	private chatCompletionOptions: Record<string, unknown>;
	private messageParser?: (messages: Message[]) => WebLlmProviderMessage[];
	private engine?: MLCEngine;

	/**
	 * Sets default values for the provider based on given configuration. Configuration guide here:
	 * https://github.com/React-ChatBotify-Plugins/llm-connector/blob/main/docs/providers/WebLlm.md
	 *
	 * @param config configuration for setup
	 */
	constructor(config: WebLlmProviderConfig) {
		this.model = config.model;
		this.systemMessage = config.systemMessage;
		this.responseFormat = config.responseFormat ?? 'stream';
		this.messageParser = config.messageParser;
		this.engineConfig = config.engineConfig ?? {};
		this.chatCompletionOptions = config.chatCompletionOptions ?? {};
		this.createEngine();
	}

	/**
	 * Creates MLC Engine for inferencing.
	 */
	private async createEngine() {
		const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
		this.engine = await CreateMLCEngine(this.model, {
			...this.engineConfig,
		});
	}

	/**
	 * Calls WebLlm and yields each chunk (or the full text).
	 *
	 * @param messages messages to include in the request
	 */
	public async *sendMessages(messages: Message[]): AsyncGenerator<string> {
		if (!this.engine) {
			await this.createEngine();
		}

		const result = await this.engine?.chat.completions.create(this.constructBodyWithMessages(messages));
		if (result && Symbol.asyncIterator in result) {
			for await (const chunk of result as AsyncIterable<ChatCompletionChunk>) {
				const delta = chunk.choices[0]?.delta?.content;
				if (delta) {
					yield delta;
				}
			}
		} else if (result?.choices?.[0]?.message?.content) {
			yield result.choices[0].message.content;
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
	 * Builds the full request body.
	 *
	 * @param messages messages to parse
	 */
	private constructBodyWithMessages = (messages: Message[]) => {
		let parsedMessages;
		if (this.messageParser) {
			// use parser if specified
			parsedMessages = this.messageParser(messages);
		} else {
			// only handle message contents of type string and exclude chatbot system messages
			const filteredMessages = messages.filter(
				(message) => typeof message.content === 'string' && message.sender.toUpperCase() !== 'SYSTEM'
			);
			parsedMessages = filteredMessages.map((message) => {
				const role = this.roleMap(message.sender.toUpperCase()) as 'user' | 'assistant' | 'system';
				const text = message.content as string;
				return {
					role,
					content: text,
				};
			});
		}

		// append system message if specified
		if (this.systemMessage) {
			parsedMessages = [
				{
					role: 'system' as 'user' | 'assistant' | 'system',
					content: this.systemMessage as string,
				},
				...parsedMessages,
			];
		}

		return {
			messages: parsedMessages,
			stream: this.responseFormat === 'stream',
			...this.chatCompletionOptions,
		};
	};
}

export default WebLlmProvider;
