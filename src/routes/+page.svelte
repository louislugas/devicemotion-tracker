<script context="module">
    import { goto } from '$app/navigation';
  import Device from 'svelte-device-info';
</script>

<script>
	let device = null

	if (!Device.isMobile && !Device.isPhone && !Device.isTablet) {
		device = 'desktop'
	}
</script>
<section>
	<button onclick={() => goto('/create')}>Create Room</button>
	<button onclick={() => goto('/join')}>Join Room</button>
</section>
<style>
	:global(body) {
		margin: 0;
		padding:0;
		width:100%;
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
	button {
		width: 100%;
        padding: 0.5rem;
        font-size: 1.2rem;
        border: 2px solid #ccc;
        border-radius: 5px;
        font-family: 'Geo', sans-serif;
	}
</style>
