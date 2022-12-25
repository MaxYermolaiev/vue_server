const express = require('express');
const auth_routing = express.Router();
const helper = require("./../helpers/helper");
const {auth_checking,user_authorization,user_authentication} = require('../middleware/AuthMiddleware')
const UserData = require("../db/schemas/userData")
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs")

//General path - http://localhost:3000/api/
class Authentication {
   //when app has been launched in first check token and send response
   async check_user(req,res){
      try{
         return res.status(200).json({message:'OK'});
      }catch (e) {
         return res.status(500).json({message:'server side error'});
      }
   }

   async authenticate(req,res){
      try{
         //destruct credentials in case missing send error
         const {email,password} = req.credentials;
         const candidate = await UserData.findOne({email});
         if(!candidate){
            return res.status(400).json({message:"Wrong email or user already exist"})
         }

         let passwordCompareError =await bcrypt.compare(password,candidate.password)
         if(!passwordCompareError){
            return res.status(400).json({message: 'Invalid credentials'})
         }
         //if ok, compare hash password with received, and send error if not ok

         const token = jwt.sign({userID: candidate.id}, process.env.JWT,{ expiresIn: '3 days' });
         res.cookie=("token",token,{httpOnly:false, expires: new Date(Date.now() + 86400)})//3 days
         return res.status(200).json({_id:candidate.id, token:token});
         //if ok return payload with id and token wich will be stored in client local storage
      }catch (e) {
         return res.status(500).json({message:'server side error'});
      }
   }

   async authorize(req,res){
      const {password, email, phone, firstname, lastname} = req.body;
      let img = await helper.getRandomImageUrl();
      //destruct prop and get random image user

      try{
         const candidate = await UserData.findOne({email});
         if(candidate){
            return res.status(400).json({message:"User already exist!,create user with another credentials"});
         }
         //try find user with such email, if exist send error
         let hashPassword = await bcrypt.hash(password,12);
         const new_user = new UserData({password:hashPassword, img, email, phone, firstname, lastname});
         await new_user.save();
         //else create new user and send 201 success status'

         return res.status(201).json({message:'New user successfully created'})
      }catch (e) {
         return res.status(500).json({message:'Server side error'})}
      }

   async restore(req,res){
      const {email} = req.body;
      try{
         const user = await UserData.findOne({email});
         if(!user){
            return res.status(400).json({message:"User was not found"});
         }
         //Find required user, if not exist send error

         let hashedPassword = await bcrypt.hash('aaaAAA111',12);
         user.password=hashedPassword;
         await user.save();
         //Assign new default password? and send message

         return res.status(200).json({message:'password was discarded to "aaaAAA111" '})
      }catch (e) {
         return res.status(500).json({message:'Server side error'})}
   }
}

const authentication = new Authentication();
auth_routing.get("/check-user",auth_checking,authentication.check_user);//use for user token validatonn after app launch
auth_routing.post("/authenticate",user_authentication,authentication.authenticate);
auth_routing.post("/restore",authentication.restore)
auth_routing.post("/authorize",user_authorization,authentication.authorize)
module.exports = auth_routing;
