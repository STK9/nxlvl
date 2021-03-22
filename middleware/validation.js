const {check, validationResult} = require('express-validator');

// console.log('at validation ')
exports.validateUser = [
  check('email')
    .trim()
    .normalizeEmail()
    .not()
    .isEmpty()
    .withMessage('Invalid email address!')
    .bail(),
  check('password')
    .not()
    .isEmpty()
    .withMessage('Password cannot be empty')
    .isLength({min: 6})
    .withMessage('Password must be more that 6 characters'),
  (req, res, next) => {
    console.log("at validation,  req.body")
    const errors = validationResult(req);
    console.log("errors", errors)
    if (!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});
    next();
  },
];