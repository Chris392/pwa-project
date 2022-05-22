<script>
	import convertVapidKey from 'convert-vapid-public-key';

	export let states = [];

	const messageChannel = new MessageChannel();

	let defferedPromt;

	let installBtnVisible = false;
	let pushBtnVisible = false;
	let registeredSW = false;
	let permissionGranted = false;
	let isSubscribed = false;
	let SWregistration;


	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('./service-worker.js').then(function(reg) {
			// Registrierung erfolgreich
			console.log('Registrierung erfolgreich.');
			registeredSW = true;
			SWregistration = reg;

			SWregistration.pushManager.getSubscription().then(sub => {
				if(sub !== null){
					permissionGranted = true;
					isSubscribed = true;
				}
			})
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
			SWregistration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: convertVapidKey('BFagsG4NMfunV135Q8FY-0KCyI-2hk2GDsNTRgtVxEfcrbVu-Sw067pxQNKy4xan-6anwjyGFRlYe-0eNzbpLyQ')})
				.then(sub => {
					console.log("Subscription successfull!", sub)
					isSubscribed = true;
				})
		}
	}

	function unsubscribe(){
		SWregistration.pushManager.getSubscription().then( sub => {
			if(sub){
				sub.unsubscribe();
				isSubscribed = false;
				permissionGranted = false;
			}
		})
	}

	// Trivia Api

	let question = "";
	let answer;
	let showAnswer = false;

	newQuestion();

	function newQuestion(){
		fetch('https://opentdb.com/api.php?amount=1&type=boolean')
		.then(response => response.json())
		.then(data => {
			console.log(data);
			console.log(data.results[0].question)
			question = data.results[0].question
			answer = data.results[0].correct_answer;
		})

		showAnswer = false;
	}

</script>

<main>
	<h1>Demo PWA</h1>

	<img src="question-mark.png" alt="Question Mark">
	<h2>Random Question:</h2>
	<p>{@html question}</p>
	<p>true or false?</p>

	{#if !showAnswer}
		<button on:click={() => {showAnswer = true}}>Show Answer</button>
	{:else}
		<p>{answer}</p>
	{/if}

	<div>
		<button on:click={newQuestion}>New Question</button>
	</div>

	<h2>PWA Configuration:</h2>
	{#if installBtnVisible}
	<button on:click={installPWA}>Install PWA</button>
	{:else}
		<p>PWA-Installation not available</p>
	{/if}
	{#if pushBtnVisible && registeredSW && !isSubscribed}
	<button on:click={editPushPermission}>Edit Push Permission</button>
	{:else}
		{#if isSubscribed}
			<p>You are Subscribed for Push-Notifications</p>
		{:else if permissionGranted}
			<p>Push Permission granted</p>
		{:else}
			<p>Push Manager not available</p>
		{/if}
	{/if}
	{#if isSubscribed}
		<button on:click={unsubscribe}>Unsubscribe</button>
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