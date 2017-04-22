'use strict';
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('../config');
const db = require('../db')

if(process.env.NODE_ENV === 'production'){
  //Initialize session with settings for production
  module.exports = session({
    secret: config.sessionSecret,
    resave: false,   //By default set to true, if true it will continue trying to save the session data again and again which slows things down
    saveUninitialized: false,
    store: new MongoStore({   //Unless this is specified the session data will be stored in memory, not good for PROD.  With this it goes to the MongoDB
      mongooseConnection: db.Mongoose.connection  //Contains the open connection to the DB
    })
  })
}else{
  //Initialize session with settings for dev
  module.exports = session({
    secret: config.sessionSecret,
    resave: false,   //By default set to true, if true it will continue trying to save the session data again and again which slows things down
    saveUninitialized: true   //Essentially, no data but still a session cookie, just for DEV
  })
}
