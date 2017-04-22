'use strict';

//Social Authentication Logic
require('./auth')();

//Create an IO Server instance
let ioServer = (app) => {     //'app' is the express app from server.js
  app.locals.chatrooms = [];
  const server = require('http').Server(app);
  const io = require('socket.io')(server);
  io.use((socket, next) => {
    require('./session')(socket.request, {}, next);   //Passing the session from express's 'req' to socketio's 'socket.request'
  });
  require('./socket')(io, app);   //'app' is the express app from server.js
  return server;
}

module.exports ={
  router: require('./routes')(),
  session: require('./session'),
  ioServer
}
