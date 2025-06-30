import express from 'express';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

// router.get('/', taskController.list);
// router.get('/new', taskController.createForm);
router.post('/createTask', taskController.createTaskWithDetails);
router.post('/getAllTask', taskController.listTasksWithDetails);
router.put('/updateTask', taskController.updateTaskWithDetails);

// router.get('/:id', taskController.show);
// router.get('/:id/edit', taskController.editForm);
// router.post('/:id/edit', taskController.update);
// router.post('/:id/delete', taskController.delete);

export default router;
