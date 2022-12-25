const mongoose = require('mongoose');
const CustomError = require('./../middleware/custom_error');
const mongooseOptions = {
    //promiseLibrary: global.Promise,
    //poolSize: 50,//instant connection number
    //keepAlive: 30000,
    //connectTimeoutMS: 5000,
    //reconnectTries: Number.MAX_SAFE_INTEGER,
    //reconnectInterval: 10000,
    useNewUrlParser: true,
    //useCreateIndex: true,
};

const db_init=async ()=>{
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.URI, mongooseOptions,(error)=>{
            if(error){
                throw new CustomError("DB is unreachable or some bug occurred");
            }
        });
}

module.exports = db_init ;