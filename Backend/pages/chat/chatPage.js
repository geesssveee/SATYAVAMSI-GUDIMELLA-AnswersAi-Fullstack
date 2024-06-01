const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../../models/user');
const { verifyToken } = require('../../utils/jwt');
const { encode } = require('gpt-3-encoder');
const rateLimit = require('express-rate-limit');

const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";
const HF_API_KEY = process.env.HF_API_KEY;



const chatLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, 
    max: 2, 
    message: 'Too many chat requests, please try again later',
    keyGenerator: (req) => req.user.userId, 
  });

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token' });
  }

  User.findOne({ userId: decoded.userId })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      req.user = user;
      next();
    })
    .catch(error => {
      console.error('Error finding user:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
};


const enforceTokenLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const currentDate = new Date();
    const lastResetDate = new Date(user.lastResetDate);

    console.log('Current Date:', currentDate);
    console.log('Last Reset Date:', lastResetDate);

    // Check if the current date is different from the last reset date
    if (currentDate.toDateString() !== lastResetDate.toDateString()) {
      // Reset tokenUsage to 0 and set lastResetDate to the beginning of the current day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      console.log('Resetting tokenUsage and lastResetDate');
      console.log('Previous tokenUsage:', user.tokenUsage);
      console.log('Previous lastResetDate:', user.lastResetDate);
      user.tokenUsage = 0;
      user.lastResetDate = today;
      console.log('New tokenUsage:', user.tokenUsage);
      console.log('New lastResetDate:', user.lastResetDate);
      await user.save();
      console.log('User document updated');
    }

    console.log('Current tokenUsage:', user.tokenUsage);
    console.log('Daily Token Limit:', user.dailyTokenLimit);

    if (user.tokenUsage >= user.dailyTokenLimit) {
      console.log('Daily token limit exceeded');
      return res.status(403).send({ error: 'Daily token limit exceeded' });
    }
    next();
  } catch (error) {
    console.error('Error enforcing token limit:', error.message);
    res.status(500).send({ error: 'Internal server error' });
  }
};

async function query(data) {
  try {
    const response = await axios.post(HF_API_URL, data, {
      headers: { Authorization: `Bearer ${HF_API_KEY}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error querying Hugging Face API:', error.message);
    throw new Error('Error querying Hugging Face API');
  }
}

router.post('/',authenticateToken, enforceTokenLimit,chatLimiter, async (req, res) => {
  const userPrompt = req.body.prompt;
  const userId = req.user._id;

  if (!userPrompt) {
    return res.status(400).send({ error: 'Prompt is required' });
  }

  try {
    const response = await query({ inputs: userPrompt });


    console.log('Hugging Face API response:', response);


    let generatedResponse = '';
    if (Array.isArray(response) && response.length > 0 && response[0].generated_text) {
      generatedResponse = response[0].generated_text.split(userPrompt).pop().trim();
    } else {
      console.error('Unexpected response structure:', response);
      throw new Error('Unable to extract generated response from API response');
    }


    const tokensUsed = encode(userPrompt).length;


    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { tokenUsage: tokensUsed }, 
        $push: {
          chatHistory: {
            prompt: userPrompt,
            response: generatedResponse, 
            tokens: tokensUsed,
          }
        }
      },
      { new: true }
    );

    res.send({ response: generatedResponse }); 
  } catch (error) {
    console.error('Error handling request:', error.message);
    res.status(500).send({ error: 'Error communicating with Hugging Face API' });
  }
});

module.exports = router;
