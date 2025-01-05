import type { ChatMessage } from './chat-message';

export class ChatUser {
	isOnline: boolean;

	isActive: boolean;
	id: string;
	nickname: string;

	profileUrl: string;

	constructor(
		isOnline: boolean,
		isActive: boolean,
		id: string,
		nickname: string,
		profileUrl: string
	) {
		this.isOnline = isOnline;
		this.isActive = isActive;
		this.id = id;
		this.nickname = nickname;
		this.profileUrl = profileUrl;
	}
}
