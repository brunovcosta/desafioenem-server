import Question from './question';

export default class Player {
	public state: "ALIVE" | "DEAD" | "OUT"
	public score: number;
	public index: number;
	public question: Question;
	public killedBy: Player;
	public kills: number;

	constructor() {
		this.state = "ALIVE";
		this.score = 0;
		this.kills = 0;
	}

	public setIndex(index: number) {
		this.index = index;
	}

	public kill(killer: Player = null) {
		this.state = "DEAD";
		this.killedBy = killer;
		if (killer) {
			killer.kills += 1;
		}
	}

	public drop() {
		this.state = "OUT";
	}

	public watch(question: Question) {
		this.question = question;
	}
	
	public encode() {
		return {
			state: this.state,
			questionIndex: this.question ? this.question.index : null,
			killerIndex: this.killedBy ? this.killedBy.index : null
		}
	}
}
