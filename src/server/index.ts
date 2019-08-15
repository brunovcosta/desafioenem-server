import Server from './server';
import express from 'express';
import { resolve } from 'path';

let handler = express();
handler.get('*', (req: express.Request, res: express.Response) => {
	console.log(req.path);
	res.sendFile(resolve(`./dist/client/${req.path}`));
});

let server = new Server(handler);
server.start(+process.env.PORT || 3001);
