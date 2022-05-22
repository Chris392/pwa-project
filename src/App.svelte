<script>
	export let states = [];

	const messageChannel = new MessageChannel();

	let defferedPromt;

	let installBtnVisible = false;
	let pushBtnVisible = false;
	let registeredSW = false;


	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('./service-worker.js').then(function(reg) {
			// Registrierung erfolgreich
			console.log('Registrierung erfolgreich.');
			registeredSW = true;
		}).catch(function(error) {
			// Registrierung fehlgeschlagen
			console.log('Registrierung fehlgeschlagen: ' + error);
		});
	};


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

	if('PushManager' in window) {
		pushBtnVisible = true;
	}

	function installPWA() {
		if(!defferedPromt) {
			installBtnVisible = true;
			defferedPromt.promt();
		}
	}

	async function editPushPermission() {
		console.log("editPushPermission")
		const subscription = await PushManager.subscribe({ userVisibleOnly: true, applicationServerKey: new Uint8Array([12393203949323])})
	}


</script>

<main>
	<h1>Demo PWA</h1>
	<h2>Event Log:</h2>
	{#each states as state}
		<p> {state} </p>
	{/each}
	{#if installBtnVisible}
	<button on:click={installPWA}>Install PWA</button>
	{:else}
		<p>PWA-Installation not supported</p>
	{/if}
	{#if pushBtnVisible && registeredSW}
	<button on:click={editPushPermission}>Edit Push Permission</button>
	{:else}
		<p>Push Manager not available</p>
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