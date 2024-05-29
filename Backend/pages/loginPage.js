const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.post('/',async(req,res) =>{
    try {
        const { userId,password} = req.body;
        const user = await User.findOne({userId});

        if (user) {
            console.log(user.creds.password);
            if (password === user.creds.password){
                res.status(200).json({message:'Login Successful'});
            }else{
                console.log(user.creds.password)
                res.status(401).json({message:'Invalid Password'});
            }
        }else{
            res.status(404).json({message:'User not found. Please create an account.'});
        }

    } catch(error){
        console.error('Error during login:',error);
        res.status(500).json({message:'Internal server error'})
    }
});
module.exports = router;