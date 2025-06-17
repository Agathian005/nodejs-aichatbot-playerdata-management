const jwt = require('jsonwebtoken');
const path = require('path');
const express = require('express');
const app = express();


const verifytoken = (req,res,next)=>{
    const header = req.headers['authorization'];
    if(!header) return res.status(401).json({"message": 'No token provided'});
    const playertoken = header.split(' ')[1];
    jwt.verify(
        playertoken,
        process.env.ACCESS_TOKEN_SECRET,
        (err,decoded)=>{
            if(err) return res.status(403).json({"message": 'Token is invalid'});
            req.playerusername = decoded.Playerinfo.username;
            req.PLAYER_ROLES = decoded.Playerinfo.PLAYER_ROLES;
            next();
    
        }
    );
}


module.exports = verifytoken;