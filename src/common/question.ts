
export default class Question {
	answer: string;
	state: "OPEN" | "BLOCKED"
	index: number;

	constructor() {
		this.state = "OPEN";
	}

	public validate(answer: string) {
		return this.answer === answer;
	}

	public block() {
		this.state = "BLOCKED";
	}
}
