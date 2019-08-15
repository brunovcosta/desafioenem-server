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

	public answer(player: Player, answer: string, question: Question) {
		if (question.validate(answer)) {
			question.block();
			this.dropLastPlayer();
		} else {
			this.dropPlayer(player);
		}
	}

	public dropLastPlayer() {
		let player = this.players.reduce((acc, player) => {
			if (acc.score > player.score) {
				return player;
			} else {
				return acc;
			}
		});

		this.dropPlayer(player);
	}

	public dropPlayer(player: Player) {
		let index = this.players.indexOf(player);
		this.players.splice(index, 1);
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

	public update(message: string) {

	}
}
