import { useCallback } from 'react';
import { Flow, RcbChangePathEvent, RcbEvent, useOnRcbEvent } from 'react-chatbotify';

import { LlmConnectorBlock } from '../types/LlmConnectorBlock';

/**
 * Handles changing of conversation path (block).
 *
 * @param getFlow flow of the chatbot
 * @param setConnectorBlockFields sets all fields required for llm connector block
 */
const useChangePath = (getFlow: () => Flow, setConnectorBlockFields: (block: LlmConnectorBlock) => void) => {
	/**
	 * Handles setting of provider on change of path.
	 *
	 * @param event change path event received
	 */
	const handler = useCallback(
		(event: RcbChangePathEvent) => {
			// update llm connector block fields
			// if is llm connector block, will populate valid fields
			// else will reset all to null
			const flow = getFlow();
			const nextBlock = flow[event.data.nextPath] as LlmConnectorBlock;
			setConnectorBlockFields(nextBlock);
		},
		[getFlow, setConnectorBlockFields]
	);

	// adds required events for change path
	useOnRcbEvent(RcbEvent.CHANGE_PATH, handler);
};

export { useChangePath };
