const express = require('express')
const cors = require("cors");
const jwt = require('jsonwebtoken');
const cooke= require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;


// MIDILEWARE 
app.use(express.json());
app.use(cors());
app.use(cooke());



// SERVER OPPENIG MESSAGE 
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})