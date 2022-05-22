<script>
	export let states = [];

	const messageChannel = new MessageChannel();

	let defferedPromt;

	let installBtnVisible = false;
	let pushBtnVisible = false;
	let registeredSW = false;
	let permissionGranted = false;
	let SWregistration;


	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('./service-worker.js').then(function(reg) {
			// Registrierung erfolgreich
			console.log('Registrierung erfolgreich.');
			registeredSW = true;
			SWregistration = reg;
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

	window.addEventListener('beforeinstallprompt', (evt) => {
		console.log("beforeInstallation")
		defferedPromt = evt;
		installBtnVisible = true;
	})

	if('PushManager' in window) {
		pushBtnVisible = true;
	}

	async function installPWA() {
		if(defferedPromt !== null){
			defferedPromt.prompt();

			const { result } = await defferedPromt.userChoice;
			if(result === "accepted"){
				defferedPromt = null;
				installBtnVisible = false;
			}
		}

	}

	async function askPermission() {
		return new Promise(function(res, rej){
			const result = Notification.requestPermission( result => {
				res(result);
			})

			if(result){
				result.then(res, rej)
			}
		})
	}

	async function editPushPermission() {
		if(!permissionGranted){
			const permission = await askPermission();

			if(permission === 'granted'){
				permissionGranted = true;
			}
		}

		if (permissionGranted){
			const subscription = await SWregistration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: new Uint8Array(4)})
		}
	}


</script>

<main>
	<h1>Demo PWA</h1>

	<h2>PWA Configuration:</h2>
	{#if installBtnVisible}
	<button on:click={installPWA}>Install PWA</button>
	{:else}
		<p>PWA-Installation not available</p>
	{/if}
	{#if pushBtnVisible && registeredSW}
	<button on:click={editPushPermission}>Edit Push Permission</button>
	{:else}
		<p>Push Manager not available</p>
	{/if}

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