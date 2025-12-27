<script context="module">
  import Device from 'svelte-device-info';
</script>

<script>
	let user = Math.floor(Math.random()*9999)
	let device = null

	if (!Device.isMobile && !Device.isPhone && !Device.isTablet) {
		device = 'desktop'
	}

	import {supabase} from '$lib/supabase';
    import { dev } from '$app/environment';

	let mY = 0
	let progress = 0
	let path
	let xPos
	let yPos

	let users = []

	const myChannel = supabase.channel('test-channel', {
		config: {
			presence: {
				key: user.toString(),
			},
		},
	});

	myChannel
		.on('presence', { event: 'sync' }, () => {
			const newState = myChannel.presenceState()
			console.log('sync', newState)
			users = Object.values(newState).filter(d => d[0].user.length <= 4)
			console.log(users)
		})
		.on('presence', { event: 'join' }, ({ key, newPresences }) => {
			console.log('join', key, newPresences)
		})
		.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
			console.log('leave', key, leftPresences)
		})
		.subscribe(async (status) => {
			if (status !== 'SUBSCRIBED') { return }
			if (status === 'SUBSCRIBED') {
				await myChannel.track({
					user: user.toString(),
					color: '#ff0000', // assign random color
					device: device == "desktop" ? "desktop" : "mobile",
				})
			}
		})

	let lastSent = 0

	function click() {
		myChannel.send({
			type: 'broadcast',
			event: 'progress',
			payload: { user: user },
		})
	}

	let y

	function deviceMotion(e) {
		y = Math.floor(event.acceleration.y)

		progress += Math.abs(y)/100
		
		myChannel.send({
			type: 'broadcast',
			event: 'progress',
			payload: { progress: progress, user: user },
		})
	}

	let data

	myChannel.on('broadcast', { event: 'progress' }, ({ payload }) => {
		// console.log(payload)
		let p = payload.progress
		let u = payload.user

		let id = users.findIndex((item) => item[0].user == u)
		if (id != -1) {
			users[id][0].progress = p
		}

	// update UI cursor for that user
	})

	// const cursors = new Map()

	// myChannel.on('broadcast', { event: 'progress' }, ({ payload, sender }) => {
	// 	cursors.set(sender, payload)
	// })

</script>

<!-- <svelte:body on:mousemove={mousemove}></svelte:body> -->

<svelte:window on:devicemotion={deviceMotion}></svelte:window>

<h1>your ID: {user}</h1>
<h2>Device: {device}</h2>
<br>
{#if users.length == 0}
	<h2>No other users connected</h2>
{:else if users.length > 0}
	{#each users as u}
		{#if u[0].device == 'mobile'}
			<h1>USER: {u[0].user}</h1>
			<h2>Progress: {u[0].progress ? u[0].progress : 0}</h2>
		{/if}
	{/each}
{/if}
<style>
	:global(body) {
		margin: 0;
		padding:0;
		width:100%;
		height: 100vh;
	}
</style>
