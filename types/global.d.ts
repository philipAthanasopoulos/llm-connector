import {
	RcbToggleAudioEvent,
	RcbToggleNotificationsEvent,
	RcbToggleVoiceEvent,
	RcbToggleChatWindowEvent,
	RcbPreInjectMessageEvent,
	RcbPostInjectMessageEvent,
	RcbStartSimulateStreamMessageEvent,
	RcbStopSimulateStreamMessageEvent,
	RcbStartStreamMessageEvent,
	RcbChunkStreamMessageEvent,
	RcbStopStreamMessageEvent,
	RcbRemoveMessageEvent,
	RcbLoadChatHistoryEvent,
	RcbChangePathEvent,
	RcbShowToastEvent,
	RcbDismissToastEvent,
	RcbUserSubmitTextEvent,
	RcbUserUploadFileEvent,
	RcbTextAreaChangeValueEvent,
	RcbPreLoadChatBotEvent,
	RcbPostLoadChatBotEvent,
	RcbPreProcessBlockEvent,
	RcbPostProcessBlockEvent,
} from 'react-chatbotify';

declare global {
	// for custom rcb events
	interface WindowEventMap {
		// audio
		'rcb-toggle-audio': RcbToggleAudioEvent;

		// notifications:
		'rcb-toggle-notifications': RcbToggleNotificationsEvent;

		// voice
		'rcb-toggle-voice': RcbToggleVoiceEvent;

		// chat window
		'rcb-toggle-chat-window': RcbToggleChatWindowEvent;

		// messages
		'rcb-pre-inject-message': RcbPreInjectMessageEvent;
		'rcb-post-inject-message': RcbPostInjectMessageEvent;
		'rcb-start-simulate-stream-message': RcbStartSimulateStreamMessageEvent;
		'rcb-stop-simulate-stream-message': RcbStopSimulateStreamMessageEvent;
		'rcb-start-stream-message': RcbStartStreamMessageEvent;
		'rcb-chunk-stream-message': RcbChunkStreamMessageEvent;
		'rcb-stop-stream-message': RcbStopStreamMessageEvent;
		'rcb-remove-message': RcbRemoveMessageEvent;

		// chat history
		'rcb-load-chat-history': RcbLoadChatHistoryEvent;

		// path
		'rcb-change-path': RcbChangePathEvent;

		// toast
		'rcb-show-toast': RcbShowToastEvent;
		'rcb-dismiss-toast': RcbDismissToastEvent;

		// user input submission
		'rcb-user-submit-text': RcbUserSubmitTextEvent;
		'rcb-user-upload-file': RcbUserUploadFileEvent;

		// textarea change value
		'rcb-text-area-change-value': RcbTextAreaChangeValueEvent;

		// chatbot loading
		'rcb-pre-load-chatbot': RcbPreLoadChatBotEvent;
		'rcb-post-load-chatbot': RcbPostLoadChatBotEvent;

		// block processing
		'rcb-pre-process-block': RcbPreProcessBlockEvent;
		'rcb-post-process-block': RcbPostProcessBlockEvent;
	}
}
