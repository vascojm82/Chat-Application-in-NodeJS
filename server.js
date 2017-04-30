'use strict';
const express = require('express');
const app = express();
const chatCat = require('./app');
const passport = require('passport');

app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));
app.set('view engine', 'ejs');

//Session module must be mounted before the route module otherwise sessions won't work
app.use(chatCat.session);   //Use the express-session instance returned by 'chatCat.session'
//express-session being middleware with access to the 'req' (request object) and 'res' (response object)
//injects the session object instance with all its variables into the 'req' object, therefore the 'req'
//object present in any callback function gives access to the session object and its variables.

app.use(passport.initialize());   //Hooks passport the express's req & res streams

app.use(passport.session());      //Hooks express's session middleware with passport
app.use(require('morgan')('combined', {   //Http request logger
  stream:{
    write: (message) => {
      //Write to logs
      chatCat.logger.log('info', message);
    }
  }
}));

app.use('/', chatCat.router);   //Starting at '/', Use all routes in the router object that's returned
                                //by 'chatCat.router'

chatCat.ioServer(app).listen(app.get('port'), () => {
  console.log('ChatCat Running on Port: ', app.get('port'));
});
