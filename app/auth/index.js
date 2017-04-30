'use strict'
const passport = require('passport');
const config = require('../config');
const h = require('../helpers');
const logger = require('../logger');
const FacebookStrategy = require('passport-facebook').Strategy;   //Strategy constructor function
const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = () => {
  //Invoked when the user authorization process ends in case there's no session data for a user
  passport.serializeUser((user, done) => {
    done(null, user.id);    //Creating a session and storing user.id in it only, user.id being Mongo's Unique Document ID for said record.
  });

  //Invoked whenever a request for a user's data is made and session data is present for said user
  passport.deserializeUser((id, done) => {
    //Find the user using the _id
    h.findById(id).then((user) => done(null, user))  //Adds to the request object as req.user which contains profile ID, Picture, etc
      .catch((error) => logger.log('error', 'Error when deserializing user: ' + error));
  });                             //Tags the message as an error

  let authProcessor = (accessToken, refreshToken, profile, done) =>{
    //Find a user in the local db using profile.id
    //If the user is found, return the user data using done()
    //If the user is not found, create one in the local db and return
    h.findOne(profile.id).then((result) =>{
      if(result){
        done(null, result);
      }else{
        //Create a new user and return it                                                                   //Tags the message as an error
        h.createNewUser(profile).then((newChatUser) => done(null, newChatUser)).catch((error) => logger.log('error', 'Error Creating New User: ' + error));
      }
    })
  }

  passport.use(new FacebookStrategy(config.fb, authProcessor));
  passport.use(new TwitterStrategy(config.twitter, authProcessor));
}
