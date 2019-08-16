import Player from '../common/player';
import Game from '../common/game';
export default class Client {
	connection: WebSocket;
	player: Player;
	game: Game;
	constructor(url: string = null, channel = "default") {
		this.game = new Game();
		this.player = new Player();
		this.connection = new WebSocket(`${location.protocol === 'http:' ? 'ws' : 'wss'}://${url || 'localhost:3001'}/${channel}`);
		this.connection.onmessage = (evt: MessageEvent) => {
			console.log('here -> ', evt.data);
			this.game.update(JSON.parse(evt.data), this.player);
		};
	}

	private send(action: string, payload: any) {
		this.connection.send(JSON.stringify({
			action,
			payload
		}));
	}

	public answer(questionIndex: number, assertionId: number) {
		this.send("ANSWER",{
			assertionId,
			questionIndex,
			playerIndex: this.player.index
		});
	}

	public watch(questionIndex: number) {
		this.send("WATCH", {
			questionIndex,
			playerIndex: this.player.index
		});
	}
}
