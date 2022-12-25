const jwt = require('jsonwebtoken')
const secret = process.env.JWT;
const validator = require('./validator');

const user_authorization= (req, res, next) => {
    const {password, email, phone, firstname, lastname} = req.body;
    if (!password || !email || !lastname || !phone || !firstname) {
        return res.status(400).json({message: 'Invalid credentials'});
    }
    let isError = validator.test({password, email, phone, firstname, lastname});
    if (isError.length) {
        return res.status(400).json({message: isError.join(',')});
    }
    next();
}

const user_authentication= (req,res,next) =>{
    const authentication = req.headers['authorization']
    const [type,credentials] = authentication.split(' ');
    const [email, password] = Buffer.from(credentials, 'base64')
        .toString()
        .split(':');

    if(!email||!password){
        return res.status(400).json({ message: 'credentials are not valid' });
    }

    const isErrors = null//validate.test({email, password})
    if(isErrors){
        res.status(400).json({ message: 'credentials are not corresponds criteria',
            error:isErrors
        });
    }
    req.credentials={email,password}
    next();
}

const  auth_checking = async (req,res,next)=>{
    req.method==="OPTIONS"?next:null;
    try{
        const token = req.headers['x-token'];
        if(!token){
            return res.status(401).json({message: "Token is not available any more, login again"});
        }
        let decoded = await jwt.verify(token,secret);
        req.credential = decoded;
        next()
    }catch(e){
        res.status(500).json({message: "Server side error"})
    }
}

module.exports = {auth_checking,user_authorization,user_authentication}


