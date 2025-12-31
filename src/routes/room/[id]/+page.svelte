<script module>
  import Device from 'svelte-device-info';
</script>

<script>
    import {supabase} from '$lib/supabase';

    /** @type {import('./$types').PageProps} */
    let { data } = $props();

    let user = Math.floor(Math.random()*9999)

    let device = null

    let mY = 0
	let progress = 0

	let users = $state([])
    let newState = $state({})

	if (!Device.isMobile && !Device.isPhone && !Device.isTablet) {
		device = 'desktop'
	}

    if (device != 'desktop') {
        
    }

    const raceChannel = supabase.channel(`race-channel:${data.id}`, {
        config: {
            presence: {
                key: user.toString(),
            },
        },
    });

    raceChannel
        .on('presence', { event: 'sync' }, () => {
            // LISTEN TO SYNC
            newState = raceChannel.presenceState()
            console.log('sync', newState)
            console.log(Object.entries(newState))
            console.log(Object.entries(newState).length)
            // users = []
            // for (const [key, value] of Object.entries(newState)) {
            //     if (value[0].device === 'mobile') {
            //         users.push({
            //             color : value[0].color,
            //             name: value[0].user
            //         })
            //     }
            // }
            // console.log(users, "USERS")
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            // LISTEN TO JOINED PLAYER
            console.log('join', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            // LISTEN TO LEFT PLAYER
            console.log('leave', key, leftPresences)
        })
        .subscribe(async (status) => {
            if (status !== 'SUBSCRIBED') { return }
            if (status === 'SUBSCRIBED') {
                await raceChannel.track({
                    user: data.player,
                    color: '#ff0000', // assign random color
                    device: device == "desktop" ? "desktop" : "mobile",
                    progress: 0
                })
            }
        })

    let lastSent = 0
    let throttle_ms = 50
    let y

    function deviceMotion(e) {
        const now = Date.now()
        if (now - lastSent > throttle_ms) {
            y = Math.floor(event.acceleration.y)
    
            progress += Math.abs(y)/100
            
            raceChannel.send({
                type: 'broadcast',
                event: 'progress',
                payload: { 
                    progress: progress, 
                    user: user.toString(),
                    name: data.player
                 },
            })
            lastSent = now
        }
	}

	raceChannel.on('broadcast', { event: 'progress' }, ({ payload }) => {
		let p = payload.progress
		let u = payload.user
        let n = payload.name

        // console.log(newState, "NEWSTATE")
        // console.log(newState[u], "USER ID")
        // console.log(newState[u][0].user, "NAME")
        if(newState[u]) {
            newState[u][0].progress = p
        }

		// let id = users.findIndex((item) => item[0].user == u)
		// if (id != -1) {
		// 	users[id][0].progress = p
		// }
        // console.log(payload)
	})
</script>

<svelte:window on:devicemotion={deviceMotion}></svelte:window>


<nav>
    <h1>{data.name} - {data.id}</h1>
</nav>

{#if Object.entries(newState).length == 0}
	<h2>No other users connected</h2>
{:else if Object.entries(newState).length > 0}
    {#each Object.entries(newState) as [key, value]}
        {#if value[0].device == 'mobile'}
            <h2>{value[0].user}</h2>
            <h2>Progress: {Math.floor(value[0].progress)}</h2>
        {/if}
    {/each}
{/if}


<style>
    :global(body) {
        margin:0;
        width:100%;
        display: block;
    }
    nav {
        width:100%;
        display: flex;
        justify-content: center;
        background-color: black;
    }
    h1 {
        font-family: 'Geo', sans-serif;
        color:white;
    }
    h2 {
        font-family: 'Geo', sans-serif;
        color:black;
    }
</style>