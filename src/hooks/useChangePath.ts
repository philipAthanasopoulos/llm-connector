import { useEffect, useCallback } from 'react';
import { Flow, RcbChangePathEvent } from 'react-chatbotify';

import { LlmConnectorBlock } from '../types/LlmConnectorBlock';

/**
 * Handles changing of conversation path (block).
 *
 * @param getBotId id of the chatbot
 * @param getFlow flow of the chatbot
 * @param setConnectorBlockFields sets all fields required for llm connector block
 */
const useChangePath = (
	getBotId: () => string | null,
	getFlow: () => Flow,
	setConnectorBlockFields: (block: LlmConnectorBlock) => void
) => {
	/**
	 * Handles setting of provider on change of path.
	 *
	 * @param event change path event received
	 */
	const handler = useCallback(
		(event: RcbChangePathEvent) => {
			// if event is not for chatbot, return
			if (getBotId() !== event.detail.botId) {
				return;
			}

			// update llm connector block fields
			// if is llm connector block, will populate valid fields
			// else will reset all to null
			const flow = getFlow();
			const nextBlock = flow[event.data.nextPath] as LlmConnectorBlock;
			setConnectorBlockFields(nextBlock);
		},
		[getBotId, getFlow, setConnectorBlockFields]
	);

	// adds required events for change path
	useEffect(() => {
		window.addEventListener('rcb-change-path', handler);
		return () => window.removeEventListener('rcb-change-path', handler);
	}, [handler]);
};

export { useChangePath };
