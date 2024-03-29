import Server from './server';
import express from 'express';
import { resolve } from 'path';
import cors from "cors";

let handler = express();
handler.use(cors());

handler.get('/', (req: express.Request, res: express.Response) => {
	res.sendFile(resolve(`./dist/client/index.html`));
});
handler.get('/*.js', (req: express.Request, res: express.Response) => {
	res.sendFile(resolve(`./dist/client/${req.path}`));
});

let server = new Server(handler);
server.start(+process.env.PORT || 3001);
