const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const app = express();
const helmet = require('helmet') // creates headers that protect from attacks (security)
const cors = require('cors')  // allows/disallows cross-site communication

require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})


// REMOVE THIS PART FOR HEROKU 
//** MIDDLEWARE ** 
// const whitelist = ['http://localhost:3000', 'http://localhost:5000', 'http://nv1.herokuapp.com'] 
// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log("** Origin of request " + origin)
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       console.log("Origin acceptable")
//       callback(null, true)
//     } else {
//       console.log("Origin rejected")
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors(corsOptions))
// REMOVE THIS PART FOR HEROKU-------

app.use(helmet())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes : Order of routes is VERY important!!!
const usersRouter = require('./routes/users');
// app.use('/user/login', usersRouter);

app.use('/',usersRouter)   

// Authorise before allowing access
const authRouter = require('./routes/auth.route');
app.use('/user', authRouter)
//Admin Routes:  auth.js before gaining access to the Admin components
app.use('/schooladmin', authRouter);   

app.get('/', function(req,res){
  res.send('Server API is working++')
})


if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
// Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000
app.listen(PORT, (req, res) => {
    console.log(`server listening on port: ${PORT}`)
  });
