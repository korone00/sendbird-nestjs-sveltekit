<script lang="ts">
	import { currentUserStore } from '$lib/chat/sendbird';
	import type { BaseMessage, FileMessage } from '@sendbird/chat/message';
	import { Avatar, Label } from 'flowbite-svelte';

	let myMessage: boolean = false;
	$: currentUser = $currentUserStore;
	$: {
		if (currentUser && fileMessage.sender.userId === currentUser.userId) {
			myMessage = true;
		} else {
			myMessage = false;
		}
	}
	export let message: BaseMessage;
	$: fileMessage = message as FileMessage;
</script>

{#if myMessage}
	<div class="flex w-full flex-row items-end space-x-2 space-y-2 p-2">
		<Label class="items-end text-xs">{new Date(message.createdAt).toLocaleTimeString()}</Label>
		<div class="rounded-lg">
			{#if fileMessage.type === 'image/jpeg' || fileMessage.type === 'image/png'}
				<img src={fileMessage.url} alt="" class="rounded-lg" />
			{:else}
				<a href={fileMessage.url} target="_blank">{fileMessage.name}</a>
			{/if}
		</div>
	</div>
{:else}
	<div class="flex w-full flex-row space-x-2 space-y-2 p-2">
		<div>
			<Avatar id="user-drop" class="" src={fileMessage.sender.profileUrl} />
		</div>
		<div class="flex flex-col">
			<div>{fileMessage.sender.nickname}</div>
			<div class="flex flex-row space-x-2">
				<div class="rounded-lg {myMessage ? 'bg-blue-500 text-white' : 'bg-gray-400'} p-2">
					{#if fileMessage.type === 'image/jpeg' || fileMessage.type === 'image/png'}
						<img src={fileMessage.url} alt="" />
					{:else}
						<a href={fileMessage.url} target="_blank">{fileMessage.name}</a>
					{/if}
				</div>
				<div class="flex items-end">
					<Label class="text-xs">{new Date(fileMessage.createdAt).toLocaleTimeString()}</Label>
				</div>
			</div>
		</div>
	</div>
{/if}
