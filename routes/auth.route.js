const router = require('express').Router()
const login = require('../Controller/auth.controller')
const getCurrentUser = require('../Controller/auth.controller')
const {validateUser} = require('../middleware/validation')
const auth = require('../middleware/auth')

router.post('/user',auth, getCurrentUser.getCurrentUser)
router.post('/schooladmin',auth, getCurrentUser.getCurrentUser)
router.post('/studentadmin',auth, getCurrentUser.getCurrentUser)


module.exports = router