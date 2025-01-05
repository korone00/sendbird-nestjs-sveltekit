import type { ChatMessageType } from '$lib/enum/chat-message-type.enum';

export class ChatMessage {
	id: string;
	type: ChatMessageType;
	userId: string;
	userProfileUrl?: string;
	content: string;
	timestamp: Date;

	constructor(id: string, type: ChatMessageType, userId: string, content: string, timestamp: Date) {
		this.id = id;
		this.type = type;
		this.userId = userId;
		this.content = content;
		this.timestamp = timestamp;
	}
}
