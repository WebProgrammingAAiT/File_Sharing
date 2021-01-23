import express from 'express';
import { isAdmin, isAuthorized } from '../middlewares/middleware.js'
import { createCategory, getCategories } from '../controller/categoryController.js'

const router = express.Router();

router.post('/categories', isAuthorized, isAdmin, createCategory)
router.get('/categories', getCategories)
export default router;