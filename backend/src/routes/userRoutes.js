import express from 'express';
import { isAdmin, isAuthorized } from '../middlewares/middleware.js'

import { getUserById, getUsers } from '../controller/userController.js'

const router = express.Router();

router.get('/users', isAuthorized, getUsers)
router.get('/users/:userId', isAuthorized, getUserById)

export default router;