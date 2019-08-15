import Player from '../common/player';
import Game from '../common/game';

export default class Client {
	connection: WebSocket;
	player: Player;
	game: Game;
	constructor(url: string, channel = "default") {
		this.game = new Game();
		this.connection = new WebSocket(`${location.protocol === 'http:' ? 'ws' : 'wss'}://${url || 'localhost:3001'}/${channel}`);
		this.connection.onmessage = (evt: MessageEvent) => {
			this.game.update(JSON.parse(evt.data));
		};
	}

	private send(action: string, payload: any) {
		this.connection.send(JSON.stringify({
			action,
			payload
		}));
	}

	public answer(questionIndex: number, answer: string) {
		this.send("ANSWER",{
			answer,
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
