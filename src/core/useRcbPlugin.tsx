import { useEffect, useRef } from 'react';
import {
	useBotId,
	useFlow,
	Plugin,
	useAudio,
	useMessages,
	usePaths,
	Message,
	useTextArea,
	useChatWindow,
} from 'react-chatbotify';

import { PluginConfig } from '../types/PluginConfig';
import { DefaultPluginConfig } from '../constants/DefaultPluginConfig';
import { Provider } from '../types/Provider';
import { useChangePath } from '../hooks/useChangePath';
import { useProcessBlock } from '../hooks/useProcessBlock';
import { useMessageHandler } from '../hooks/useMessageHandler';

/**
 * Plugin hook that handles all the core logic.
 *
 * @param pluginConfig configurations for the plugin
 */
const useRcbPlugin = (pluginConfig?: PluginConfig): ReturnType<Plugin> => {
	const messagesRef = useRef<Message[]>([]);
	const providerRef = useRef<Provider | null>(null);
	const outputTypeRef = useRef<'character' | 'chunk' | 'full'>('chunk');
	const outputSpeedRef = useRef<number>(30);
	const historySizeRef = useRef<number>(0);
	const errorMessageRef = useRef<string>('Unable to get response, please try again.');
	const onUserMessageRef = useRef<((msg: Message) => Promise<string | null>) | null>(null);
	const onKeyDownRef = useRef<((e: KeyboardEvent) => Promise<string | null>) | null>(null);

	const { getBotId } = useBotId();
	const { getFlow } = useFlow();
	const { speakAudio } = useAudio();
	const { messages, injectMessage, simulateStreamMessage, streamMessage, endStreamMessage } = useMessages();
	const { goToPath } = usePaths();
	const { toggleTextAreaDisabled, focusTextArea } = useTextArea();
	const { toggleIsBotTyping } = useChatWindow();

	const mergedPluginConfig = { ...DefaultPluginConfig, ...(pluginConfig ?? {}) };

	// sync messages ref
	useEffect(() => {
		messagesRef.current = messages;
	}, [messages]);

	// handles changing of conversation path (block)
	useChangePath(getBotId, getFlow, (block) => {
		providerRef.current = block.llmConnector?.provider ?? null;
		outputTypeRef.current = block.llmConnector?.outputType ?? 'chunk';
		outputSpeedRef.current = block.llmConnector?.outputSpeed ?? 30;
		historySizeRef.current = block.llmConnector?.historySize ?? 0;
		errorMessageRef.current = block.llmConnector?.errorMessage ?? 'Unable to get response, please try again.';
		onUserMessageRef.current = block.llmConnector?.stopConditions?.onUserMessage ?? null;
		onKeyDownRef.current = block.llmConnector?.stopConditions?.onKeyDown ?? null;
	});

	// handles pre-processing and post-processing of blocks.
	useProcessBlock(getBotId, toggleIsBotTyping, toggleTextAreaDisabled, focusTextArea);

	// handles message events
	useMessageHandler(
		getBotId,
		{
			providerRef,
			messagesRef,
			outputTypeRef,
			outputSpeedRef,
			historySizeRef,
			errorMessageRef,
			onUserMessageRef,
			onKeyDownRef,
		},
		{
			speakAudio,
			injectMessage,
			simulateStreamMessage,
			streamMessage,
			endStreamMessage,
			toggleTextAreaDisabled,
			toggleIsBotTyping,
			focusTextArea,
			goToPath,
		}
	);

	// initializes plugin metadata with plugin name
	const pluginMetaData: ReturnType<Plugin> = { name: '@rcb-plugins/llm-connector' };

	// adds required events in settings if auto config is true
	if (mergedPluginConfig?.autoConfig) {
		pluginMetaData.settings = {
			event: {
				rcbChangePath: true,
				rcbPostInjectMessage: true,
				rcbStopSimulateStreamMessage: true,
				rcbStopStreamMessage: true,
				rcbPreProcessBlock: true,
				rcbPostProcessBlock: true,
			},
		};
	}

	return pluginMetaData;
};

export default useRcbPlugin;
