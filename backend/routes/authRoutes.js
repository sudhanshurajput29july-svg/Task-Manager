import express from 'express';
import multer from 'multer';
import { registerUser, loginUser, getEmployees, createEmployee, updateProfile, uploadAvatar, updateEmployeeRole, getUserProfile } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', registerUser);
router.post('/login', loginUser);

router.route('/employees')
  .get(protect, getEmployees)
  .post(protect, admin, createEmployee);

router.put('/employees/:id/role', protect, admin, updateEmployeeRole);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateProfile);
router.post('/profile/upload', protect, upload.single('avatar'), uploadAvatar);

export default router;
