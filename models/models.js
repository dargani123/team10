var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var user = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  facebook: {
    id: String,
    token: String,
    name: String,
    manage_pages: String,
    email: String
  },
  instagram: {
    AccessToken: String, 
    instagramProfile: Object
  },
  twitter: {
    twitterToken: String,    
    twitterTokenSecret: String, 
    twitterProfile: Object
  },
  youtube: {
    accessToken: String,
    refreshToken: String,
    profile: Object
  },
  vine: {
    username: String,
    password: String, 
    profile: Object
  }
});

user.plugin(findOrCreate)

module.exports = {
  User: mongoose.model('User', user)
}
