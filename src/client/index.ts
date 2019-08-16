import Client from './client';

window.onload = () => {
	let client = new Client();
	console.log(client);

	let btn = document.getElementById("send-message");
	btn.onclick = () => {
		client.watch(123);
	};
}

