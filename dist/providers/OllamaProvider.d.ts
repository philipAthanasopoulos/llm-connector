import { Provider } from '../types/Provider';
import { Message } from 'react-chatbotify';
interface OllamaProviderConfig {
    model: string;
    baseUrl?: string;
    stream?: boolean;
    debug?: boolean;
    headers?: Record<string, string>;
}
declare class OllamaProvider implements Provider {
    private endpoint;
    private model;
    private stream;
    private debug;
    private headers;
    constructor(config: OllamaProviderConfig);
    sendMessages(messages: Message[]): AsyncGenerator<string>;
}
export default OllamaProvider;
//# sourceMappingURL=OllamaProvider.d.ts.map