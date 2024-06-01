const express = require('express');
const router = express.Router();
const loginPage = require('./pages/loginPage');
const signUpPage = require('./pages/signUpPage');
const chatPage = require('./pages/chat/chatPage');
const tokenPage = require('./pages/chat/tokenPage');
const idpage = require('./pages/id');

router.get('/', (req, res) => {
    res.send('Welcome to the home page!');
  });

//Page routes
router.use('/login', loginPage);
router.use('/signup', signUpPage);
router.use('/chat', chatPage);
router.use('/tokens', tokenPage);
router.use('/id', idpage);


module.exports = router;