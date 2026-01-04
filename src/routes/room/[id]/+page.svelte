<script module>
  import Device from 'svelte-device-info';
</script>

<script>
    import {supabase} from '$lib/supabase';
    import { onMount } from 'svelte';

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

    let isSupported = $state(false);

    onMount(() => {
        if ('wakeLock' in navigator) {
        isSupported = true;
        console.log('Screen Wake Lock API supported!');
        acquireLock()
        } else {
        console.log('Wake lock is not supported by this browser.');
        }
    });

    let wakeLock = $state(null)
    let isWakeLocked = $state(false)
    let statusMessage = 'Screen is allowed to sleep.'

    // Function to acquire the wake lock
    async function acquireLock() {
        if (!isSupported) return;

        try {
            // The request() method is Promise-based and needs to be awaited
            wakeLock = await navigator.wakeLock.request('screen');
            isWakeLocked = true;
            statusMessage = 'Wake Lock is active!';

            // Listen for the 'release' event, which can happen automatically (e.g., browser minimized)
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock was released');
                isWakeLocked = false;
                statusMessage = 'Wake Lock was released by the system.';
            });

        } catch (err) {
            // The request failed (e.g., due to low battery, or user denied)
            statusMessage = `${err.name}: ${err.message}`;
        }
    }

    // Function to release the wake lock manually
    async function releaseLock() {
        if (wakeLock) {
            await wakeLock.release(); // This is a Promise
            wakeLock = null;
            isWakeLocked = false;
            statusMessage = 'Wake Lock manually released.';
        }
    }

    let gameStart = $state(false)
    let realStart = $state(false)
    let countDown = $state(3)

    let mY = 0
	let progress = 0

    let svgW = $state(0), svgH = $state(0)

	let users = $state([])
    let newState = $state({})

    let xPos = $state(0)
    let yPos = $state(0)
    let path = $state(null)
    let win = $state(false)
    let winner = $state(null)

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
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms' }, // Listen to all events in the 'todos' table
            (payload) => {
                console.log('Change received!', payload);
                gameStart = payload.new.start
                let countInterval = setInterval(() => {
                    if (countDown > 1) {
                        countDown--
                    } else {
                        clearInterval(countInterval)
                        realStart = true
                    }
                }, 1000)
            }
        )
        .subscribe(async (status) => {
            if (status !== 'SUBSCRIBED') { return }
            if (status === 'SUBSCRIBED') {
                await raceChannel.track({
                    user: data.player,
                    color: "#00BBE4",
                    device: device == "desktop" ? "desktop" : "mobile",
                    progress: 0,
                })
            }
        })

    let lastSent = 0
    let throttle_ms = 50
    let y

    function deviceMotion(e) {
        if (realStart) {
            const now = Date.now()
            if (now - lastSent > throttle_ms) {
                y = Math.floor(event.acceleration.y)
        
                progress += (Math.abs(y)/100) * 25
                
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
	}

	raceChannel.on('broadcast', { event: 'progress' }, ({ payload }) => {
		let p = payload.progress
		let u = payload.user
        let n = payload.name

        if(newState[u]) {
            newState[u][0].progress = p
            console.log(newState)
        }
	})

    raceChannel.on('broadcast', {event: 'color'}, ({payload}) => {
        let c = payload.color
        let u = payload.user

        if(newState[u]) {
            newState[u][0].color = c
        }
    })

    function selectColor(e) {
        if (!gameStart) {
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
    }

    let i = data.id

    async function startGame() {

        const { data, error } = await supabase
            .from('rooms')
            .update({ start : true })
            .eq('id', i)

            console.log(data)
    }

    $effect(() => {
        let l = path.getTotalLength()

        if (Object.entries(newState).length > 0) {
            Object.entries(newState).forEach( user => {
                if (user[0].progress >= l) {
                    win = true
                    winner = user[0].user
                }
            })

            console.log(win, winner)

        }
    })
</script>

<svelte:window on:devicemotion={deviceMotion}></svelte:window>


<nav>
    <h1>{data.name} - {data.id}</h1>
</nav>



{#if device == 'mobile'}
    <p style:text-align="center">pick color</p>
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
    <button class="start" disabled={gameStart} onclick={startGame}>START</button>
{:else if device == 'desktop'}
<!-- {#if path}
{path.getTotalLength()}
{path.getPointAtLength(0).x}
{path.getPointAtLength(0).y}
{/if} -->
    <main>
        <section class="race-container">
            <svg bind:clientHeight={svgH} bind:clientWidth={svgW}>
                <path
                    bind:this={path}
                    stroke="#FF825C"
                    stroke-width="50"
                    fill="transparent"
                    d="
                        M{0.3*svgW},{(svgH-(0.4*svgW))/2} 
                        l{0.4*svgW},0
                        q{0.2*svgW},0 {0.2*svgW},{0.2*svgW}
                        q0,{0.2*svgW} -{0.2*svgW},{0.2*svgW} 
                        l-{0.4*svgW},0
                        q-{0.2*svgW},0 -{0.2*svgW},-{0.2*svgW}
                        q0,-{0.2*svgW} {0.2*svgW},-{0.2*svgW}
                        "
                />
                {#if Object.entries(newState).length > 0}
                    {#each Object.entries(newState).slice(0,2) as [key, value],i}
                        {#if value[0].device == 'mobile'}
                            {#if path}
                                {#if path.getTotalLength()}
                                <circle 
                                    cx={path.getPointAtLength(parseInt(Math.floor(value[0].progress))).x} 
                                    cy={path.getPointAtLength(parseInt(Math.floor(value[0].progress))).y}
                                    stroke="black"
                                    stroke-width="2"
                                    fill={value[0].color} r="10"/>
                                <text 
                                    x={path.getPointAtLength(parseInt(Math.floor(value[0].progress))).x} 
                                    y={path.getPointAtLength(parseInt(Math.floor(value[0].progress))).y - 20}
                                    fill="black"
                                    font-size='1.5rem'
                                    text-anchor={ i % 2 == 0 ? "start" : "end"}
                                >{value[0].user}</text>
                                {/if}
                            {/if}
                        {/if}
                    {/each}
                    <!-- {device} -->
                {/if}
                {#if gameStart && !realStart}
                <text 
                    text-anchor="middle" 
                    dominant-baseline="middle"
                    font-size="5rem"
                    x={0.5*svgW}
                    y={0.5*svgH}
                    >{countDown}</text>
                {:else if  gameStart && realStart}
                <text 
                    text-anchor="middle" 
                    dominant-baseline="middle"
                    font-size="5rem"
                    x={0.5*svgW}
                    y={0.5*svgH}
                    >START!</text>
                {/if}
            </svg>
        </section>
        <section class="users">
            {#if Object.entries(newState).length == 0}
                <h2>No other users connected</h2>
            {:else if Object.entries(newState).length > 0}
                {#each Object.entries(newState).slice(0,2) as [key, value]}
                    {#if value[0].device == 'mobile'}
                        <div class="user-container">
                            <div class="square-player" style:background-color={value[0].color}></div>
                            <h2>{value[0].user}-{Math.floor(value[0].progress)}</h2>
                        </div>
                    {/if}
                {/each}
                <!-- {device} -->
            {/if}
        </section>
        

    </main>
{/if}


<style>
    :global(body) {
        margin:0;
        width:100%;
        display: block;
    }
    svg {
        /* border: solid 1px black; */
        position:absolute;
        /* background-color: coral; */
        width:100%;
        height:100%;
    }
    .race-container {
        /* background-color: cornflowerblue; */
        width:100vw;
        height:90vh;
        position: absolute;
    }
    .users {
        position:absolute;
        left:1%;
        margin:0 auto;
        width:98%;
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
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }
    p {
        font-family: 'Geo', sans-serif;
        color:black;
    }
    text {
        font-family: 'Geo', sans-serif;
        color:black;
    }
    .color-container {
        display: flex;
        width:320px;
        justify-content: space-around;
        margin:0 auto;
    }
    .start {
        width:100%;
        margin:1rem auto;
        font-family: 'Geo', sans-serif;
        color:black;
        font-size: 2rem;
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
        width:1.5rem;
        height:1.5rem;
        margin:0.5rem;
    }
    .user-container {
        display: flex;
    }
</style>