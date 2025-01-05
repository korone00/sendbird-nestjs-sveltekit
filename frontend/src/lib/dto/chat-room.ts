import type { ChatMessage } from './chat-message';

export class ChatRoom {
	id: string;
	name: string;
	description?: string;
	lastMessage?: ChatMessage;
	messages?: ChatMessage[];

	constructor(id: string, name: string, description: string) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.messages = [];
	}
}
