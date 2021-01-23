import pkg from 'express-validator';
const { check } = pkg;
const { validationResult } = pkg;

export const signupValidator = [
    check('firstName')
        .notEmpty()
        .withMessage('First Name is required'),
    check('lastName')
        .notEmpty()
        .withMessage('Last Name is required'),
    check('email')
        .isEmail()
        .withMessage('Email must be properly formatted'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    check('password')
        .isString()
        .withMessage('Password must be string')
]

export const signinValidator = [

    check('email')
        .isEmail()
        .withMessage('Email must be properly formatted'),
    check('password')
        .notEmpty()
        .withMessage('Password can\'t be empty')
    ,
    check('password')
        .isString()
        .withMessage('Password must be string')
]

export const isRequestValidated = (req, res, next) => {
    // * checking validation result from express validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
}