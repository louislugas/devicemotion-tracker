<script>
	let user = Math.floor(Math.random()*9999)


	import {supabase} from '$lib/supabase';

	let mY = 0
	let progress = 0
	let path
	let xPos
	let yPos

	const myChannel = supabase.channel('test-channel');

	// Simple function to log any messages we receive
	// function messageReceived(payload) {
	// 	console.log(payload, "message received")
	// }

	const userStatus = {
		user: user,
		online_at: new Date().toISOString(),
	}

	myChannel
		.subscribe(async (status) => {
			if (status !== 'SUBSCRIBED') { return }
			if (status === 'SUBSCRIBED') {
				await myChannel.track({
					user: crypto.randomUUID(),
					color: '#ff0000', // assign random color
				})
			}
		})

	myChannel
		.on('presence', { event: 'sync' }, () => {
			const newState = myChannel.presenceState()
			console.log('sync', newState)
		})
		.on('presence', { event: 'join' }, ({ key, newPresences }) => {
			console.log('join', key, newPresences)
		})
		.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
			console.log('leave', key, leftPresences)
		})
		.subscribe()

	// Subscribe to the Channel
	// myChannel
	// 	.on(
	// 		'broadcast',
	// 		{ event: 'shout' }, // Listen for "shout". Can be "*" to listen to all events
	// 		(payload) => messageReceived(payload)
	// 	)
	// 	.subscribe()

	// Send a test message
	// myChannel
	// 	.send({
	// 		type: 'broadcast',
	// 		event: 'shout',
	// 		payload: { message: 'Hi' , userId: user},
	// 	})
	// 	.then((resp) => console.log(resp))

	let lastSent = 0

	// function mousemove(e) {
	// 	// if (progress <= path.getTotalLength()) {
	// 		mY = e.movementY
	// 		progress += Math.abs(mY)/100
			
	// 		const now = Date.now()
	// 		if (now - lastSent < 16) return // ~60fps
	// 		lastSent = now

	// 		myChannel.send({
	// 			type: 'broadcast',
	// 			event: 'progress',
	// 			payload: { progress: progress, user: user },
	// 		})
	// 	// }
	// }

	function click() {
		myChannel.send({
			type: 'broadcast',
			event: 'progress',
			payload: { user: user },
		})
	}

	let x
	let y
	let z

	function deviceMotion(e) {
		x = event.acceleration.x
		y = event.acceleration.y
		z = event.acceleration.z

		progress += Math.abs(y)/100
		
		myChannel.send({
			type: 'broadcast',
			event: 'progress',
			payload: { progress: progress, user: user },
		})
	}

	myChannel.on('broadcast', { event: 'progress' }, ({ payload }) => {
		console.log(payload)
	// update UI cursor for that user
	})

	// const cursors = new Map()

	// myChannel.on('broadcast', { event: 'progress' }, ({ payload, sender }) => {
	// 	cursors.set(sender, payload)
	// })

</script>

<!-- <svelte:body on:mousemove={mousemove}></svelte:body> -->

<svelte:window on:devicemotion={deviceMotion}></svelte:window>

<h1>USER: {user}</h1>
<h2>Progress: {progress}</h2>
<h3>x: {x}</h3>
<h3>y: {y}</h3>
<h3>z: {z}</h3>
<button on:click={click}>click</button>

<style>
	:global(body) {
		margin: 0;
		padding:0;
		width:100%;
		height: 100vh;
	}
</style>
