<script module>
  import Device from 'svelte-device-info';
</script>

<script>
    import {supabase} from '$lib/supabase';

    /** @type {import('./$types').PageProps} */
    let { data } = $props();

    let user = Math.floor(Math.random()*9999)

    let device = $state(null)

    let color = $state([
        {
            // blue
            c:"#00BBE4",
            a:false,
        },
        {
            // red
            c:"#FD4231",
            a:false,
        },
        {
            // green
            c:"#00DB51",
            a:false,
        },
        {
            // purple
            c:"#C239C9",
            a:false,
        }
        
    ])

    let mY = 0
	let progress = 0

	let users = $state([])
    let newState = $state({})

	if (!Device.isMobile && !Device.isPhone && !Device.isTablet) {
		device = 'desktop'
	} else if (Device.isMobile) {
        device = 'mobile'
    } else if (Device.isPhone) {
        device = 'mobile'
    } else if (Device.isTablet) {
        device = 'tablet'
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
                    color: color[Math.floor(Math.random()*4)],
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

    raceChannel.on('broadcast', {event: 'color'}, ({payload}) => {
        let c = payload.color
        let u = payload.user

        if(newState[u]) {
            newState[u][0].color = c
        }
    })

    function selectColor(e) {
        let i = e.target.dataset.index
        color.forEach(c => {
            c.a = false
        })
        color[i].a = true

        raceChannel.send({
            type: 'broadcast',
            event: 'color',
            payload: {  
                user: user.toString(),
                name: data.player,
                color: color[i].c
                },
        })
    }
</script>

<svelte:window on:devicemotion={deviceMotion}></svelte:window>


<nav>
    <h1>{data.name} - {data.id}</h1>
</nav>

{#if Object.entries(newState).length == 0}
	<h2>No other users connected</h2>
{:else if Object.entries(newState).length > 0}
    {#each Object.entries(newState).slice(0,2) as [key, value]}
        {#if value[0].device == 'mobile'}
            <div class="square-player" style:background-color={value[0].user}></div>
            <h2>{value[0].user}</h2>
            <h2>Progress: {Math.floor(value[0].progress)}</h2>
        {/if}
    {/each}
    {device}
{/if}

{#if device == 'mobile'}
    <p>pick color</p>
    <div class="color-container">
        {#each color as c,i}
            <div class="square" 
                data-selected={c.a}
                data-index={i}
                class:selected={c.a}
                style:background-color={c.c}
                onclick={selectColor}
            ></div>
        {/each}
    </div>
    <button>START</button>
{:else if device == 'desktop'}
    <p>DESKTOP</p>
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
    p {
        font-family: 'Geo', sans-serif;
        color:black;
    }
    .color-container {
        display: flex;
        width:320px;
        justify-content: space-around;
    }
    .square {
        width:60px;
        height:60px;
        box-sizing: border-box;
        border-radius: 0.5rem;
    }
    .selected {
        border: solid 2px black;
    }
    .square-player {
        width:1rem;
        height:1rem;
    }
</style>