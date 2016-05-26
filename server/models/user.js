// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    username: { type:String, required: 'Please insert username', trim: true, default:'' } ,
    group:    { type:Array, trim: true, default:['user'] } ,
    email:    { type:String, trim: true, default:'' } ,
    isActive: { type:String, trim: true, default:'N' } ,
    local            : {
        username: { type:String, required: 'Please insert username', trim: true, default:'' } ,
        cname: String,
        cemail: String,
        cgroup: String,
        ctype: String,
        password: String,
        curloc: [],
        cgroupname: String,
        cprovincename: String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

},
    {
        collection: 'users', 
        versionKey: false,
        strict : false
    }
);

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
//module.exports = mongoose.model('User', userSchema);
module.exports = mongoose.model('UserModel', userSchema);