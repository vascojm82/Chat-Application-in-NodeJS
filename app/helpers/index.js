'use strict';
const router = require('express').Router(); //Router() is a function, don't forget to invoke it or it will fail
const db = require('../db');
const crypto = require('crypto');

//Iterate through the routes object and mount the routes
let _registerRoutes = (routes, method) =>{
  for(let key in routes){
    if(typeof routes[key] === 'object' && routes[key] != null && !(routes[key] instanceof Array)){
      _registerRoutes(routes[key], key);
    }else{
      //Register the routes
      if(method === 'get'){
        router.get(key, routes[key]);
      } else if(method === 'post'){
        router.post(key, routes[key]);
      }else{
        router.use(routes[key]);  //Last mentioned route, runs no matter what route is called
      }
    }
  }
}

let route = (routes) =>{
  _registerRoutes(routes);
  return router;
}

//Find a single user based on a key
let findOne = (profileID) => {
  return db.userModel.findOne({   //returns a promise
    'profileID': profileID
  });
}

//Create a new user and returns that instance
let createNewUser = (profile) => {
  return new Promise((resolve, reject) => {
    let newChatUser = new db.userModel({
      profileID: profile.id,
      fullName: profile.displayName,
      profilePic: profile.photos[0].value || ''
    });

    newChatUser.save((error) => {
      if(error){
        reject(error);
      }else{
        resolve(newChatUser);
      }
    })

  })
}

//The ES6 promisified version of findById
let findById = (id) => {
  return new Promise((resolve, reject) => {
    db.userModel.findById(id, (error, user) => {
      if(error){
        reject(error);
      }else{
        resolve(user);
      }
    })
  });
}

// Middleware that checks to see if the user is authenticated & logged in
let isAuthenticated = (req, res, next) =>{
  if(req.isAuthenticated()){  //Method provided by passport
    next();
  }else{
    res.redirect('/');
  }
}

// Find a chatroom by a given name
let findRoomByName = (allrooms, room) => {
                          //Iterates through every element of the array and returns its index
  let findRoom = allrooms.findIndex((element, index, array) => {    //Callback is called on every iteration
    if(element.room === room){
      return true;               //If true is retuned by the conditional, findIndex will simply return the index of that element
    }else{
      return false;             // -1 is returned
    }
  });

  return findRoom > -1 ? true: false;
}

//Generates unique roomID
let randomHex = () => {
  return crypto.randomBytes(24).toString('hex');
}

//Find a chatroom with given ID
let findRoomById = (allrooms, roomID) => {
  return allrooms.find((element, index, array) =>{
    if(element.roomID === roomID){
      return true;    //Object with said roomID will be returned
    }else{
      return false;   //Return -1 or undefined
    }
  });
}

//Add a user to a chatroom
let addUserToRoom = (allrooms, data, socket) => {
  //Get the room object
  let getRoom = findRoomById(allrooms, data.roomID);
  if(getRoom !== undefined){
    //Get the active user's ID (userID as used in session), can't use socketID as that changes every time the user re-connects or re-loads the page
    let userID = socket.request.session.passport.user;
    //Check to see if this user already exists in the chatroom
    let checkUser = getRoom.users.findIndex((element, index, array) =>{
      if(element.userID === userID){
        return true;  //Returns the user's object is true
      }else{
        return false; //Returns -1, undefined
      }
    });

    //If the user is already present in the room, remove him first
    if(checkUser > -1) {
      getRoom.users.splice(checkUser, 1);   //Remove user pointed to by index stored in checkUser only
    }

    //Push the user into the room's users array
    getRoom.users.push({
      socketID: socket.id,  //SocketIO assigns a 'socked.id' every time it creates a connection
      userID,
      user: data.user,
      userPic: data.userPic
    });

    //Join the room channel
    socket.join(data.roomID);

    //Return the updated room object
    return getRoom;
  }
}

//Find and purge the user when a socket disconnects
let removeUserFromRoom = (allrooms, socket) =>{
  for(let room of allrooms){
    //Find the user
    let findUser = room.users.findIndex((element, index, array) =>{
        if(element.socketID == socket.id){  //This socket id is for that connection, that user and that chatrooom only, matches a user to a single chatroom
          return true;  //return user object where socket ID matches
        }else{
          return false; //return -1, undefined
        }
    });

    if(findUser > -1){
      socket.leave(room.roomID);
      room.users.splice(findUser, 1);
      return room;
    }
  }
}
module.exports = {
  route: route,
  findOne,
  createNewUser,
  findById,
  isAuthenticated,
  findRoomByName,
  randomHex,
  findRoomById,
  addUserToRoom,
  removeUserFromRoom
}
