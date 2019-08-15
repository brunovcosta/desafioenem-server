import WebSocket from 'ws';
import express from 'express';
import http from 'http';
import { resolve } from 'path';
import Game from '../common/game';

const app = express();
app.get('/', (req: express.Request, res: express.Response) => {
	res.sendFile(resolve('./dist/client/index.html'));
});

app.get('*bundle.js', (req: express.Request, res: express.Response) => {
	res.sendFile(resolve('./dist/client/bundle.js'));
});

app.get('/g/*', (req: express.Request, res: express.Response) => {
	res.sendFile(resolve('./dist/client/index.html'));
});

app.get('*', (req: express.Request, res: express.Response) => {
	res.sendFile(resolve(`./dist/client/${req.path}`));
});

let server = http.createServer(app);
server.listen(process.env.PORT || 3000);
console.log('listening http://localhost:3000');
const wss = new WebSocket.Server({ server });
const channels: {
	[channel: string]: {
		sockets: WebSocket[],
		game: Game
	}
} = {};

wss.on('connection', (socket: WebSocket, req: http.IncomingMessage) => {
	console.log('connection', req.url);
	if (channels[req.url]) {
		channels[req.url].sockets.push(socket);
	} else {
		channels[req.url] = {
			sockets: [socket],
			game: new Game()
		}
	}
	socket.send(channels[req.url].game.encode());
	socket.on('message', (messageCode: string) => {
		channels[req.url].game.update(messageCode);
		for (let connection of channels[req.url].sockets) {
			if (socket !== connection) {
				connection.send(messageCode);
			}
		}
	});

	socket.on('close', () => {
		channels[req.url].sockets.splice(channels[req.url].sockets.indexOf(socket), 1);
	});
});
