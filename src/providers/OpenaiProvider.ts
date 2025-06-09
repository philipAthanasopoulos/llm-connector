import { Provider } from '../types/Provider';
import { Message } from 'react-chatbotify';
import { OpenaiProviderConfig } from '../types/provider-config/OpenaiProviderConfig';
import { OpenaiProviderMessage } from '../types/provider-message/OpenaiProviderMessage';

/**
 * Provider for Openai’s API, supports both direct and proxy modes.
 */
class OpenaiProvider implements Provider {
	private method!: string;
	private endpoint!: string;
	private headers!: Record<string, unknown>;
	private body!: Record<string, unknown>;
	private systemMessage?: string;
	private responseFormat!: 'stream' | 'json';
	private messageParser?: (messages: Message[]) => OpenaiProviderMessage[];
	private debug: boolean = false;

	/**
	 * Sets default values for the provider based on given configuration. Configuration guide here:
	 * https://github.com/React-ChatBotify-Plugins/llm-connector/blob/main/docs/providers/OpenAI.md
	 *
	 * @param config configuration for setup
	 */
	public constructor(config: OpenaiProviderConfig) {
		this.method = config.method ?? 'POST';
		this.endpoint = config.baseUrl ?? 'https://api.openai.com/v1/chat/completions';
		this.systemMessage = config.systemMessage;
		this.responseFormat = config.responseFormat ?? 'stream';
		this.messageParser = config.messageParser;
		this.debug = config.debug ?? false;
		this.headers = {
			'Content-Type': 'application/json',
			Accept: this.responseFormat === 'stream' ? 'text/event-stream' : 'application/json',
			...config.headers,
		};
		this.body = {
			model: config.model,
			stream: this.responseFormat === 'stream',
			...config.body,
		};

		if (config.mode === 'direct') {
			this.headers = { ...this.headers, Authorization: `Bearer ${config.apiKey}` };
			return;
		}

		if (config.mode !== 'proxy') {
			throw Error("Invalid mode specified for OpenAI provider ('direct' or 'proxy').");
		}
	}

	/**
	 * Calls Openai and yields each chunk (or the full text).
	 *
	 * @param messages messages to include in the request
	 */
	public async *sendMessages(messages: Message[]): AsyncGenerator<string> {
		if (this.debug) {
			const sanitizedHeaders = { ...this.headers };
			delete sanitizedHeaders['Authorization'];
			console.log('[OpenaiProvider] Request:', {
				method: this.method,
				endpoint: this.endpoint,
				headers: sanitizedHeaders,
				body: this.constructBodyWithMessages(messages),
			});
		}
		const res = await fetch(this.endpoint, {
			method: this.method,
			headers: this.headers as HeadersInit,
			body: JSON.stringify(this.constructBodyWithMessages(messages)),
		});

		if (!res.ok) {
			throw new Error(`Openai API error ${res.status}: ${await res.text()}`);
		}

		if (this.responseFormat === 'stream') {
			if (!res.body) {
				throw new Error('Response body is empty – cannot stream');
			}
			const reader = res.body.getReader();
			for await (const chunk of this.handleStreamResponse(reader)) {
				yield chunk;
			}
		} else {
			const payload = await res.json();
			const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
			if (typeof text === 'string') {
				yield text;
			} else {
				throw new Error('Unexpected response shape – no text candidate');
			}
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
				const role = this.roleMap(message.sender.toUpperCase());
				const text = message.content;
				return {
					role,
					content: text,
				};
			});
		}

		// append system message if specified
		if (this.systemMessage) {
			parsedMessages = [{ role: 'system', content: this.systemMessage }, ...parsedMessages];
		}

		return {
			messages: parsedMessages,
			...this.body,
		};
	};

	/**
	 * Consumes an SSE/text stream Response and yield each text chunk.
	 *
	 * @reader request body reader
	 */
	private handleStreamResponse = async function* (
		reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>
	): AsyncGenerator<string> {
		const decoder = new TextDecoder('utf-8');
		let buffer = '';

		while (true) {
			const { value, done } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const parts = buffer.split(/\r?\n/);
			buffer = parts.pop()!;

			for (const line of parts) {
				if (!line.startsWith('data: ')) continue;
				const json = line.slice('data: '.length).trim();
				if (json === '[DONE]') return;
				try {
					const event = JSON.parse(json);
					const chunk = event.choices?.[0]?.delta?.content;
					if (chunk) yield chunk;
				} catch (err) {
					console.error('Stream parse error', err);
				}
			}
		}
	};
}

export default OpenaiProvider;
