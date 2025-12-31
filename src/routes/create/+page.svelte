<script>
    import { supabase } from "$lib/supabase";
    import { goto } from "$app/navigation";
    import { enhance } from '$app/forms';

    /** @type {import('./$types').PageProps} */
	let { data, form } = $props();

    let input = []

    function removeClass() {
        input.forEach((e) => {
            e.classList.remove("duplicate-input")
        })
    }
</script>

<section>
    <h1>Create Room</h1>
    <p style:opacity={form?.duplicate ? 1 : form?.success ? 1 : 0}>
        {#if form?.duplicate}
        <span class:duplicate={form?.duplicate}>
            Room name already exists. Please choose another name.
        </span>
        {:else if form?.success}
        <span class:success={form?.success}>
            Room created successfully
        </span>
        {:else}
         <span>//</span>
        {/if}
    </p>

    <form style:display={form?.loading ? "none" : "flex"} method="POST" >
        <input 
            bind:this={input[0]}
            name="room"
            class:duplicate-input={form?.duplicate}
            type="text" placeholder="Room Name" onclick={removeClass}/>
        <input 
            bind:this={input[1]}
            name="password"
            class:duplicate-input={form?.duplicate}
            type="password" placeholder="Password" onclick={removeClass}/>
        <button>Create Room</button>
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
        position:relative;
    }
    @keyframes load {
        0% {
            opacity:0;
        }
        40% {
            opacity:0;
        }
        60% {
            opacity:1;
        }
        100% {
            opacity:1;
        }
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
        transition:opacity 100ms ease-in-out;
    }
    .duplicate {
        color:red;
    }
    .success {
        color:green
    }
    .duplicate-input {
        border-color: red;
        animation: shake 0.3s;
        color:red;
        background-color: rgb(255, 242, 244);
        transition:border-color 100ms ease-in-out, background-color 100ms ease-in-out, color 100ms ease-in-out;
    }
    .duplicate-input::placeholder {
        color:red;
    }
    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
        100% { transform: translateX(0); }
    }
</style>