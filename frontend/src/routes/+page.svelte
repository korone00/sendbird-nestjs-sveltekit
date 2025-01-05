<script lang="ts">
	import { onMount } from 'svelte';
	import {
		connectSendbird,
		createGroupChannel,
		loadUsers,
		sb,
		setCurrentChannel
	} from '$lib/chat/sendbird';
	import { type GroupChannel } from '@sendbird/chat/groupChannel';
	import GroupChannels from './GroupChannels.svelte';
	import ChatArea from './ChatArea.svelte';
	import { Button, Checkbox, Modal } from 'flowbite-svelte';
	import type { User } from '@sendbird/chat';

	export let data: any;
	let currentUserId = '';
	let currentUserToken = '';
	let currentChannel: GroupChannel | undefined = undefined;
	let showCreateGroupChannel = false;
	let users: User[] = [];
	let selectedUsers = new Set<string>();

	onMount(async () => {
		currentUserId = data.currentUserId;
		currentUserToken = data.currentUserToken;
		console.log('currentUserId:', currentUserId);
		console.log('currentUserToken:', currentUserToken);
		if (!currentUserId || !currentUserToken) {
			console.error('currentUserId or currentUserToken is missing');
			return;
		}

		try {
			const user = await connectSendbird(currentUserId, currentUserToken);
			console.log('Connected user:', user);
		} catch (err) {
			console.error('onMount() error:', err);
		}
	});

	async function handleAddChannel() {
		console.log('handleAddChannel()');

		users = await loadUsers();
		showCreateGroupChannel = true;
	}

	async function handleSelectGroupChannel(event: CustomEvent<GroupChannel>) {
		console.log('handleSelectGroupChannel() selected:', event.detail);
		currentChannel = event.detail;

		setCurrentChannel(currentChannel);
	}

	function handleUserSelect(userId: string) {
		if (selectedUsers.has(userId)) {
			selectedUsers.delete(userId);
		} else {
			selectedUsers.add(userId);
		}
	}

	async function handleCreate() {
		console.log('Selected user IDs:', Array.from(selectedUsers));
		showCreateGroupChannel = false;

		if (selectedUsers.size === 0) {
			console.error('No user selected');
			return;
		}

		const channelName = 'Group channel';
		const userIds = Array.from(selectedUsers);
		selectedUsers.clear();

		currentChannel = await createGroupChannel(channelName, userIds);
		setCurrentChannel(currentChannel);
	}

	async function handleLeaveChannel(event: CustomEvent<GroupChannel>) {
		const channel = event.detail;
		console.log('handleLeaveChannel() channel:', channel);
		await channel.leave();
		currentChannel = undefined;
		setCurrentChannel(currentChannel);
	}
</script>

<Modal title="Create group channel" bind:open={showCreateGroupChannel} size="xs" autoclose>
	<p class="text-sm font-normal text-gray-500 dark:text-gray-400">Create a new group channel</p>
	<ul class="my-4 space-y-3">
		{#each users as user}
			{#if user.userId !== sb.currentUser?.userId}
				<li>
					<div
						class="group flex w-full items-center space-x-2 rounded-lg bg-gray-50 p-3 text-base font-bold text-gray-900 hover:bg-gray-100 hover:shadow dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
					>
						<Checkbox on:change={() => handleUserSelect(user.userId)} />
						<div>
							<img src={user.profileUrl} alt={user.nickname} class="h-8 w-8 rounded-full" />
						</div>
						<div>{user.nickname}</div>
					</div>
				</li>
			{/if}
		{/each}
	</ul>
	<svelte:fragment slot="footer">
		<Button on:click={handleCreate}>Create</Button>
		<Button color="alternative" on:click={() => (showCreateGroupChannel = false)}>Cancel</Button>
	</svelte:fragment>
</Modal>

<div class="flex h-screen w-full">
	<div class="h-full w-2/6">
		<GroupChannels on:addChannel={handleAddChannel} on:select={handleSelectGroupChannel} />
	</div>
	<div class="flex h-screen w-4/6 flex-col bg-gray-200">
		{#if currentChannel}
			<ChatArea channel={currentChannel} on:leave={handleLeaveChannel} />
		{:else}
			<div></div>
		{/if}
	</div>
</div>
