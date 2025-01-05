<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Input, Label } from 'flowbite-svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="login" />
</svelte:head>

<section class="mx-auto flex min-h-screen items-center justify-center">
	<div class="flex flex-col">
		<Card class="flex w-96 flex-col space-y-6 py-8">
			<h3 class="p-0 text-xl font-medium text-gray-900 dark:text-white">Login</h3>

			<form method="POST" action="?/login" use:enhance>
				<Label class="space-y-2">
					<span>Username</span>
					<Input type="text" name="username" placeholder="Enter your username" required />
				</Label>
				<Label class="mt-2 space-y-2">
					<span>Password</span>
					<Input type="password" name="password" placeholder="Enter your password" required />
				</Label>

				{#if form?.error}
					<Label class="space-y-2">
						<span class="text-red-500">{form.error}</span>
					</Label>
				{/if}
				<Button type="submit" class="mt-4 w-full">Login</Button>
			</form>

			<div class="flex justify-end">
				<Label><a href="/register">Register</a></Label>
			</div>
		</Card>
	</div>
</section>
