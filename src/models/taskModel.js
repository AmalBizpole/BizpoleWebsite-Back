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


export const getAllTasksWithDetails = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  // Step 1: Get total task count
  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM Tasks');

  // Step 2: Get paginated task rows
  const [taskRows] = await db.query(
    'SELECT * FROM Tasks ORDER BY TaskID DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  // Step 3: For each task, get related ManualStatus and Triggers
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

  // Step 4: Return paginated response
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    tasks: results
  };
};

