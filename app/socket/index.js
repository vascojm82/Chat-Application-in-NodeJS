'use strict';

const h = require('../helpers');

module.exports = (io, app) => {
  let allrooms = app.locals.chatrooms;

  //Handshake with the client
        //We're listening to the '/roomslist' pipeline(namespace) on our socket.io connection
  io.of('/roomslist').on('connection', (socket) => {    //We get an instance to the socket of the client that connects in, all
                                                        //further communication will be done through this socket instance
    socket.on('getChatrooms', () => {   //Listen for getChatRooms event
      socket.emit('chatRoomsList', JSON.stringify(allrooms))      //Dispatch chatRoomsList event containing allrooms
    });

    socket.on('createNewRoom', (newRoomInput) => {  //Listen for createNewRoom event
      //Check to see if a room with the same title exists or not
      //if not, create one and broadcast it to everyone
      if(!h.findRoomByName(allrooms, newRoomInput)){
        //Create a new room and broadcast to all
        allrooms.push({
          room: newRoomInput,
          roomID: h.randomHex(),
          users: []
        });

        //Emit an updated list to the creator
        socket.emit('chatRoomsList', JSON.stringify(allrooms));   //Emits chatRoomsList event with list of chatrooms only to the creator of
                                                                  //the room and no one else, in other words it emits back to the actively
                                                                  //connected socket

        //Emit an updated list to everyone connected to the rooms page
        socket.broadcast.emit('chatRoomsList', JSON.stringify(allrooms));   //Emits chatRoomsList event to all connected sockets in the roomslist namespace
      }
    });
  });

  io.of('/chatter').on('connection', (socket) => {
    //Join a chatroom
    socket.on('join', (data) => {
      let usersList = h.addUserToRoom(allrooms, data, socket);
      //console.log('usersList: ', usersList);
      //Update the list of active users as shown on the chatroom page
                                                                              //'usersList.users' the list of users for a given room
      socket.broadcast.to(data.roomID).emit('updateUsersList', JSON.stringify(usersList.users));    //All other users in chatroom
      socket.emit('updateUsersList', JSON.stringify(usersList.users));    //Actual user who has just joined in
    });

    //When a socket exists
    socket.on('disconnect', () =>{
      //Find the room, to which the socket is connected to and purge the user
      let room = h.removeUserFromRoom(allrooms, socket);
      socket.broadcast.to(room.roomID).emit('updateUsersList', JSON.stringify(room.users));
    });

    //When a new message arrives
    socket.on('newMessage', (data) =>{
      socket.broadcast.to(data.roomID).emit('inMessage', JSON.stringify(data));
    })
  });
}
