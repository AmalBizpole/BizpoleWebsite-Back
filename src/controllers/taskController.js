import db from '../config/db.js';
import { createTask, insertManualStatus, insertTriggers,getAllTasksWithDetails  } from '../models/taskModel.js';

export const createTaskWithDetails = async (req, res) => {
  const { TaskName, IsInternal, IsStatus, ManualStatus, Triggers,TAT,TATMeasure,TaskNature } = req.body;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const taskId = await createTask(TaskName, IsInternal, IsStatus,TAT,TATMeasure,TaskNature);

    if (ManualStatus?.length) {
      await insertManualStatus(taskId, ManualStatus);
    }

    if (Triggers?.length) {
      await insertTriggers(taskId, Triggers);
    }

    await conn.commit();
    res.json({ success: true, taskId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  } finally {
    conn.release();
  }
};



export const listTasksWithDetails = async (req, res) => {
  try {
    const tasks = await getAllTasksWithDetails();
    res.json({ success: true, tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
};