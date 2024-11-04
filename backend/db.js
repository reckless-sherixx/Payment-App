const mongoose = require('mongoose');
mongoose.connect("")
const { Schema } = mongoose;

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minLength:3,
        maxLength:30,
    },
    password:{
        type:String,
        required:true,
        minLength:6
    },
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true
    }
})
const accountSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    balance:{
        type: Number,
        required:true
    }
})
const User = mongoose.model("User",userSchema);
const Account = mongoose.model("Account" , accountSchema)
module.exports={
    User,
    Account

}