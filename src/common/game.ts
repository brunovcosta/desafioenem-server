import Player from './player';
import Question from './question';

export default class Game {
	public players: Player[];
	public questions: Question[];
	public interval: any;
	public state: 'BEFORE' | 'DURING' | 'AFTER';

	constructor() {
		this.players = [];
		this.questions = [];
		this.state = 'BEFORE';
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
		return this.players.sort(player => -player.score);
	}

	public alivePlayers() {
		return this.players.filter(player => {
			player.state === 'ALIVE';
		});
	}

	public update(message: {action: string, payload: any}, player: Player = null) {
		switch(message.action) {
			case 'ADD_PLAYER': {
				let player = new Player();
				this.players.push(player);
				return;
			}
			case 'TIME_KILL': {
				this.killLastPlayer();
				return;
			}
			case 'START_GAME': {
				this.state = 'DURING';
				return;
			}
			case 'END_GAME': {
				this.state = 'AFTER';
				return;
			}
			case 'DROP_PLAYER': {
				let { index } = message.payload;
				this.players[index].drop();
				return;
			}
			case 'SET_INDEX': {
				let { index } = message.payload;
				player.setIndex(index);
				return;
			}
			case 'WATCH': {
				let { questionIndex } = message.payload;
				let question = this.questions[questionIndex];
				player.watch(question);
				return message;
			}
			case 'ANSWER': {
				let { questionIndex, answer } = message.payload;
				let question = this.questions[questionIndex];
				let playerIndex = this.players.indexOf(player);
				let payload =  {
					questionIndex,
					answer,
					playerIndex
				};

				if (question.validate(answer)) {
					question.block();
					this.killLastPlayer();
					return {
						action: "CORRECT_ANSWER",
						payload
					}
				} else {
					player.kill();
					return {
						action: "WRONG_ANSWER",
						payload
					}
				}
			}
			default: {
				throw new Error(`Wrong message action: ${message.action}`);
			}
		}
	}
}
