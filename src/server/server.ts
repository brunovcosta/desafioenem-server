import WebSocket from 'ws';
import http from 'http';
import express from 'express';
import Player from '../common/player';
import Game from '../common/game';
import ApolloClient from 'apollo-boost';
import { HttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';
import fetch from 'node-fetch';

export default class Server {
	handler: express.Express;
	wss: WebSocket.Server;
	channels: {
		[channel: string]: {
			sockets: WebSocket[];
			game: Game;
			player: Player;
		}
	};

	public async loadQuestions() {
		const client = new ApolloClient({
			uri: 'https://staging.api.dex.paperx.com.br/graphql',
			fetch: fetch as any
		});

		let response = await client.query({
			query: gql`
				query GetQuestions {
					allQuestions(first: 100) {
						nodes {
							id
						}
						totalCount
					}
				}
			`
		});

		return response.data.allQuestions.nodes;

	}

	constructor(handler: any) {
		this.handler = handler;
		handler.get('/:channel/questions', async (req: express.Request, res: express.Response) => {
			let channel = this.channels[req.params.channel];
			let questions = await this.loadQuestions();
			if (channel) {
				res.setHeader('Content-Type', 'application/json');
				res.send(questions);
			} else {
				throw new Error(`Channel '${req.params.channel}' does not exists! The channels are ${Object.keys(this.channels)}`);
			}
		});
		this.channels = {};
	}

	public start(port: number) {
		let server = http.createServer(this.handler);
		server.listen(port);
		console.log(`listening http://localhost:${port}`);
		this.wss = new WebSocket.Server({ server });

		this.wss.on('connection', (socket: WebSocket, req: http.IncomingMessage) => {
			let channelName = req.url.substring(1);
			let channel = this.channels[channelName];
			let player = new Player();
			if (channel) {
				for (let connection of this.channels[channelName].sockets) {
					connection.send(JSON.stringify({
						action: "ADD_PLAYER",
						payload: {
							playerIndex: channel.game.players.length - 1
						}
					}));
				}
				channel.sockets.push(socket);
				channel.game.connect(player);
			} else {
				let game = new Game();
				// setInterval(() => {
				// 	let message = {
				// 		action: "TIME_KILL",
				// 		payload: {}
				// 	};
				// 	game.update(message);
				// 	for (let conn of this.channels[channelName].sockets) {
				// 		conn.send(JSON.stringify(message));
				// 	}
				// }, 10000);
				game.connect(player);
				channel = this.channels[channelName] = {
					sockets: [socket],
					game,
					player
				}
			}
			socket.send(JSON.stringify({
				action: "SET_INDEX",
				payload: {
					index: channel.game.players.length - 1
				}
			}));
			socket.on('message', (messageCode: string) => {
				let message = JSON.parse(messageCode);
				let channel = this.channels[channelName]
				let player = channel.player;
				let responseMessage = channel.game.update(message, player);
				for (let connection of this.channels[channelName].sockets) {
					connection.send(JSON.stringify(responseMessage));
				}
			});

			socket.on('close', () => {
				let channel =this.channels[channelName];
				let index = channel.sockets.indexOf(socket);
				let message = {
					action: "DROP_PLAYER",
					payload: { index }
				};
				channel.game.update(message);
				for (let connection of channel.sockets) {
					connection.send(JSON.stringify(message));
				}
			});
		});
	}
}
