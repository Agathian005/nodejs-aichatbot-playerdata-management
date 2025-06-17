const express = require('express');
const clubplayers = require('../dataformyapi/clubplayers'); // mongoose schema data model
const app = express();
const router = express.Router();
const playerprofile = {};
playerprofile.pl = require('../dataformyapi/clubplayers.json');
const playerrole = require('../config/player_roles');
const verifyplayerroles = require('../middlwareformyapi/verifyplayerroles');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');



router.route('/:jerseyno')
    .get(verifyplayerroles(playerrole.clubmember),async(req,res)=>{
        const playerjersey = req.params.jerseyno;
        const playerdata = await clubplayers.findOne({jerseyno:playerjersey}).select('-hashedPassword -playerrefreshtoken'); // u cant get the password and refreshtoken
        if(!playerdata){
            return res.status(404).send({message:'No players found'});
        }
        res.json(playerdata);
});

router.route('/')
    .post(verifyplayerroles(playerrole.coach,playerrole.manager),async(req,res)=>{
        const{username,password,name,position,jerseyno,playerrole} = req.body;
         if(!username||!name||!position||!playerrole||!jerseyno){
            return res.status(404).send({message:'Please fill in all the fields'});
         }
         
         try{
            hashedpwd = await bcrypt.hash(password,10);
            const newplayer = await clubplayers.create({
            username:username,
            password:hashedpwd,
            name:name,
            position:position,
            jerseyno:jerseyno,
            playerrole:playerrole
        });
        res.status(201).json({message:`${name} (${jerseyno}) has been added to database`});
        console.log(newplayer);
        }   
        catch(err){
            console.error(err);
        }
});
        
router.route('/:jerseyno')
    .put(verifyplayerroles(playerrole.player,playerrole.coach,playerrole.manager),async(req,res)=>{
        const jno = parseInt(req.params.jerseyno);
        const {username,name,position,playerrole} = req.body;
        if(!username||!name||!position||!playerrole){
            res.sendStatus(401).json({"message":"missing required fields"});
        }
        const playertobeupdated = await clubplayers.findOne({jerseyno:jno}).exec();
        if(!playertobeupdated){
            res.sendStatus(401).json({"message":"player not found"});
        }
        playertobeupdated.username=username;
        playertobeupdated.name = name;
        playertobeupdated.position = position;
        playertobeupdated.playerrole = playerrole;
        const updated = await playertobeupdated.save();
        res.json(updated);
});
router.route('/:jerseyno')
    .delete(verifyplayerroles(playerrole.manager),async(req,res)=>{
        const jno = parseInt(req.params.jerseyno);
        if(!jno){
            res.status(404).json({"message":"pls enter jersey no of player to be removed from database"});
        }
        const playerdelete = clubplayers.findOne({jerseyno:jno}).exec();
        if(!playerdelete){
            res.sendStatus(401).json({"message":"player not found"});
        }
        const result = await clubplayers.deleteOne({jerseyno:jno}).exec();
        res.json(result);
});



module.exports = router;
