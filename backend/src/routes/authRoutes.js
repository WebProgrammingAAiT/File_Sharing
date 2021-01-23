import express from 'express';
import { signUp, signin } from '../controller/userController.js'
import { signupValidator, signinValidator, isRequestValidated } from '../validators/authValidator.js';
const router = express.Router();

router.post('/signup', signupValidator, isRequestValidated, signUp);
router.post('/signin', signinValidator, isRequestValidated, signin);
export default router;