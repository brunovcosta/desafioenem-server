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
				channel.sockets.push(socket);
				channel.game.connect(player);
			} else {
				let game = new Game();
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
			}))
			socket.send(this.channels[req.url].game.encode());
			socket.on('message', (messageCode: string) => {
				let message = JSON.parse(messageCode);
				let channel = this.channels[req.url]
				let player = channel.player;
				channel.game.update(message, player);
				for (let connection of this.channels[req.url].sockets) {
					if (socket !== connection) {
						connection.send(messageCode);
					}
				}
			});

			socket.on('close', () => {
				this.channels[req.url].sockets.splice(this.channels[req.url].sockets.indexOf(socket), 1);
			});
		});
	}
}
