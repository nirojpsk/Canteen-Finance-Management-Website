import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import {
createStudent,
getAllStudents,
getStudentById,
updateStudent,
toggleStudentStatus,
getStudentIncomeHistory,
} from '../controllers/studentController.js';

const router = express.Router();

router.post('/', protect, createStudent);
router.get('/', protect, getAllStudents);
router.get('/:id/history', protect, getStudentIncomeHistory);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, updateStudent);
router.patch('/:id/toggle-status', protect, toggleStudentStatus);

export default router;