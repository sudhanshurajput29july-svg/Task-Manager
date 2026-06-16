import express from 'express';
import { registerUser, loginUser, getEmployees, createEmployee } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.route('/employees')
  .get(protect, getEmployees)
  .post(protect, admin, createEmployee);

export default router;
