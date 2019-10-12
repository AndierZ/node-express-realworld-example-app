var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config/').secret;

var UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true, required: [true, "Username can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    email: {type: String, lowercase: true, unique: true, required: [true, "Username can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    bio: String,
    image: String,
    salt: String,
    hash: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }]
}, {timestamps: true})

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validatePassword = function(password) {
    let tryHash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return tryHash == this.hash;
};

UserSchema.methods.generateJwt = function() {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(exp.getDate() + 1);

    return jwt.sign({id : this._id, username : this.username, exp: parseInt(exp.getTime() / 1000)}, secret)
};

UserSchema.methods.toAuthJSON = function() {
    return {
        username: this.username,
        email: this.email,
        token: this.generateJwt(),
        bio: this.bio,
        image: this.image
    };
};

UserSchema.methods.toProfileJSONFor = function(user) {
  return {
    username: this.username,
    bio: this.bio,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    followed: false
  };
};

UserSchema.methods.favorite = function(id) {
    if (this.favorites.indexOf(id) == -1) {
        this.favorites.push(id);
    }

    return this.save();
};

UserSchema.methods.unfavorite = function(id) {
    this.favorites.remove(id);
    return this.save();
};

UserSchema.methods.isFavorite = function(id) {
    this.favorites.indexOf(id) != -1;
}

mongoose.model('User', UserSchema);

