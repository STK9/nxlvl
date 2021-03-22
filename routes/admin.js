const { check, validationResult } = require("express-validator");
const router = require('express').Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

let User = require('../models/user.model');


router.post("/schooladmin", 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            errors: errors.array()
          });
        }
      const { email, password } = req.body;
      try {
        let user = await User.findOne({
          email
        });
        if (!user)
          return res.status(400).json({
            message: "User Not Exist"
          });
          
          await bcrypt.compare(password,user.password,(err1, res1)=>{
          if (err1){
              return res.status(400).json({
                message: "Incorrect Password !"
              });
          }
          if (res1){
            const payload = {
              user: {
                id: user.id
              }
            };

            jwt.sign(
              payload,
              "randomString",
              {
                expiresIn: 15*6000
              },
              (err, token) => {
                if (err) throw err;
                res.status(200).json({
                  token
                });
              }
            );
          } 
        })

      } catch (e) {
        console.error(e);
        res.status(500).json({
          message: "Server Error"
        });
      }
    }
  );



module.exports = router;