import { useEffect, useCallback } from 'react';
import {
	RcbPostInjectMessageEvent,
	RcbStopStreamMessageEvent,
	RcbStopSimulateStreamMessageEvent,
	Message,
} from 'react-chatbotify';
import { handlePrompt } from '../utils/promptHandler';
import { Provider } from '../types/Provider';

// the core library enforces a 400ms delay before typing indicator is shown
// this ensures responses do not appear even before the typing indicator
const STREAM_DEBOUNCE_MS = 500;

/**
 * Handles message events.
 *
 * @param getBotId id of the chatbot
 * @param refs object containing relevant refs
 * @param actions object containing relevant actions
 */
const useMessageHandler = (
	getBotId: () => string | null,
	refs: {
		providerRef: React.MutableRefObject<Provider | null>;
		messagesRef: React.MutableRefObject<Message[]>;
		outputTypeRef: React.MutableRefObject<'character' | 'chunk' | 'full'>;
		outputSpeedRef: React.MutableRefObject<number>;
		historySizeRef: React.MutableRefObject<number>;
		errorMessageRef: React.MutableRefObject<string>;
		onUserMessageRef: React.MutableRefObject<((msg: Message) => Promise<string | null>) | null>;
		onKeyDownRef: React.MutableRefObject<((e: KeyboardEvent) => Promise<string | null>) | null>;
	},
	actions: {
		speakAudio: (text: string) => void;
		injectMessage: (content: string | JSX.Element, sender?: string) => Promise<Message | null>;
		streamMessage: (msg: string) => void;
		endStreamMessage: () => void;
		toggleTextAreaDisabled: (active?: boolean) => void;
		toggleIsBotTyping: (active?: boolean) => void;
		focusTextArea: () => void;
		goToPath: (path: string) => void;
	}
) => {
	const { messagesRef, onUserMessageRef, onKeyDownRef } = refs;
	const { injectMessage, toggleTextAreaDisabled, toggleIsBotTyping, goToPath, focusTextArea, } = actions;

	/**
	 * Handles message events to determine whether to prompt LLM.
	 *
	 * @param event message event received
	 */
	const handler = useCallback(
		(event: RcbPostInjectMessageEvent | RcbStopStreamMessageEvent | RcbStopSimulateStreamMessageEvent) => {
			if (getBotId() !== event.detail.botId || !refs.providerRef.current) {
				return;
			}
			const msg = event.data.message!;
			const sender = msg.sender.toUpperCase();
			msg.tags = msg.tags ?? [];
			msg.tags.push(`rcb-llm-connector-plugin:${sender}`);
			if (sender !== 'USER') {
				return;
			}
			toggleIsBotTyping(true);
			toggleTextAreaDisabled(true);
			setTimeout(async () => {
				// user-defined intercept
				if (onUserMessageRef.current) {
					const path = await onUserMessageRef.current(msg);
					if (path) {
						return goToPath(path);
					}
				}
				// default LLM flow
				const historySize = refs.historySizeRef.current;
				const past = messagesRef.current;
				const messagesToSend = historySize ? [...past.slice(-(historySize - 1)), msg] : [msg];

				handlePrompt(messagesToSend, refs, actions).catch((err) => {
					toggleIsBotTyping(false);
					toggleTextAreaDisabled(false);
					setTimeout(() => {
						focusTextArea();
					});
					console.error('LLM prompt failed', err);
					injectMessage(refs.errorMessageRef.current);
				});
			}, STREAM_DEBOUNCE_MS);
		},
		[getBotId, refs, actions]
	);

	// adds required events for message streaming
	useEffect(() => {
		window.addEventListener('rcb-post-inject-message', handler);
		window.addEventListener('rcb-stop-simulate-stream-message', handler);
		window.addEventListener('rcb-stop-stream-message', handler);
		return () => {
			window.removeEventListener('rcb-post-inject-message', handler);
			window.removeEventListener('rcb-stop-simulate-stream-message', handler);
			window.removeEventListener('rcb-stop-stream-message', handler);
		};
	}, [handler]);

	// handles keydown event for stop condition
	useEffect(() => {
		const onKey = async (e: KeyboardEvent) => {
			if (onKeyDownRef.current) {
				const path = await onKeyDownRef.current(e);
				if (path) {
					goToPath(path)
				};
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);
};

export { useMessageHandler };
