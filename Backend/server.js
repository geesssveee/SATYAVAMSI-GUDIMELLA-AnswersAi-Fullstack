require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const cors = require('cors');


app.use(cors());

mongoose.connect(process.env.MONGODB_URI);


app.use(bodyParser.json());


app.use('/', routes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
