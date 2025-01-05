<script lang="ts">
	import { groupChannelsStore } from '$lib/chat/sendbird';
	import { GroupChannel } from '@sendbird/chat/groupChannel';
	import GroupChannelItem from './GroupChannelItem.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	$: channels = $groupChannelsStore;

	function handleAddChannel() {
		dispatch('addChannel');
	}

	function handleSelect(event: CustomEvent<GroupChannel>) {
		dispatch('select', event.detail);
		// console.log('handleSelect() selected:', event.detail);
	}
</script>

<div class="h-full border border-gray-300 bg-gray-100 bg-white">
	<div class="flex items-center justify-between border-b border-gray-300 bg-gray-100 p-2">
		<div>Channels</div>
		<div>
			<button on:click={handleAddChannel}
				><img src="/chat/add-channel.png" width="32" height="32" alt="" /></button
			>
		</div>
	</div>
	<div class="flex flex-col">
		{#each channels as channel}
			<GroupChannelItem {channel} on:select={handleSelect} />
		{/each}
	</div>
</div>
