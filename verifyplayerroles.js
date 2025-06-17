const verifyclubroles = (...allowedroles)=>{
    return (req,res,next)=>{
        if(!req?.PLAYER_ROLES)
            return res.sendStatus(401);
        const arrayofroles = [...allowedroles];
        console.log(arrayofroles);
        console.log(req.PLAYER_ROLES);
        const r = req.PLAYER_ROLES.map(PLAYER_ROLES=>arrayofroles.includes(PLAYER_ROLES)).find(val=>val===true); // checks if roles of user matches any of the allowed roles
        if(!r){
            return res.status(403).send("You do not have permission to access this resource");
        }
        next();
        
    }
}
module.exports = verifyclubroles ;