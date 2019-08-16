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
	state: "OPEN" | "BLOCKED"
	index: number;
	data: any;

	constructor(data: any, index: number) {
		this.state = "OPEN";
		this.data = data;
		this.index = index;
	}

	public validate(assertionId: number) {
		for (let assertion of this.data.assertionsByQuestionId.nodes) {
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
