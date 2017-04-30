'use strict';

if(process.env.NODE_ENV === 'production'){
  //Offer production stage environment variables
  // process.env.REDIS_URL :: redis://redistogo:d99d116b16b040428cccbc6a0c6810afe@cobia.redistogo.com:9899/
let redisURI = require('url').parse(process.env.REDIS_URL);
let redisPassword = redisURI.auth.split(':')[1];

  module.exports = {
    host: process.env.host || "",
    dbURI: process.env.dbURI,
    sessionSecret: process.env.sessionSecret,
    fb: {
      clientID: process.env.fbClientID,
      clientSecret: process.env.fbClientSecret,
      callbackURL: process.env.host + "/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'photos']
    },
    twitter: {
      consumerKey: process.env.twConsumerKey,
      consumerSecret: process.env.twConsumerSecret,
      callbackURL: process.env.host + "/auth/twitter/callback",
      profileFields: ['id', 'displayName', 'photos']
    },
    redis: {
      host: redisURI.hostname,
      port: redisURI.port,
      password: redisPassword
    }
  }
}else{
  //Offer dev stage settings and data
  module.exports = require('./development.json');
}
