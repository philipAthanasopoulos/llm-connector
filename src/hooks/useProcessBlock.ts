import { useEffect, useCallback } from 'react';
import { RcbPreProcessBlockEvent, RcbPostProcessBlockEvent } from 'react-chatbotify';
import { LlmConnectorBlock } from '../types/LlmConnectorBlock';

/**
 * Handles pre-processing and post-processing of blocks.
 *
 * @param getBotId id of the chatbot
 * @param toggleIsBotTyping toggles typing indicator for the chatbot
 * @param toggleTextAreaDisabled toggles text area disabled state for the chatbot
 * @param focusTextArea focuses on the text area
 */
const useProcessBlock = (
	getBotId: () => string | null,
	toggleIsBotTyping: (active?: boolean) => void,
	toggleTextAreaDisabled: (active?: boolean) => void,
	focusTextArea: () => void
) => {
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
