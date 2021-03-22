
const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  
  // const token = req.header("auth-token");
  const token = req.header("Authorization");
  console.log("at auth.js  token ,  req.header",token, req.header)
  if (!token) return res.status(401).json({ message: "Authentication Failed" });
  try {
    const val = jwt.verify(token, "randomString");
    console.log('val', val)
    req.user = val.user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Token Invalid" });
  }
};

