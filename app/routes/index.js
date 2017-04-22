'use strict';
const h = require('../helpers');
const passport = require('passport');
const config = require('../config');

module.exports = () =>{
  let routes = {
    'get':{
      '/': (req, res) =>{
        res.render('login', {
          pageTitle: 'My Login Page'
        });
      },
      '/rooms': [h.isAuthenticated, (req, res) =>{
        res.render('rooms', {
          user: req.user,  //Injects the user's profile from the session into the page
          host: config.host
        });
      }],
      '/chat/:id': [h.isAuthenticated, (req, res, next) =>{
        //Find a chatroom with the given id
        //Render it if the id is found
        let getRoom = h.findRoomById(req.app.locals.chatrooms, req.params.id);
        if(getRoom === undefined){
          return next();  //Jumps to the next route handler middleware in line but there's none so it will jump everything and show the 404 error page
        }else{
          res.render('chatroom', {
            user: req.user,
            host: config.host,
            room: getRoom.room,
            roomID: getRoom.roomID
          });
        }
      }],
      '/getsession': (req,res) =>{    //You get/set all session variables through the req object, express-session takes care of making it this way,
        res.send('Favorite Color: ' + req.session.favColor);  //it builds and manages all your session data
      },
      '/setsession': (req,res) =>{
        req.session.favColor = "Blue";
        res.send("Session Set");
      },
      '/auth/facebook': passport.authenticate('facebook'),              //Sends to Facebook's Login page
      '/auth/facebook/callback': passport.authenticate('facebook', {    //Facebook responds to this callback URL with an accessToken & a refreshToken
        successRedirect: '/rooms',
        failureRedirect: '/'
      }),
      '/auth/twitter': passport.authenticate('twitter'),
      '/auth/twitter/callback': passport.authenticate('twitter',{
        successRedirect: '/rooms',
        failureRedirect: '/'
      }),
      '/logout': (req,res,next) => {
        req.logout();   //method provided by passport, clears out the session
        res.redirect('/');
      }
    },
    'post':{

    },
    'NA': (req, res, next) =>{    //NA always has to be put last or express won't recognize any other route after it.
      res.status(404).sendFile(process.cwd() + '/views/404.htm');
    }                          //Current working process, our 'server.js'
}

return h.route(routes);
}
