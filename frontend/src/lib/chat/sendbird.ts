import SendbirdChat, { BaseChannel, ChannelType, User } from '@sendbird/chat';
import { OpenChannelModule } from '@sendbird/chat/openChannel';
import {
	GroupChannel,
	GroupChannelCollection,
	GroupChannelFilter,
	GroupChannelListOrder,
	GroupChannelModule,
	MessageCollectionInitPolicy,
	MessageFilter,
	type GroupChannelCollectionEventHandler,
	type GroupChannelCollectionParams,
	type GroupChannelCreateParams,
	type GroupChannelEventContext,
	type MessageEventContext
} from '@sendbird/chat/groupChannel';
import { PUBLIC_SENDBIRD_APP_ID } from '$env/static/public';
import { get, writable, type Writable } from 'svelte/store';
import type { BaseMessage } from '@sendbird/chat/message';

export const sb = SendbirdChat.init({
	appId: PUBLIC_SENDBIRD_APP_ID,
	modules: [new OpenChannelModule(), new GroupChannelModule()]
});

export const currentUserStore: Writable<User | null> = writable(null);
export const groupChannelsStore: Writable<GroupChannel[]> = writable([]);
export const messagesStore: Writable<BaseMessage[]> = writable([]);

export const currentChannelStore: Writable<GroupChannel | null> = writable(null);

const channelHandlers = {
	onChannelsAdded: (context: GroupChannelEventContext, channels: BaseChannel[]) => {
		// console.log('onChannelsAdded:', channels);
		let savedGroupChannels = get(groupChannelsStore);
		let changedGroupChannel = false;

		for (const channel of channels) {
			console.log('channelHandlers onChannelsAdded channel:', channel.url);
			if (channel.channelType === ChannelType.GROUP) {
				let groupChannel = channel as GroupChannel;
				savedGroupChannels = savedGroupChannels.concat(groupChannel);
				changedGroupChannel = true;
			} else {
				console.warn('TODO: handle open channel');
			}
		}

		if (changedGroupChannel) {
			// sort by last message timestamp
			savedGroupChannels.sort((a, b) => {
				const aLastMessage = a.lastMessage?.createdAt || 0;
				const bLastMessage = b.lastMessage?.createdAt || 0;
				return bLastMessage - aLastMessage;
			});

			groupChannelsStore.set(savedGroupChannels);
		}
	},
	onChannelsUpdated: (context: GroupChannelEventContext, channels: BaseChannel[]) => {
		// console.log('onChannelsUpdated:', channels);
		let savedGroupChannels = get(groupChannelsStore);
		let changedGroupChannel = false;
		for (const channel of channels) {
			console.log('channelHandlers onChannelsUpdated channel:', channel.url);
			if (channel.channelType === ChannelType.GROUP) {
				savedGroupChannels = savedGroupChannels.map((c) => {
					if (c.url === channel.url) {
						let groupChannel = channel as GroupChannel;
						console.log(
							'channelHandlers onChannelsUpdated channel:',
							groupChannel.url,
							'lastMessage:',
							groupChannel.lastMessage?.message
						);
						return groupChannel;
					}
					return c;
				});
				changedGroupChannel = true;
			} else {
				console.warn('TODO: handle open channel');
			}
		}

		if (changedGroupChannel) {
			// sort by last message timestamp
			savedGroupChannels.sort((a, b) => {
				const aLastMessage = a.lastMessage?.createdAt || 0;
				const bLastMessage = b.lastMessage?.createdAt || 0;
				return bLastMessage - aLastMessage;
			});

			groupChannelsStore.set(savedGroupChannels);
		}
	},
	onChannelsDeleted: (context: GroupChannelEventContext, channelUrls: string[]) => {
		console.log('channelHandlers onChannelsDeleted:', channelUrls);

		let savedGroupChannels = get(groupChannelsStore);
		let changedGroupChannel = false;

		for (const channelUrl of channelUrls) {
			savedGroupChannels = savedGroupChannels.filter((c) => c.url !== channelUrl);
			changedGroupChannel = true;
		}

		if (changedGroupChannel) {
			groupChannelsStore.set(savedGroupChannels);
		}
	}
};

const messageHandlers = {
	onChannelUpdated: (context: GroupChannelEventContext, channel: GroupChannel) => {
		console.log('messageHandlers onChannelUpdated:', channel.url);
	},
	onChannelDeleted: (context: GroupChannelEventContext, channelUrl: string) => {
		console.log('messageHandlers onChannelDeleted:', channelUrl);
	},
	onMessagesAdded: (
		context: MessageEventContext,
		channel: GroupChannel,
		messages: BaseMessage[]
	) => {
		console.log('onMessagesAdded:', channel.url);
		for (const message of messages) {
			console.log('onMessagesAdded:', message);
		}
		messages = messages.reverse();
		addMessages(messages);
	},
	onMessagesUpdated: (
		context: MessageEventContext,
		channel: GroupChannel,
		messages: BaseMessage[]
	) => {
		console.log('onMessagesUpdated:', channel.url);
		for (const message of messages) {
			console.log('onMessagesUpdated:', message);
		}
	},
	// As messageIds was deprecated since v4.3.1., use messages instead.
	onMessagesDeleted: (
		context: MessageEventContext,
		channel: GroupChannel,
		messageIds: number[],
		messages: BaseMessage[]
	) => {
		console.log('onMessagesDeleted:', channel.url);
		for (const message of messages) {
			console.log('onMessagesDeleted:', message.message);
		}
	},
	onHugeGapDetected: () => {
		console.log('onHugeGapDetected');
	}
};

export async function connectSendbird(userId: string, accessToken: string): Promise<User> {
	try {
		// TODO: accessToken has expired, need to refresh
		const user = await sb.connect(userId, accessToken);
		await sb.setChannelInvitationPreference(true);
		// console.log('Connected to Sendbird user:', user);

		currentUserStore.set(user);

		await loadGroupChannels(channelHandlers);
		return user;
	} catch (error) {
		console.error('Sendbird connection failed', error);
		throw error;
	}
}

export async function createGroupChannel(
	channelName: string,
	userIds: string[]
): Promise<GroupChannel> {
	try {
		const params: GroupChannelCreateParams = {
			invitedUserIds: userIds,
			name: channelName,
			operatorUserIds: userIds,
			isDistinct: true // if true, returns existing channel when created with the same member composition
		};
		const channel = await sb.groupChannel.createChannel(params);
		// console.log('Group channel created:', channel);
		console.log('Group channel created:', channel.url);
		return channel;
	} catch (error) {
		console.error('Group channel creation failed', error);
		throw error;
	}
}

async function loadGroupChannels(handlers: GroupChannelCollectionEventHandler): Promise<void> {
	try {
		const groupChannelFilter: GroupChannelFilter = new GroupChannelFilter();
		groupChannelFilter.includeEmpty = true; // Group channels with no messages will be included.

		const params: GroupChannelCollectionParams = {
			filter: groupChannelFilter,
			order: GroupChannelListOrder.LATEST_LAST_MESSAGE
		};
		const collection: GroupChannelCollection = sb.groupChannel.createGroupChannelCollection(params);
		collection.setGroupChannelCollectionHandler(handlers);

		const channels = await collection.loadMore();
		console.log(
			'loadGroupChannels() channels:',
			channels.map((c) => c.url)
		);
		groupChannelsStore.set(channels);
	} catch (error) {
		console.error('loadGroupChannels() Failed to load channels', error);
		throw error;
	}
}

async function addMessages(newMessages: BaseMessage[]): Promise<void> {
	try {
		let messages = get(messagesStore);
		messages = messages.concat(newMessages);
		messagesStore.set(messages);
	} catch (error) {
		console.error('addMessages() Failed to add messages', error);
		throw error;
	}
}

export async function loadMessages(channel: GroupChannel, startingPoint: number): Promise<void> {
	try {
		if (!channel) {
			console.error('channel is missing');
			return;
		}
		console.log('loadMessages() channel:', channel);
		console.log('loadMessages() startingPoint:', startingPoint);
		const messageFilter = new MessageFilter();

		const collection = channel.createMessageCollection({
			filter: messageFilter,
			startingPoint: startingPoint,
			prevResultLimit: 5,
			nextResultLimit: 0
		});

		const onCacheResult = (err: Error | null, messages: BaseMessage[] | null) => {
			console.log('onCacheResult:', err, messages);
		};

		const onApiResult = (err: Error | null, messages: BaseMessage[] | null) => {
			console.log('onApiResult:', err, messages);
			if (err) {
				console.error('Failed to load messages', err);
				return;
			}
			if (!messages) {
				console.log('No messages');
				return;
			}
			messages = messages.reverse();
			addMessages(messages);
		};

		collection.setMessageCollectionHandler(messageHandlers);
		collection
			.initialize(MessageCollectionInitPolicy.CACHE_AND_REPLACE_BY_API)
			.onCacheResult(onCacheResult)
			.onApiResult(onApiResult);
	} catch (error) {
		console.error('loadMessages() Failed to load messages', error);
		throw error;
	}
}

export async function setCurrentChannel(channel: GroupChannel | undefined): Promise<void> {
	try {
		const currentChannel = get(currentChannelStore);
		if (currentChannel && channel && channel.url === currentChannel.url) {
			// console.log('setCurrentChannel() channel is already set:', channel.url);
			return;
		}
		// clear old messages
		messagesStore.set([]);

		if (channel) {
			currentChannelStore.set(channel);
			await loadMessages(channel, Date.now());
		} else {
			currentChannelStore.set(null);
		}
	} catch (error) {
		console.error('setCurrentChannel() Failed to set current channel', error);
		throw error;
	}
}

export async function loadUsers(): Promise<User[]> {
	try {
		const users = await sb.createApplicationUserListQuery().next();
		console.log('loadUsers() users:', users);
		return users;
	} catch (error) {
		console.error('loadUsers() Failed to load users', error);
		throw error;
	}
}
