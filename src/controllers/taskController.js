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

export const updateTaskWithDetails = async (req, res) => {
  const {
    TaskID,         // 🟢 task ID to update
    TaskName,
    IsInternal,
    IsStatus,
    ManualStatus,
    Triggers,
    TAT,
    TATMeasure,
    TaskNature
  } = req.body;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // ✅ Step 1: Update the main task
    await conn.query(
      `UPDATE Tasks SET TaskName = ?, IsInternal = ?, IsStatus = ?, TAT = ?, TATMeasure = ?, TaskNature = ? WHERE TaskID = ?`,
      [TaskName, IsInternal, IsStatus, TAT, TATMeasure, TaskNature, TaskID]
    );

    // ✅ Step 2: Delete old ManualStatus and Triggers
    await conn.query(`DELETE FROM ManualStatus WHERE TaskID = ?`, [TaskID]);
    await conn.query(`DELETE FROM Triggers WHERE TaskID = ?`, [TaskID]);

    // ✅ Step 3: Insert new ManualStatus
    if (ManualStatus?.length) {
      for (const status of ManualStatus) {
        await conn.query(
          `INSERT INTO ManualStatus (TaskID, StatusText) VALUES (?, ?)`,
          [TaskID, status]
        );
      }
    }

    // ✅ Step 4: Insert new Triggers
    if (Triggers?.length) {
      for (const trigger of Triggers) {
        await conn.query(
          `INSERT INTO Triggers (TaskID, Label, Type) VALUES (?, ?, ?)`,
          [TaskID, trigger.label, trigger.type]
        );
      }
    }

    await conn.commit();
    res.json({ success: true, taskId: TaskID });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, error: 'Update failed' });
  } finally {
    conn.release();
  }
};


export const listTasksWithDetails = async (req, res) => {
  try {
     const page = parseInt(req.body.page) || 1;
  const limit = parseInt(req.body.limit) || 10;
    const tasks = await getAllTasksWithDetails(page, limit);
    res.json({ success: true, tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
};