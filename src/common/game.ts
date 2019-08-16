import Player from './player';
import Question from './question';

export default class Game {
	public players: Player[];
	public questions: Question[];
	public interval: any;
	public state: 'BEFORE' | 'DURING' | 'AFTER' | 'CANCELED';
	private listeners: Function[];

	constructor() {
		this.players = [];
		this.questions = [];
		this.state = 'BEFORE';
		this.listeners = [];
	}

	private findLastPlayer(){
		return this.alivePlayers().reduce((acc, player) => {
			if (acc.score > player.score) {
				return player;
			} else {
				return acc;
			}
		});

	}

	public connect(player: Player) {
		this.players.push(player);
	}

	public listen(fn: Function) {
		this.listeners.push(fn);
	}

	public killLastPlayer(killer: Player = null) {
		let player = this.findLastPlayer();
		player.kill(killer);
	}

	public leaderboard() {
		return this.players.sort(player => -player.score);
	}

	public alivePlayers() {
		return this.players.filter(player => player.state == 'ALIVE');
	}

	public update(message: {action: string, payload: any}, player: Player = null) {
		let retval = this.preupdate(message, player);
		for (let fn of this.listeners) {
			fn(message);
		}
		return retval;
	}

	private preupdate(message: {action: string, payload: any}, player: Player = null) {
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
			case 'CANCEL_GAME': {
				this.state = 'CANCELED';
				return;
			}
			case 'DROP_PLAYER': {
				let { index } = message.payload;
				this.players[index].drop();
				return;
			}
			case 'SET_INDEX': {
				let { index, playersCount } = message.payload;
				while (playersCount > this.players.length) {
					this.players.push(new Player());
				}
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
				let itsNotADuel = this.alivePlayers().length != 2;
				let onStreak = player.score % 3 == 0;

				if (question.validate(answer)) {
					question.block();
					player.answeredCorrectly();
					if (itsNotADuel){
						if (onStreak){
							if (this.findLastPlayer() == player){
								player.scoreExtraPoints();
							} else {
								this.killLastPlayer(player);
							}
						}
					} else {
						if(onStreak){
							let adversary = this.alivePlayers().filter((_,index) => {return index != playerIndex})[0];
							adversary.gotHit();
						}
					}
					return {
						action: "CORRECT_ANSWER",
						payload
					}
				} else {
					player.gotHit();
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
