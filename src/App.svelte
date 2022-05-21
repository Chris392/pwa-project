<script>
	export let states = [];

	const messageChannel = new MessageChannel();

	let defferedPromt;

	let installBtnVisible = false;

	if(navigator.serviceWorker.controller != null){
		navigator.serviceWorker.controller.postMessage({type: 'INIT_PORT'}, [
			messageChannel.port2,
		])
	}

	messageChannel.port1.onmessage = (evt) => {
		console.log("receiving Message")
		states.push(evt.data.payload);
		states = states;
	}

	window.addEventListener('beforeinstallpromt', (evt) => {
		console.log("beforeInstallation")
		defferedPromt = evt;
	})

	function installPWA() {
		if(!defferedPromt) {
			installBtnVisible = true;
			defferedPromt.promt();
		}
	}

</script>

<main>
	<h1>Demo PWA</h1>
	<h2>Event Log:</h2>
	{#each states as state}
		<p> {state} </p>
	{/each}
	{#if installBtnVisible}
	<button class="installBtn " on:click={installPWA}>Install PWA</button>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>