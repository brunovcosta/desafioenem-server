import Server from './server';

let server = new Server(+process.env.PORT || 3000);
server.start();
