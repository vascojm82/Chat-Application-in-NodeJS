'use strict';

const config = require('./config');
const redis = require('redis').createClient;
const adapter = require('socket.io-redis');

//Social Authentication Logic
require('./auth')();

//Create an IO Server instance
let ioServer = (app) => {     //'app' is the express app from server.js
  app.locals.chatrooms = [];
  const server = require('http').Server(app);
  const io = require('socket.io')(server);
  io.set('transports', ['websocket']);    //Force SocketIO to use websockets

  //*** To make Socketio send and receive its buffer from Redis ***
  //In order to use authentication with a password on this Redis driver we have to add the 'auth_pass' property in the object we pass as the
  //3rd parameter to the createClient() method. We create two interfaces or individual pipelines so that they can be configured separately.
  //Only the second interface, the Receiver, has to be 'configured' adding the 'return_buffers' field set to true in the object on the 3rd
  //parameter to createClient() in order to force Redis to send us back buffer data instead of strings. Since we need to get back buffer
  //data from Redis, a single interface does not work for Send/Receive here, we need a second one configured to receive buffer data from Redis.
  let pubClient = redis(config.redis.port, config.redis.host, {   //Send/Publish data buffer(s) to Redis
    auth_pass: config.redis.password
  });
  let subClient = redis(config.redis.port, config.redis.host, {   //Subscribe/Receive data buffer(s) from Redis
    return_buffers: true,   //Otherwise Redis returns data as a string(default) we want it back as a buffer instead
    auth_pass: config.redis.password
  });
  io.adapter(adapter({  //The order of declaration of the clients determines which is Sender and which is Receiver
    pubClient,  //Sender
    subClient   //Receiver
  }));
  //*********

  io.use((socket, next) => {
    require('./session')(socket.request, {}, next);   //Passing the session from express's 'req' to socketio's 'socket.request'
  });
  require('./socket')(io, app);   //'app' is the express app from server.js
  return server;
}

module.exports ={
  router: require('./routes')(),
  session: require('./session'),
  ioServer,
  logger: require('./logger')
}
