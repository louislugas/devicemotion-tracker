<script>
	let user = Math.floor(Math.random()*9999)

	import {supabase} from '$lib/supabase';

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
			users = Object.values(newState)
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
		data = payload
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
<br>
{#each users as user}
	<h1>USER: {user.user}</h1>
	<!-- <h2>Progress: {data.user == user.user ? data.progress : 0}</h2> -->
{/each}

<style>
	:global(body) {
		margin: 0;
		padding:0;
		width:100%;
		height: 100vh;
	}
</style>
