import WebSocket from 'ws';
import http from 'http';
import express from 'express';
import Player from '../common/player';
import Game from '../common/game';

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

	constructor(handler: any) {
		this.handler = handler;
		handler.get('/:channel/questions', (req: express.Request, res: express.Response) => {
			let channel = this.channels[req.params.channel];
			if (channel) {
				res.send(channel.game.players.length);
			} else {
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
			console.log('connection', req.url);
			let channel = this.channels[req.url];
			let player = new Player();
			if (channel) {
				for (let connection of this.channels[req.url].sockets) {
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
				setInterval(() => {
					let message = {
						action: "TIME_KILL",
						payload: {}
					};
					game.update(message);
					for (let conn of this.channels[req.url].sockets) {
						conn.send(JSON.stringify(message));
					}
				}, 10000);
				game.connect(player);
				channel = this.channels[req.url] = {
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
				let channel = this.channels[req.url]
				let player = channel.player;
				let responseMessage = channel.game.update(message, player);
				for (let connection of this.channels[req.url].sockets) {
					if (socket !== connection) {
						connection.send(JSON.stringify(responseMessage));
					}
				}
			});

			socket.on('close', () => {
				let channel =this.channels[req.url];
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
