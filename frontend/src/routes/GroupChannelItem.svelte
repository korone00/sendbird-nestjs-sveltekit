<script lang="ts">
	import { timestampToTime } from '$lib/util';
	import type { GroupChannel } from '@sendbird/chat/groupChannel';
	import { Label } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export let channel: GroupChannel;

	function handleSelect(channel: GroupChannel) {
		dispatch('select', channel);
		// console.log('handleSelect() selected:', channel);
	}
</script>

<button
	type="button"
	class="flex w-full cursor-pointer flex-row space-x-2 border-b border-gray-300 bg-gray-100 p-2"
	on:click={() => handleSelect(channel)}
>
	<div class="shrink-0">
		<img src={channel.coverUrl} alt={channel.name} class="h-10 w-10 rounded-full" />
	</div>

	<div class="flex min-w-0 flex-1 flex-col">
		<!-- 상단: 채널명, 인원수, 날짜 -->
		<div class="flex w-full flex-row items-center justify-between">
			<div class="flex flex-row items-center overflow-hidden">
				<span class="truncate"><b>{channel.name}</b></span>
				<Label class="ml-2 whitespace-nowrap text-xs text-gray-500">
					{channel.memberCount}
				</Label>
			</div>
			<Label class="whitespace-nowrap text-xs text-gray-500">
				{#if channel.lastMessage?.createdAt}
					{timestampToTime(channel.lastMessage.createdAt)}
				{:else}
					{timestampToTime(channel.createdAt)}
				{/if}
			</Label>
		</div>

		<!-- 하단: 메시지 영역 -->
		<div class="mt-1 flex w-full min-w-0 text-gray-500">
			<div class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
				{#if channel.lastMessage?.message}
					{channel.lastMessage.message}
				{:else}
					&nbsp;
				{/if}
			</div>
		</div>
	</div>
</button>
