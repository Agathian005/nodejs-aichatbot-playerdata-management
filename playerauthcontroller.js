const express = require('express');
const app = express();
const clubplayers = require('../dataformyapi/clubplayers');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fsPromises = require('fs').promises;




const playerlogin = async(req,res)=>{
    const{username,password} = req.body;
    const foundplayer = await clubplayers.findOne({username:username}).exec();
    if(!foundplayer){
        return res.sendStatus(401).json({"message":"no player found"});
    }
    const matchpwd = await bcrypt.compare(password,foundplayer.password);
    if(matchpwd){
        const PLAYER_ROLES = Object.values(foundplayer.playerrole);
        const playeraccesstoken = jwt.sign(
            {"Playerinfo":{
                "username":foundplayer.username,
                "PLAYER_ROLES":PLAYER_ROLES
            }},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:'1m'}
        );
        const playerrefreshtoken = jwt.sign(
            {"username":foundplayer.username},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn:'1d'}
        );
        foundplayer.playerrefreshtoken = playerrefreshtoken;
        const result = await foundplayer.save();
        res.json({playeraccesstoken}); // this gives the token in thunder client
        console.log(result); // 
    }
    else{
        res.sendStatus(401);
    }
};

module.exports = {playerlogin};