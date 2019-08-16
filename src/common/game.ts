import Player from './player';
import Question from './question';

export default class Game {
	public players: Player[];
	public questions: Question[];
	constructor() {
		this.players = [];
		this.questions = [];
	}

	public connect(player: Player) {
		this.players.push(player);
	}

	public killLastPlayer() {
		let player = this.players.reduce((acc, player) => {
			if (acc.score > player.score) {
				return player;
			} else {
				return acc;
			}
		});

		player.kill();
	}

	public leaderboard() {
		return this.players.sort((player) => -player.score);
	}

	// Message management
	public static decode(message: string): Game {
		return null;
	}

	public encode(): string {
		return null;
	}

	public update(message: {action: string, payload: any}, player: Player = null) {
		switch(message.action) {
			case 'WATCH': {
				let { questionIndex } = message.payload;
				let question = this.questions[questionIndex];
				player.watch(question);
				break;
			}
			case 'ANSWER': {
				let { questionIndex, answer } = message.payload;
				let question = this.questions[questionIndex];

				if (question.validate(answer)) {
					question.block();
					this.killLastPlayer();
				} else {
					player.kill();
				}
				break;
			}
			default:
				throw new Error(`Wrong message action: ${message.action}`);
		}
	}
}
