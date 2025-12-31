<script>
    import { supabase } from "$lib/supabase";
    import { enhance } from '$app/forms';
    import { goto } from "$app/navigation";

    /** @type {import('./$types').PageProps} */
	let { data, form } = $props();

    let input = []

    function removeClass() {
        input.forEach((e) => {
            e.classList.remove("duplicate-input")
        })
    }

    let loading = $state(false)

    function handleSubmit() {
        loading = true
    }

</script>

<section>
    <h1>Join Room</h1>
    <p style:opacity={form?.noRoom ? 1 : form?.incorrect ? 1 : 0}>
        {#if form?.noRoom}
        <span class:duplicate={form?.noRoom}>
            Room does not exist.
        </span>
        {:else if form?.incorrect}
        <span class:duplicate={form?.incorrect}>
            Incorrect password.
        </span>
        {:else}
         <span>//</span>
        {/if}
    </p>
    <form method="POST" onsubmit={handleSubmit}>
        <input type="text" name="player" placeholder="Player Name" />
        <input bind:this={input[0]} type="text" name="room" placeholder="Room Name" 
            onclick={removeClass}
            oninput={removeClass}
            class:duplicate-input={form?.noRoom}/>
        <input bind:this={input[1]} type="password" name="password" placeholder="Password" 
            onclick={removeClass}
            oninput={removeClass}
            class:duplicate-input={form?.incorrect}/>
        <button disabled={loading}>{loading? "Loading..." : "Join Room"}</button>
    </form>
</section>

<style>
    :global(body) {
        display: flex;
        justify-content: center;
        align-items: center;
        height:90dvh
    }
    section {
        width:90%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        justify-content: center;
        align-items: center;
        font-family: 'Geo', sans-serif;
    }
    h1 {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    input {
        width: calc(100% - 1rem);
        padding: 0.5rem;
        font-size: 1.2rem;
        border: 2px solid #ccc;
        border-radius: 5px;
        font-family: 'Geo', sans-serif;
    }
    button {
        width: 100%;
        padding: 0.5rem;
        font-size: 1.2rem;
        border: 2px solid #ccc;
        border-radius: 5px;
        font-family: 'Geo', sans-serif;
    }
    form {
        width:100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap:0.5rem;
    }
    p {
        margin:0;
        color:red;
        transition:opacity 100ms ease-in-out;
    }
    .duplicate-input {
        border-color: red;
        animation: shake 0.3s;
        color:red;
        background-color: rgb(255, 242, 244);
        transition:border-color 100ms ease-in-out, background-color 100ms ease-in-out, color 100ms ease-in-out;
    }
    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
        100% { transform: translateX(0); }
    }
</style>