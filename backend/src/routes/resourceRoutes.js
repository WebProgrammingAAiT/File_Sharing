import express from 'express';
import { createResource, getResources, getResourceById, likeDislikeResource, updateResource, deleteResource } from '../controller/resourceController.js';
import { isUser, isAuthorized } from '../middlewares/middleware.js'
import multer from 'multer';
import { nanoid } from 'nanoid';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const __dirname = path.dirname(new URL(import.meta.url).pathname);
        cb(null, './src/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, nanoid() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })

router.post('/resources', isAuthorized, isUser, upload.array('files'), createResource)
router.get('/resources', isAuthorized, isUser, getResources)
router.get('/resources/:resourceId', isAuthorized, isUser, getResourceById)
router.put('/resources/:resourceId/update', isAuthorized, isUser, updateResource)
router.put('/resources/:resourceId', isAuthorized, isUser, likeDislikeResource)
router.delete('/resources/:resourceId/delete', isAuthorized, isUser, deleteResource)




export default router;