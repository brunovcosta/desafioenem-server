type Content = {
	id: number;
	position: number;
	questionId: number;
	textByTextId: {
		id: number;
		body: string;
		alignment: string;
		source: any;
	};
	imageByImageId: {
		id: number;
		url: string;
		source: any;
		resizeFactor: number;
		description: number;
	};
	videoByVideoId: {
		id: number;
		providerId: string;
		providerType: string;
	};
}

export default class Question {
	answer: string;
	state: "OPEN" | "BLOCKED"
	index: number;
	id: number;
	content: any[];
	source: any;
	mode: string;
	alternatives: number;
	interactiveData: any[]
	group: string;
	contentsByQuestionId: {
		nodes: Content[]
	}

	assertionsByQuestionId: {
		nodes: {
			id: number;
			questionId: number;
			position: number;
			correct: boolean;
			contentsByAssertionId: {
				nodes: Content[]
			}
		}[]
	}

	constructor() {
		this.state = "OPEN";
	}

	public validate(assertionId: number) {
		for (let assertion of this.assertionsByQuestionId.nodes) {
			if (assertion.correct) {
				return true;
			}
		}
		return false;
	}

	public block() {
		this.state = "BLOCKED";
	}
}
