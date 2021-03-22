const User = require('..//models/user.model')

const bycrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");


//Login Controller
async function login(req,res,next){
  console.log("at login controller")
  const emailExist = await User.findOne({email: req.body.email})
  console.log('email found', emailExist)
  if(!emailExist){
    res.status(400).json({error:"Email not Found"})
  }
  console.log('req.body.password & emailExist pw', req.body.password, emailExist.password)
  const checkpassword = await bycrypt.compare(req.body.password, emailExist.password)
  console.log('password  ',checkpassword)
  if(!checkpassword){
    res.status(400).json({error:"Password mismatch"})
  }
  const token = jwt.sign({_id: emailExist.id},'randomString')
  res.header('auth-token',token).json({'Token':token})
}

async function getCurrentUser(req,res){
  console.log("getcurrentUser", req.user)
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
}

module.exports = {
  login,
  getCurrentUser,
}