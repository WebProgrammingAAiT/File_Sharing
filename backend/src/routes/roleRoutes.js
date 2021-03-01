import express from 'express';
import { createRole, deleteRole, updateRole, getRoles, getRole, assignUserRole } from '../controller/roleController.js'
import { isAdmin, isAuthorized } from '../middlewares/middleware.js'
const router = express.Router();

router.post('/roles', isAuthorized, isAdmin, createRole);
router.get('/roles', isAuthorized, isAdmin, getRoles);
router.put('/roles/:id', isAuthorized, isAdmin, updateRole)
router.put('/assignRoles/:userId', isAuthorized, isAdmin, assignUserRole)
router.delete('/roles/:id', isAuthorized, isAdmin, deleteRole)
export default router;