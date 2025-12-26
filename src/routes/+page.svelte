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
	function messageReceived(payload) {
		console.log(payload, "message received")
	}

	const userStatus = {
		user: user,
		online_at: new Date().toISOString(),
	}

	myChannel
		.subscribe(async (status) => {
			if (status !== 'SUBSCRIBED') { return }
				const presenceTrackStatus = await myChannel.track(userStatus)
				console.log(presenceTrackStatus)
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

	function mousemove(e) {
		// if (progress <= path.getTotalLength()) {
			mY = e.movementY
			progress += Math.abs(mY)/100
			// console.log(parseInt(progress))
			// xPos = path.getPointAtLength(progress).x
			// yPos = path.getPointAtLength(progress).y
		// }
	}

</script>

<svelte:body on:mousemove={mousemove}></svelte:body>

<style>
	:global(body) {
		margin: 0;
		padding:0;
		width:100%;
		height: 100vh;
	}
</style>
