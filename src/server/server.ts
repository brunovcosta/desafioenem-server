import WebSocket from 'ws';
import http from 'http';
import express from 'express';
import Player from '../common/player';
import Game from '../common/game';
import ApolloClient from 'apollo-boost';
import { HttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';
import fetch from 'node-fetch';
import questionsQuery from './questions.graphql';

interface Channel {
	sockets: WebSocket[];
	game: Game;
	player: Player;
}

export default class Server {
	handler: express.Express;
	wss: WebSocket.Server;
	channels: { 
		[channel: string]: Channel
	};

	public async loadQuestions(headers: any = {}) {
		const client = new ApolloClient({
			uri: 'https://staging.api.dex.paperx.com.br/graphql',
			fetch: fetch as any,
			request: operation => {
				operation.setContext({
					headers
				});
			}
		});

		let response = await client.query({
			query: questionsQuery
		});

		return response.data.allQuestions.nodes;

	}

	private startGame ( channel: Channel ) {
		if(channel.game.alivePlayers().length == 1){
			for (let connection of channel.sockets) {
				connection.send(
					JSON.stringify({
						action: "CANCEL_GAME",
						payload: {}
					})
				);
			}
			return;
		}
		for (let connection of channel.sockets) {
			connection.send(
				JSON.stringify({
					action: "START_GAME",
					payload: {}
				})
			);
		}	
		this.setTimeKill(channel);
	};

	private setTimeKill ( channel: Channel ){
		const timeout = setInterval(() => {
			let message = {
				action: "TIME_KILL",
				payload: {}
			};
			channel.game.update(message);
			for (let conn of channel.sockets) {
				conn.send(JSON.stringify(message));
			}
			if( channel.game.alivePlayers().length == 1){
				for (let conn of channel.sockets) {
					let endGameMessage = {
						action: "END_GAME",
						payload: {}
					};
					clearInterval(timeout);
					conn.send(JSON.stringify(endGameMessage));
				}
			}
		}, 10000);
	}

	constructor(handler: any) {
		this.handler = handler;
		handler.get('/:channel/questions', async (req: express.Request, res: express.Response) => {
			let channel = this.channels[req.params.channel];
			if (channel) {
				res.setHeader('Content-Type', 'application/json');
				res.send(channel.game.questions);
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

		this.wss.on('connection', async (socket: WebSocket, req: http.IncomingMessage) => {
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
				if(channel.game.alivePlayers().length == 100){
					this.startGame(channel);
				}
			} else {
				let game = new Game();
				let questions = await this.loadQuestions();
				channel.game.questions = questions;
				game.connect(player);
				channel = this.channels[channelName] = {
					sockets: [socket],
					game,
					player
				}
				setTimeout(() => {
					this.startGame(channel);
				}, 10000);
			}
			socket.send(JSON.stringify({
				action: "SETUP",
				payload: {
					game: channel.game.encode()
				}
			}));
			socket.on('message', (messageCode: string) => {
				let message = JSON.parse(messageCode);
				let channel = this.channels[channelName]
				let player = channel.player;
				let responseMessage = channel.game.update(message, player);
				for (let connection of this.channels[channelName].sockets) {
					connection.send(JSON.stringify(responseMessage));
					if(channel.game.alivePlayers.length == 1){
						let endGameMessage = {
							action: "END_GAME",
							payload: {}
						};
						connection.send(JSON.stringify(endGameMessage))
					}
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
