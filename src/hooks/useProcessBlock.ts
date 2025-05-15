import { useEffect, useCallback } from 'react';
import { RcbPreProcessBlockEvent, RcbPostProcessBlockEvent, Message } from 'react-chatbotify';
import { LlmConnectorBlock } from '../types/LlmConnectorBlock';
import { Provider } from '../types/Provider';

/**
 * Handles pre-processing and post-processing of blocks.
 *
 * @param getBotId id of the chatbot
 * @param refs object containing relevant refs
 * @param actions object containing relevant actions
 */
const useProcessBlock = (
	getBotId: () => string | null,
	refs: {
		providerRef: React.MutableRefObject<Provider | null>;
		messagesRef: React.MutableRefObject<Message[]>;
		outputTypeRef: React.MutableRefObject<'character' | 'chunk' | 'full'>;
		outputSpeedRef: React.MutableRefObject<number>;
		historySizeRef: React.MutableRefObject<number>;
		initialMessageRef: React.MutableRefObject<string>;
		errorMessageRef: React.MutableRefObject<string>;
		onUserMessageRef: React.MutableRefObject<((msg: Message) => Promise<string | null>) | null>;
		onKeyDownRef: React.MutableRefObject<((e: KeyboardEvent) => Promise<string | null>) | null>;
	},
	actions: {
		speakAudio: (text: string) => void;
		injectMessage: (content: string | JSX.Element, sender?: string) => Promise<Message | null>;
		simulateStreamMessage: (content: string, sender?: string) => Promise<Message | null>;
		streamMessage: (msg: string) => void;
		endStreamMessage: () => void;
		toggleTextAreaDisabled: (active?: boolean) => void;
		toggleIsBotTyping: (active?: boolean) => void;
		focusTextArea: () => void;
		goToPath: (path: string) => void;
	}
) => {
	const { outputTypeRef } = refs;
	const { toggleTextAreaDisabled, toggleIsBotTyping, focusTextArea, injectMessage, simulateStreamMessage } = actions;

	/**
	 * Handles blocking of pre-processing and post-processing of block for full custom control.
	 *
	 * @param event block processing event received
	 */
	const handler = useCallback(
		(event: RcbPreProcessBlockEvent | RcbPostProcessBlockEvent) => {
			// if event is not for chatbot, return
			if (getBotId() !== event.detail.botId) {
				return;
			}

			// if not an llm connector block, return
			const block = event.data.block as LlmConnectorBlock;
			if (!block.llmConnector) {
				return;
			}

			// prevent all block processing
			event.preventDefault();

			// pre-processing event is triggered when post-processing
			// is complete (i.e. llm generation done)
			// since pre-processing event is disabled, we simulate
			// disabling typing indicator, enabling text area and focusing on it again
			if (event.type === 'rcb-pre-process-block') {
				if (block.llmConnector?.initialMessage) {
					if (outputTypeRef.current === "full") {
						injectMessage(refs.initialMessageRef.current);
					} else {
						simulateStreamMessage(refs.initialMessageRef.current);
					}
				}
				toggleIsBotTyping(false);
				toggleTextAreaDisabled(false);
				setTimeout(() => {
					focusTextArea();
				});
			}
		},
		[getBotId, toggleIsBotTyping, toggleTextAreaDisabled, focusTextArea]
	);

	// adds required events for block processing
	useEffect(() => {
		window.addEventListener('rcb-pre-process-block', handler);
		window.addEventListener('rcb-post-process-block', handler);
		return () => {
			window.removeEventListener('rcb-pre-process-block', handler);
			window.removeEventListener('rcb-post-process-block', handler);
		};
	}, [handler]);
};

export { useProcessBlock };
