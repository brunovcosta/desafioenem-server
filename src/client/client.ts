export default class Client {
	connection: WebSocket;
	constructor(url: string, channel = "default") {
		this.connection = new WebSocket(`${location.protocol === 'http:' ? 'ws' : 'wss'}://${location.host}/${channel}`);
	}
}
