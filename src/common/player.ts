import Question from './question';

export default class Player {
	state: "ALIVE" | "DEAD"
	score: number;
	index: number;
	question: Question;
	constructor() {
		this.state = "ALIVE";
		this.score = 0;
	}

	public setIndex(index: number) {
		this.index = index;
	}

	public kill() {
		this.state = "DEAD";
	}

	public watch(question: Question) {
		this.question = question;
	}
}
