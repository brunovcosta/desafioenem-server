import WebSocket from 'ws';
import express from 'express';
import http from 'http';
import { resolve } from 'path';
import Game from '../common/game';

export default class Server {
	port: number;
	app: express.Express;
	channels: {
		[channel: string]: {
			sockets: WebSocket[],
				game: Game
		}
	};

	constructor(port: number) {
		this.port = port;
		this.app = express();
		this.channels = {};
	}

	public start() {
		this.app.get('*', (req: express.Request, res: express.Response) => {
			res.sendFile(resolve(`./dist/client/${req.path}`));
		});

		let server = http.createServer(this.app);
		server.listen(this.port);
		console.log(`listening http://localhost:${this.port}`);
		const wss = new WebSocket.Server({ server });

		wss.on('connection', (socket: WebSocket, req: http.IncomingMessage) => {
			console.log('connection', req.url);
			if (this.channels[req.url]) {
				this.channels[req.url].sockets.push(socket);
			} else {
				this.channels[req.url] = {
					sockets: [socket],
					game: new Game()
				}
			}
			socket.send(this.channels[req.url].game.encode());
			socket.on('message', (messageCode: string) => {
				this.channels[req.url].game.update(JSON.parse(messageCode));
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
