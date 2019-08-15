import Player from '../common/player';
import Question from '../common/question';
import Game from '../common/game';

export default class Client {
	connection: WebSocket;
	player: Player;
	game: Game;
	constructor(url: string, channel = "default") {
		this.connection = new WebSocket(`${location.protocol === 'http:' ? 'ws' : 'wss'}://${location.host}/${channel}`);
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

	public answer(question: Question, answer: string) {
		this.send("ANSWER",{
			answer,
			questionIndex: question.index,
			playerIndex: this.player.index
		});
	}

	public watch(question: Question) {
		this.send("WATCH", {
			questionIndex: question.index,
			playerIndex: this.player.index
		});
	}
}
