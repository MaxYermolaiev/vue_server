const {Schema,Types,model} = require("mongoose");

const userData = new Schema({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    phone: {type:String,required:true},
    firstname: {type:String,required:true},
    lastname: {type:String,required:true},
    img:{type:String,required:true},
    actions:{ type: Types.ObjectId, ref: 'UserActions' }
})
module.exports =model("UserData",userData)