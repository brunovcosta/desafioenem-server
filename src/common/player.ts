import Question from './question';

export default class Player {
	public state: "ALIVE" | "DEAD" | "OUT"
	public correctAnswers: number;
	public score: number;
	public index: number;
	public question: Question;
	public questionsVisited: Array<Question>;
	public killedBy: Player;
	public kills: number;

	constructor() {
		this.state = "ALIVE";
		this.score = 6;
		this.kills = 0;
		this.questionsVisited = [];
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
		if (this.questionsVisited.some((visitedQuestion) => { return visitedQuestion.index != question.index})){
			this.questionsVisited.push(question);
		}
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
