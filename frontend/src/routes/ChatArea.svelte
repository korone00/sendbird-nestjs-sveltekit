<script lang="ts">
	import { messagesStore } from '$lib/chat/sendbird';
	import type { GroupChannel } from '@sendbird/chat/groupChannel';
	import { Avatar, Button, Dropdown, Toggle } from 'flowbite-svelte';
	import { MessageType, Sender, type UserMessageCreateParams } from '@sendbird/chat/message';
	import ChatUserItem from './ChatUserItem.svelte';
	import ChatFileItem from './ChatFileItem.svelte';
	import { createEventDispatcher, tick } from 'svelte';
	import ChatCustomItem from './ChatCustomItem.svelte';

	const dispatch = createEventDispatcher();
	export let channel: GroupChannel;
	$: messages = $messagesStore;

	let prevDate: Date | undefined = undefined;
	let chatAreaRef: HTMLDivElement;
	let messageInput = '';

	function isDifferentDate(d1: Date): boolean {
		if (!prevDate) {
			prevDate = d1;
			return true;
		}
		// console.log('d1', d1.getFullYear(), d1.getMonth(), d1.getDate());
		const retn =
			d1.getFullYear() !== prevDate.getFullYear() ||
			d1.getMonth() !== prevDate.getMonth() ||
			d1.getDate() !== prevDate.getDate();
		prevDate = d1;

		return retn;
	}

	function handleLoadMore() {
		console.log('Load more messages');
		dispatch('loadMore');
	}

	function handleLeave() {
		console.log('handleLeave()', channel);
		dispatch('leave', channel);
	}

	async function sendMessage() {
		if (!messageInput.trim()) {
			messageInput = '';
			return;
		}

		channel
			.sendUserMessage({ message: messageInput })
			.onSucceeded((sentMessage) => {
				console.log('onSucceeded:', sentMessage);

				messageInput = '';
			})
			.onFailed((error) => {
				console.error('onFailed:', error);
			});
	}

	async function sendFile() {
		// Create a hidden file input element
		const input = document.createElement('input');
		input.type = 'file';
		input.style.display = 'none';
		document.body.appendChild(input);

		// Handle file selection
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) {
				console.error('file is missing');
				return;
			}

			channel
				.sendFileMessage({ file: file })
				.onSucceeded((sentMessage) => {
					console.log('onSucceeded:', sentMessage);
				})
				.onFailed((error) => {
					console.error('onFailed:', error);
				});

			// Clean up
			document.body.removeChild(input);
		};

		// Trigger file selection dialog
		input.click();
	}

	async function sendCustom() {
		console.log('sendCustom()');

		const params: UserMessageCreateParams = {
			message: 'game',
			customType: 'game',
			data: JSON.stringify({
				game: 'chess',
				level: 3
			})
		};
		channel
			.sendUserMessage(params)
			.onSucceeded((sentMessage) => {
				console.log('onSucceeded:', sentMessage);

				messageInput = '';
			})
			.onFailed((error) => {
				console.error('onFailed:', error);
			});
	}

	async function scrollToBottom() {
		if (chatAreaRef) {
			chatAreaRef.scrollTo({
				top: chatAreaRef.scrollHeight,
				behavior: 'smooth' // or 'auto'
			});
		}
	}

	$: if (messages.length) {
		tick().then(() => {
			scrollToBottom();
		});
	}

	function handleTest(event: CustomEvent) {
		console.log('handleTest()', event.detail);
	}
</script>

<div class="flex h-screen w-full flex-col">
	<div class="flex flex-row items-center justify-between border-b border-gray-300 bg-gray-100 p-2">
		<div class="flex flex-row items-center space-x-2">
			<div>
				<Avatar id="user-drop" class="" src={channel.coverUrl} />
			</div>
			<div>
				{channel.name}
			</div>
		</div>
		<div>
			<button><img src="/chat/channel-info.png" width="32" height="32" alt="" /></button>
			<Dropdown class="w-56 space-y-1 p-3">
				<li>
					<Toggle class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">Notification</Toggle>
				</li>
				<li>
					<Button class="btn" on:click={handleLeave}>Leave</Button>
				</li>
			</Dropdown>
		</div>
	</div>

	<div bind:this={chatAreaRef} class="flex-1 overflow-y-auto">
		<div class="flex flex-col space-y-2">
			<div class="flex justify-center">
				<button
					class="cursor-pointer text-blue-500 hover:text-blue-700"
					on:click={() => handleLoadMore()}>Load More</button
				>
			</div>

			{#each messages as message}
				{#if isDifferentDate(new Date(message.createdAt))}
					<div class="flex justify-center">
						<span>
							{new Date(message.createdAt).toLocaleDateString()}
						</span>
					</div>
				{/if}

				{#if message.messageType === MessageType.USER}
					{#if message.customType === 'game'}
						<ChatCustomItem {message} on:test={handleTest} />
					{:else}
						<ChatUserItem {message} />
					{/if}
				{:else if message.messageType === MessageType.FILE}
					<ChatFileItem {message} />
				{/if}
			{/each}
		</div>
	</div>

	<div class="bg-white p-2 shadow">
		<div class="flex flex-row items-center space-x-2">
			<input
				type="text"
				class="w-full"
				bind:value={messageInput}
				on:keypress={(e) => e.key === 'Enter' && sendMessage()}
			/>
			<Button class="btn" on:click={sendMessage}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="22" y1="2" x2="11" y2="13"></line>
					<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
				</svg>
			</Button>
			<Button class="btn" on:click={sendFile}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
					></path>
				</svg>
			</Button>
			<Button class="btn" on:click={sendCustom}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="8" r="4"></circle>
					<path d="M12 14v3"></path>
					<circle cx="12" cy="20" r="2"></circle>
					<path d="M15.7 9.3a4 4 0 0 0-7.4 0"></path>
				</svg>
			</Button>
		</div>
	</div>
</div>
