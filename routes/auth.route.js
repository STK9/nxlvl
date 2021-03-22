const router = require('express').Router()
const login = require('../Controller/auth.controller')
const getCurrentUser = require('../Controller/auth.controller')
const {validateUser} = require('../middleware/validation')
const auth = require('../middleware/auth')

console.log("auth route before /login")
// router.post('/login',validateUser,login.login)
// router.post('/user',validateUser,login.login)

// router.get('/user',auth, getCurrentUser.getCurrentUser)


console.log("auth route")
router.post('/user',auth, getCurrentUser.getCurrentUser)
router.post('/schooladmin',auth, getCurrentUser.getCurrentUser)


module.exports = router