//packages
const logger = require ('./middleware/winston')
const express = require('express');
const path = require('path');
require("dotenv").config({path:path.resolve(__dirname, 'config/.env')});
const cors=require("cors");
const CustomError = require ('./middleware/custom_error');
const db_init = require ('./db/db');
const limiter = require ('./middleware/limiter');

//middleware
const router = require('./routes/index');
const bindErrorHandlers = require("./middleware/bindErrorHandlers");

//init variables
const port = process.env.PORT||3000;
const app = express();

//app tune
app.use(cors({Origin: "*"}));
app.use(express.json({extended:true}));
app.use(express.urlencoded({ extended: false }));
app.use(limiter);

//app.use(express.static(path.join(__dirname, 'public')));
//apply general and handle rest not existing routs
/*app.use('/', express.static(path.join(__dirname, 'client', 'build')))
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
});*/
app.use('/api', router);
app.all('/api\*',(req,res,next)=>{
    const error = new CustomError();
    error.status= 404;
    error.message= "Required route does not exist";
    next(error);
})

//binding error handlers
app.use((error,req,res,next)=>{
    if(error instanceof CustomError){
        return res.status(error.status).json({message:error.message})
    }
    return res.status(500).json({message:"Server feels badly, bring a pill and beer"})
});
bindErrorHandlers(logger);//bind unhandled rejection errors in promises

//app running
let timer;
async function riseServer(){
    try{
        app.listen(port,()=>{logger.info("Logger: server was run")})
        await db_init();
        clearInterval(timer);
    }catch (e) {
        timer = setInterval(()=> riseServer(),10000);
        logger.error(e.message)
        return res.status(500).json({message:e.message})
    }
}
riseServer();

