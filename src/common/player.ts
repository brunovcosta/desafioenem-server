export default class Player {
	state: "ALIVE" | "DEAD"
	score: number;
	constructor() {
		this.state = "ALIVE";
		this.score = 0;
	}

	public kill() {
		this.state = "DEAD";
	}
}
