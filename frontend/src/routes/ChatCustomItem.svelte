<script lang="ts">
	import { currentUserStore } from '$lib/chat/sendbird';
	import type { BaseMessage, UserMessage } from '@sendbird/chat/message';
	import { Avatar, Button, Label } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let myMessage: boolean = false;
	$: currentUser = $currentUserStore;
	$: {
		if (currentUser && userMessage.sender.userId === currentUser.userId) {
			myMessage = true;
		} else {
			myMessage = false;
		}
	}
	export let message: BaseMessage;
	$: userMessage = message as UserMessage;
	let messageData: Record<string, any> = {};
	$: {
		if (message.data) {
			messageData = JSON.parse(message.data);
		}
	}

	function handleTest() {
		console.log('handleTest()', messageData);
		dispatch('test', messageData);
	}
</script>

{#if myMessage}
	<div class="flex w-full flex-row items-end justify-end space-x-2 space-y-2 p-2">
		<div class="flex items-end">
			<Label class="text-xs">{new Date(userMessage.createdAt).toLocaleTimeString()}</Label>
		</div>
		<div class="max-w-[70%] break-words rounded-lg bg-blue-500 p-2 text-white">
			{#each Object.keys(messageData) as key}
				<div>{key}: {messageData[key]}</div>
			{/each}
			<Button on:click={handleTest}>TEST</Button>
		</div>
	</div>
{:else}
	<div class="flex w-full flex-row space-x-2 space-y-2 p-2">
		<div>
			<Avatar id="user-drop" class="" src={userMessage.sender.profileUrl} />
		</div>
		<div class="flex flex-col">
			<div>{userMessage.sender.nickname}</div>

			<div class="flex flex-row space-x-2">
				<div class="max-w-[70%] break-words rounded-lg bg-gray-400 p-2">
					{#each Object.keys(messageData) as key}
						<div>{key}: {messageData[key]}</div>
					{/each}

					<Button on:click={handleTest}>TEST</Button>
				</div>
				<div class="flex items-end">
					<Label class="text-xs">{new Date(userMessage.createdAt).toLocaleTimeString()}</Label>
				</div>
			</div>
		</div>
	</div>
{/if}
