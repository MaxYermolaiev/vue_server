const express = require('express');
const auth_routing = express.Router();
const helper = require("./../helpers/helper");
const {auth_checking,user_authorization,user_authentication} = require('../middleware/AuthMiddleware')
const UserData = require("../db/schemas/userData")
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs")

//path - http://localhost:3000/api/
class Authentication {
   async check_user(req,res){
      try{
         return res.status(200).json({message:'OK'});
      }catch (e) {
         return res.status(500).json({message:'server side error'});
      }
   }

   async authenticate(req,res){
      try{
         const {email,password} = req.credentials;

         const candidate = await UserData.findOne({email});

         if(!candidate){
            return res.status(400).json({message:"Wrong email or user already exist"})
         }

         let passwordCompareError =await bcrypt.compare(password,candidate.password)
         if(!passwordCompareError){
            return res.status(400).json({message: 'Invalid credentials'})
         }
         const token = jwt.sign({userID: candidate.id}, process.env.JWT,{ expiresIn: '3 days' });
         return res.status(200).json({_id:candidate.id, token:token});

      }catch (e) {
         return res.status(500).json({message:'server side error'});
      }
   }

   async authorize(req,res){
      const {password, email, phone, firstname, lastname} = req.body;
      let img = await helper.getRandomImageUrl();
      try{
         const candidate = await UserData.findOne({email});
         if(candidate){
            return res.status(400).json({message:"User already exist!,create user with another credentials"});
         }
         let hashPassword = await bcrypt.hash(password,12);

         const new_user = new UserData({password:hashPassword, img, email, phone, firstname, lastname});
         await new_user.save();
         return res.status(201).json({message:'New user successfully created'})
      }catch (e) {
         return res.status(500).json({message:'Server side error'})}
      }
   async restore(req,res){
      const {email} = req.body;

      try{
         const user = await UserData.findOne({email});
         console.log(user)
         if(!user){
            return res.status(400).json({message:"User was not found"});
         }
         let hashedPassword = await bcrypt.hash('aaaAAA111',12);
         user.password=hashedPassword;
         await user.save();
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
