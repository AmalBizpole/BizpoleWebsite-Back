import db from '../config/db.js';

export const createTask = async (TaskName, IsInternal, IsStatus,TAT,TATMeasure,TaskNature) => {
  const [result] = await db.query(
    'INSERT INTO Tasks (TaskName, IsInternal, IsStatus,TAT,TATMeasure,TaskNature ) VALUES (?, ?, ?,?,?,?)',
    [TaskName, IsInternal, IsStatus,TAT,TATMeasure,TaskNature]
  );
  return result.insertId;
};

export const insertManualStatus = async (taskId, statuses) => {
  const values = statuses.map(status => [taskId, status]);
  await db.query(
    'INSERT INTO ManualStatus (TaskID, StatusText) VALUES ?',
    [values]
  );
};


export const insertTriggers = async (taskId, triggers) => {
  const values = triggers.map(trigger => [taskId, trigger.label, trigger.type]);
  await db.query(
    'INSERT INTO Triggers (TaskID, Label, Type) VALUES ?',
    [values]
  );
};


export const getAllTasksWithDetails = async () => {
  const [taskRows] = await db.query('SELECT * FROM Tasks');

  const results = await Promise.all(
    taskRows.map(async (task) => {
      const [manualStatusRows] = await db.query(
        'SELECT StatusText FROM ManualStatus WHERE TaskID = ?',
        [task.TaskID]
      );

      const [triggerRows] = await db.query(
        'SELECT Label, Type FROM Triggers WHERE TaskID = ?',
        [task.TaskID]
      );

      return {
        taskId: task.TaskID,
        taskName: task.TaskName,
        isInternal: task.IsInternal,
        isStatus: task.IsStatus,
        manualStatus: manualStatusRows.map(r => r.StatusText),
        triggers: triggerRows.map(r => ({
          label: r.Label,
          type: r.Type
        }))
      };
    })
  );

  return results;
};
