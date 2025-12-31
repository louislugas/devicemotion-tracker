<script>
	import { page } from '$app/state';
    import { goto } from '$app/navigation'
    import { onMount } from 'svelte';

    onMount(() => {
        setTimeout(() => {
            goto('/')
        }, 3000)
    })

</script>

<section>
    <h1>{page.status}</h1>
    <h2>{page.error.message}</h2>
    <div class="loading">
        {#each Array(3) as _,i}
            <div class="dots" 
                style:animation-duration='{1800}ms'
                style:animation-delay='{i * 300}ms'
            ></div>
        {/each}
        
    </div>
</section>

<style>
    section {
        width:100%;
        height:90dvh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    h1 {
        font-family: 'Geo', sans-serif;
        font-size: 10rem;
        margin:0;
    }
    h2 {
        font-family: 'Geo', sans-serif;
        font-size: 3rem;
        margin:0;
    }
    .loading {
        width:320px;
        display: flex;
        height:20px;
        margin: 0 auto;
        justify-content: center;
        gap:20px;
        margin-top:1.5rem;
    }
    .dots {
        width:20px;
        height:20px;
        background-color: black;
        opacity:0;
        animation-name:loading;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        color:red
    }
    @keyframes loading {
        0% {
            opacity:0
        }
        1% {
            opacity:1
        }
        49% {
            opacity:1
        }
        50% {
            opacity:0
        }

    }

</style>