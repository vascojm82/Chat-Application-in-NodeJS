'use strict';

const winston = require('winston');

                    //Internally will resolve to: require('./winston/logger').Logger & a new instance of the method is created
const logger = new (winston.Logger)({    //Pass the method instance an object to configure how the winston module should work
  transports: [
    /*new (winston.transports.File)({
      level: 'debug',
      filename: './chatCatDebug.log',
      handleExceotions: true            //All errors we are not caching explicitly will be looged as well
    }),*/
    new (winston.transports.Console)({
      level: 'debug',
      json: true,
      handleExceptions: true
    })
  ],
  exitOnError: false                     //Continues logging despite of errors so logging won't come to a halt in the ocurrence of an error
})


module.exports = logger;
