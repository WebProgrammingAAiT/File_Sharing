import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import path from 'path';

import { isAdmin, isAuthorized } from '../middlewares/middleware.js'

import { getUserById, getUsers, updateUser } from '../controller/userController.js'

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const __dirname = path.dirname(new URL(import.meta.url).pathname);
        cb(null, './src/uploads/profilePictures')
    },
    filename: function (req, file, cb) {
        cb(null, nanoid() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })


router.get('/users', isAuthorized, getUsers)
router.get('/users/:userId', isAuthorized, getUserById)
router.put('/users/:userId', isAuthorized, upload.single('profilePicture'), updateUser)


export default router;