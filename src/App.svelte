<script>
	export let states = [];

	const messageChannel = new MessageChannel();

	navigator.serviceWorker.controller.postMessage({type: 'INIT_PORT'}, [
			messageChannel.port2,
		])

	messageChannel.port1.onmessage = (evt) => {
		console.log("receiving Message")
		states.push(evt.data.payload);
		states = states;
	}

</script>

<main>
	<h1>PWA</h1>
	<h2>Event Log:</h2>
	{#each states as state}
		<p> {state} </p>
	{/each}
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