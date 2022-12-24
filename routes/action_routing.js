const express = require('express');
const act_router = express.Router();
const userActions = require('../db/schemas/userActions');
const userSchema = require('../db/schemas/userData');
const validator = require('../middleware/credentials_validator');
const {auth_checking} = require("../middleware/AuthMiddleware")
//path - http://localhost:3000/api/users

class ActionRouting {
    async getAllUsers(req, res){
        try {
            let {page,limit,total:memorized_total} = req.query;
            if(memorized_total==='false'){
                memorized_total = await userSchema.estimatedDocumentCount();
            }
            //db fetch data
            let users;
            if(page===1){
                users = await userSchema.find().limit(limit);
            }else{
                let to_skip = (page-1) * limit;
                users = await userSchema.find().limit(limit).skip(to_skip);
            }
            //handle and remove email and password from users collection
            let result = users.map(item=>{
                return {_id:item._id,img:item.img,phone:item.phone,firstname:item.firstname,lastname:item.lastname};
            });
            //result dispatch
            res.status(200).json({result: result, total:memorized_total})
        } catch (e) {
            res.status(500).json({message: "Cant fetch data from db or server trouble"});
        }
    }
    async searchUser(req, res) {
        try {
            let {query} = req.query;
            query = Buffer.from(query, 'base64').toString().split(' ');
            if (!query.length) {
                return res.status(400).json({message: "Payload not provided"});
            }
            //get user and check

            let regexp = new RegExp(".*("+query+").*");
            let result =  await userSchema.find( {limit:5, $or: [{'firstname':{$regex:regexp,$options:'i'} },{'lastname':{$regex:regexp,$options:'i'} },{'phone': {$regex:regexp,$options:'i'}}] })
            result = result.map(item=>{
                return {_id:item._id,img:item.img,phone:item.phone,firstname:item.firstname,lastname:item.lastname};
            });
            //create new reg exp and find users.create new array and remove credentials
            return res.status(200).json({users_list: result});
        } catch (e) {
            return res.status(200).json({message: "Server felt asleep, we are try awake it"});
        }
    }
    async getUser(req, res) {
        try {
            const id = req.params.id;
            const user = await userSchema.findById(id);

            if (!user) {
                return res.status(404).json({message: "User not found"});
            }

            let actions = await userActions.find({executor:id});

            return res.status(200).json({user: user, actions:actions});
        } catch (e) {
            return res.status(500).json({message: "Server side error"});
        }
    }
    async setUserAction(req, res) {
        try {
            let {user} = req.params;
            let user_id = req.credential.userID
            let data = req.body;
            //get id of users
            let assigner = await userSchema.findById({_id:user_id});
            let executor = await userSchema.findById({_id:user});
            if(!assigner||!executor){return res.status(400).json({message: "Executor or assigner is not correct"});}
            //check is user exist
            let errors = validator.test_action(data);
            //validate action for errors
            if (errors.length) {
                return res.status(400).json({message: errors.join(',')});
            }
            //if ok create new one and sen success response
            let new_action = await new userActions({...data,executor:executor,assigned_by:assigner})
            await new_action.save();
            return res.status(201).json({message: "fAction successfully created"});
        } catch (e) {
            return res.status(500).json({message: "Server side error"});
        }
    }
    async updateUserAction(req, res) {
        try {
            let {user,action} = req.params;
            let modify_by = req.credential.userID
            let data = req.body;

            let errors = validator.test_action(data);
            if (errors.length) {
                return res.status(400).json({message: errors.join(',')});
            }

            if (!user||!action||!modify_by){
                return res.status(400).json({message: "Payload is not correct"});
            }

            if(modify_by===user||foundAction.assigned_by===modify_by){

                delete data._id; delete data.assigned_by;delete data.executor;


                let updated = await userActions.findByIdAndUpdate({_id:action},data);
                await updated.save()
                return res.status(200).json({message: "Action was updated"});
            }else{
                return res.status(401).json({message: "You have not credentials for current action"});
            }
        } catch (e) {
            return res.status(500).json({message: "Server side error"});
        }
    }
    async removeUserAction(req, res) {
        try {//remove task able only owner or executor of actions!
            let {user:execute_user,action_id:execute_action} = req.params;//user id with task
            let modify_by = req.credential.userID
            if(!execute_user||!modify_by||!execute_action){
                return res.status(400).json({message: "Removal not possible due to lack data"});
            }

            let action = await userActions.findById({_id:execute_action});
            if(action.executor==execute_user||action.executor==modify_by){
                await userActions.findOneAndDelete({_id:execute_action});
                return res.status(200).json({message: "Action was removed"});
            }else{
                return res.status(400).json({message: "This user cannot remove action"});
            }
        } catch (e) {
            return res.status(500).json({message: "Server side error"});
        }
    }
    async completeUserAction(req, res) {
        try {
            let {user:execute_user,action_id:execute_action} = req.params;//user id with task
            let modify_by = req.credential.userID

            //complete can only executor
            if(execute_user!==modify_by){
                return res.status(401).json({message: "You have not credentials for this operation"});
            }
            let foundAction = await userActions.findById({_id:execute_action});
            if(!foundAction){
                return res.status(400).json({message: "Action were not found"});
            }
            foundAction.completed = true;
            await foundAction.save();

            return res.status(200).json({message: "Action successfully completed"});
        } catch (e) {
            return res.status(500).json({message: "Server side error"});
        }
    }
    async getAction(req, res) {
        try {
            //remove task able only owner of actions!
            let {action_id} = req.params;//user id with task

            if(!action_id){
                return res.status(400).json({message: "Action id not provided"});
            }
            let foundAction = await userActions.findById({_id:action_id});
            if(!foundAction){
                return res.status(400).json({message: "Actions not found"});
            }
            return res.status(200).json({action: foundAction});
        } catch (e) {
            return res.status(500).json({message: "Server side error"});
        }
    }
}

const action_routing = new ActionRouting();

act_router.get("/users", action_routing.getAllUsers);
act_router.get("/users/find" , action_routing.searchUser);
act_router.get("/user/:id", action_routing.getUser);
act_router.get("/user/get-action/:action_id",action_routing.getAction);
act_router.post("/user/:user/create-action",auth_checking,action_routing.setUserAction);
act_router.patch("/user/:user/update-action/:action",auth_checking,action_routing.updateUserAction);
act_router.delete("/user/:user/remove-action/:action_id",auth_checking,action_routing.removeUserAction);
act_router.patch("/user/:user/complete-action/:action_id",auth_checking,action_routing.completeUserAction);
module.exports = act_router;
