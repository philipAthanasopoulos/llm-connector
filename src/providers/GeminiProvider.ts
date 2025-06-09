import { GeminiProviderConfig } from '../types/provider-config/GeminiProviderConfig';
import { Provider } from '../types/Provider';
import { Message } from 'react-chatbotify';
import { GeminiProviderMessage } from '../types/provider-message/GeminiProviderMessage';

/**
 * Provider for Gemini’s API, supports both direct and proxy modes.
 */
class GeminiProvider implements Provider {
	private method!: string;
	private endpoint!: string;
	private headers!: Record<string, unknown>;
	private body!: Record<string, unknown>;
	private systemMessage?: string;
	private responseFormat!: 'stream' | 'json';
	private messageParser?: (messages: Message[]) => GeminiProviderMessage[];
	private debug: boolean = false;

	/**
	 * Sets default values for the provider based on given configuration. Configuration guide here:
	 * https://github.com/React-ChatBotify-Plugins/llm-connector/blob/main/docs/providers/Gemini.md
	 *
	 * @param config configuration for setup
	 */
	public constructor(config: GeminiProviderConfig) {
		this.method = config.method ?? 'POST';
		this.body = config.body ?? {};
		this.systemMessage = config.systemMessage;
		this.responseFormat = config.responseFormat ?? 'stream';
		this.messageParser = config.messageParser;
		this.debug = config.debug ?? false;
		this.headers = {
			'Content-Type': 'application/json',
			Accept: this.responseFormat === 'stream' ? 'text/event-stream' : 'application/json',
			...config.headers,
		};

		const baseUrl = config.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta';
		if (config.mode === 'direct') {
			this.endpoint =
				this.responseFormat === 'stream'
					? `${baseUrl}/models/${config.model}:streamGenerateContent?alt=sse&key=${config.apiKey || ''}`
					: `${baseUrl}/models/${config.model}:generateContent?key=${config.apiKey || ''}`;
		} else if (config.mode === 'proxy') {
			this.endpoint = `${baseUrl}/${config.model}`;
		} else {
			throw Error("Invalid mode specified for Gemini provider ('direct' or 'proxy').");
		}
	}

	/**
	 * Calls Gemini and yields each chunk (or the full text).
	 *
	 * @param messages messages to include in the request
	 */
	public async *sendMessages(messages: Message[]): AsyncGenerator<string> {
		if (this.debug) {
			const sanitizedEndpoint = this.endpoint.replace(/\?key=([^&]+)/, '?key=[REDACTED]');
			// Headers in Gemini usually don't contain sensitive info like 'Authorization'
			// as the API key is in the URL, but we'll keep a general sanitization pattern.
			const sanitizedHeaders = { ...this.headers };
			// If any sensitive header were to be added in the future, it should be removed here.
			// delete sanitizedHeaders['Some-Sensitive-Header'];
			console.log('[GeminiProvider] Request:', {
				method: this.method,
				endpoint: sanitizedEndpoint,
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
			throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
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
	private roleMap = (sender: string): 'user' | 'model' => {
		switch (sender) {
			case 'USER':
				return 'user';
			default:
				return 'model';
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
					parts: [{ text }],
				};
			});
		}

		// append system message if specified
		if (this.systemMessage) {
			parsedMessages = [{ role: 'user', parts: [{ text: this.systemMessage }] }, ...parsedMessages];
		}

		return {
			contents: parsedMessages,
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
			const lines = buffer.split('\n');
			buffer = lines.pop()!;

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed.startsWith('data: ')) continue;

				const jsonText = trimmed.slice('data: '.length);
				try {
					const evt = JSON.parse(jsonText);
					const chunk = evt.candidates?.[0]?.content?.parts?.[0]?.text;
					if (chunk) yield chunk;
				} catch (err) {
					console.error('SSE JSON parse error:', jsonText, err);
				}
			}
		}
	};
}

export default GeminiProvider;
