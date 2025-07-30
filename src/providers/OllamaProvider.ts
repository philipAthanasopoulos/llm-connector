import { Provider } from '../types/Provider';
import { Message } from 'react-chatbotify';

interface OllamaProviderConfig {
	model: string;
	baseUrl?: string;
	stream?: boolean;
	debug?: boolean;
	headers?: Record<string, string>;
}

class OllamaProvider implements Provider {
	private endpoint: string;
	private model: string;
	private stream: boolean;
	private debug: boolean;
	private headers: Record<string, string>;

	public constructor(config: OllamaProviderConfig) {
		this.model = config.model;
		this.stream = config.stream ?? true;
		this.debug = config.debug ?? false;
		this.headers = {
			'Content-Type': 'application/json',
			...config.headers,
		};
		this.endpoint = config.baseUrl ?? 'http://localhost:11434/api/generate';
	}

	public async *sendMessages(messages: Message[]): AsyncGenerator<string> {
		const prompt = messages
			.filter((m) => typeof m.content === 'string')
			.map((m) => m.content)
			.join('\n');

		const body = {
			model: this.model,
			prompt,
			stream: this.stream,
		};

		if (this.debug) {
			console.log('[OllamaProvider] Request:', {
				endpoint: this.endpoint,
				headers: this.headers,
				body,
			});
		}

		const res = await fetch(this.endpoint, {
			method: 'POST',
			headers: this.headers,
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			throw new Error(`Ollama API error ${res.status}: ${await res.text()}`);
		}

		if (this.stream) {
			if (!res.body) throw new Error('No response body for streaming');
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop()!;
				for (const line of lines) {
					if (!line.trim()) continue;
					try {
						const data = JSON.parse(line);
						if (data.response) yield data.response;
					} catch (e) {
						if (this.debug) console.error('Ollama stream parse error:', line, e);
					}
				}
			}
		} else {
			const data = await res.json();
			if (data.response) yield data.response;
		}
	}
}

export default OllamaProvider;
