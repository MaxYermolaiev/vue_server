const {Schema, Types, model} = require("mongoose")


const userActions = new Schema({
        start_date: Date,
        end_date: Date,
        title: {type: String, require: true},
        description: {type: String, require: false},
        completed: {type: Boolean, default: false},
        priority: {type: String, default: false},
        executor_name: {type: String, default:null},
        creator_name: {type: String, default:null},
        executor: {type: Types.ObjectId, ref: 'userData'},
        assigned_by: {type: Types.ObjectId, ref: 'userData'}
})
module.exports = model("UserActions", userActions);