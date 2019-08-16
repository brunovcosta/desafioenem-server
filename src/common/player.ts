import Question from './question';

export default class Player {
	public state: "ALIVE" | "DEAD" | "OUT"
	public correctAnswers: number;
	public score: number;
	public index: number;
	public question: Question;
	public killedBy: Player;
	public kills: number;

	constructor() {
		this.state = "ALIVE";
		this.score = 18;
		this.kills = 0;
	}

	public answeredCorrectly() {
		this.score++;
		this.correctAnswers++;
	}

	public gotHit() {
		this.score = this.score - 6;
		if(this.score < 0){
			this.state = "DEAD";
		}
	}

	public drop() {
		this.state = "OUT";
	}

	public kill(killer: Player = null) {
		this.state = "DEAD";
		this.killedBy = killer;
		if (killer) {
			killer.kills += 1;
		}
	}

	public scoreExtraPoints() {
		this.score = this.score + 3;
	}

	public setIndex(index: number) {
		this.index = index;
	}

	public watch(question: Question) {
		this.question = question;
	}
}
