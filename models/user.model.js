const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
  // _id: String,
  // name: {
  //   type: String,
  //   required: true,
  //   max: 200,
  // },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6
  },
},{timestamps: true}
)
module.exports = mongoose.model('User',userSchema)