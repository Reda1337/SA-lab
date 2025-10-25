import {
  Result,
  Task,
  TaskState,
  TaskStatistics,
  TaskStatus,
  TaskUpdate,
} from "./types";
import { randomUUID } from "crypto";

/**
 * Creates a new task with the given properties.
 */
const createTask = (
  title: string,
  description: string,
  priority: number,
  deadline?: Date
): Task => {
  if (priority < 1 || priority > 5) {
    throw new Error("Priority must be between 1 and 5");
  }

  if (!title.trim()) {
    throw new Error("Title cannot be empty");
  }

  return {
    id: randomUUID(),
    title,
    description,
    priority,
    deadline,
    status: "pending",
    createdAt: new Date(),
    completedAt: undefined,
  };
};

/**
 * adds a task to the state and returns the new state.
 */
export const addTask = (
  state: Readonly<TaskState>,
  title: string,
  description: string,
  priority: number,
  deadline?: Date
): TaskState => ({
  tasks: [...state.tasks, createTask(title, description, priority, deadline)],
});

/**
 * Removes a task by id and returns the new state.
 */
const removeTask = (state: Readonly<TaskState>, taskId: string): TaskState => ({
  tasks: state.tasks.filter((task: Task) => task.id !== taskId),
});

/**
 * Gets a task by id.
 * Returns a Result containing the task if found, or an error if not found.
 */
const getTask = (state: Readonly<TaskState>, taskId: string): Result<Task> => {
  const task = state.tasks.find((task: Task) => task.id === taskId);
  return task
    ? { ok: true, value: task }
    : { ok: false, error: new Error("Task not found") };
};

/**
 * Updates the status of a task. Returns the new state.
 */
const updateTaskStatus = (
  state: Readonly<TaskState>,
  taskId: string,
  newStatus: TaskStatus
): TaskState => ({
  tasks: state.tasks.map((task: Task) =>
    task.id === taskId
      ? {
          ...task,
          status: newStatus,
          completedAt:
            newStatus === "completed" ? new Date() : task.completedAt,
        }
      : task
  ),
});

/**
 * Marks a task as in-progress. Returns the new state.
 */
const markInProgress = (
  state: Readonly<TaskState>,
  taskId: string
): TaskState => updateTaskStatus(state, taskId, "in-progress");

/**
 * Marks a task as completed. Returns the new state.
 */
const markCompleted = (state: Readonly<TaskState>, taskId: string): TaskState =>
  updateTaskStatus(state, taskId, "completed");

/**
 * Updates a task's properties. Returns a Result containing the new state if
 * successful, or an error if the task is not found or invalid data is provided.
 */
const updateTask = (
  state: Readonly<TaskState>,
  taskId: string,
  taskUpdate: TaskUpdate
): Result<TaskState, Error> => {
  const taskExists = state.tasks.some((t) => t.id === taskId);

  if (!taskExists) {
    return {
      ok: false,
      error: new Error(`Task with id ${taskId} not found`),
    };
  }

  if (
    taskUpdate.priority !== undefined &&
    (taskUpdate.priority < 1 || taskUpdate.priority > 5)
  ) {
    return {
      ok: false,
      error: new Error("Priority must be between 1 and 5"),
    };
  }

  const newState = {
    tasks: state.tasks.map((task: Task) =>
      task.id === taskId
        ? {
            ...task,
            title: taskUpdate?.title ?? task?.title,
            description: taskUpdate?.description ?? task?.description,
            priority: taskUpdate?.priority ?? task?.priority,
            deadline: taskUpdate?.deadline ?? task?.deadline,
          }
        : task
    ),
  };

  return { ok: true, value: newState };
};

/**
 * Retrieves all tasks from the state.
 */
const getAllTasks = (state: Readonly<TaskState>): ReadonlyArray<Task> =>
  state.tasks;

/**
 * Retrieves tasks by their status.
 */
const getTasksByStatus = (
  state: Readonly<TaskState>,
  status: TaskStatus
): ReadonlyArray<Task> =>
  state.tasks.filter((task: Task) => task.status === status);

/**
 * Retrieves pending tasks.
 */
const getPendingTasks = (state: Readonly<TaskState>): ReadonlyArray<Task> =>
  getTasksByStatus(state, "pending");

/**
 * Retrieves in-progress tasks.
 */
const getInProgressTasks = (state: Readonly<TaskState>): ReadonlyArray<Task> =>
  getTasksByStatus(state, "in-progress");

/**
 * Retrieves completed tasks.
 */
const getCompletedTasks = (state: Readonly<TaskState>): ReadonlyArray<Task> =>
  getTasksByStatus(state, "completed");

/**
 * Sorts tasks by priority (highest to lowest).
 */
export const sortByPriority = (
  tasks: ReadonlyArray<Task>
): ReadonlyArray<Task> =>
  [...tasks].sort((a: Task, b: Task) => b.priority - a.priority);

/**
 * Sorts tasks by deadline (earliest to latest). Tasks without deadlines are
 * placed at the end.
 */
export const sortByDeadline = (
  tasks: ReadonlyArray<Task>
): ReadonlyArray<Task> => {
  const tasksWithoutDeadline = tasks.filter(
    (task: Task) => task.deadline === undefined
  );
  const tasksWithDeadline = tasks.filter(
    (task: Task) => task.deadline !== undefined
  );

  const sortedWithDeadlines = [...tasksWithDeadline].sort(
    (a, b) => a.deadline!.getTime() - b.deadline!.getTime()
  );

  return [...sortedWithDeadlines, ...tasksWithoutDeadline];
};

/**
 * Sorts tasks by priority.
 */
const sortTasksByPriority = (state: Readonly<TaskState>): ReadonlyArray<Task> =>
  sortByPriority(state.tasks);

/**
 * Sorts tasks by deadline.
 */
const sortTasksByDeadline = (state: Readonly<TaskState>): ReadonlyArray<Task> =>
  sortByDeadline(state.tasks);

/**
 * Checks if a task is overdue. A task is considered overdue if it has a deadline
 * and is not completed.
 */
const isOverdue = (task: Task): boolean =>
  task.deadline !== undefined &&
  task.status !== "completed" &&
  task.deadline < new Date();

/**
 * Retrieves overdue tasks.
 */
const getOverdueTasks = (state: Readonly<TaskState>): ReadonlyArray<Task> =>
  state.tasks.filter(isOverdue);

/**
 * Gets the next task to work on based on highest priority.
 * Returns null if there are no pending tasks.
 */
const getNextTask = (state: Readonly<TaskState>): Task | null => {
  const pendingTasks = getPendingTasks(state);
  const sortedByPriority = sortByPriority(pendingTasks);

  return sortedByPriority[0] ?? null;
};

/**
 * Gets the next task to work on based on earliest deadline.
 * Returns null if there are no pending tasks.
 */
const getNextTaskByDeadline = (state: Readonly<TaskState>): Task | null => {
  const pendingTasks = getPendingTasks(state);
  const sortedByDeadline = sortByDeadline(pendingTasks);

  return sortedByDeadline[0] ?? null;
};

/**
 * Marks multiple tasks as completed. Returns the new state.
 */
const markMultipleCompleted = (
  state: Readonly<TaskState>,
  taskIds: string[]
): TaskState => {
  const idSet = new Set(taskIds);
  const now = new Date();

  return {
    tasks: state.tasks.map((task: Task) =>
      idSet.has(task.id) && task.status !== "completed"
        ? {
            ...task,
            status: "completed",
            completedAt: now,
          }
        : task
    ),
  };
};

/**
 * Updates the priority of multiple tasks. Returns a Result containing the new
 * state if successful, or an error if invalid priority is provided.
 */
export const updatePriorities = (
  state: Readonly<TaskState>,
  taskIds: string[],
  newPriority: number
): Result<TaskState, Error> => {
  if (newPriority < 1 || newPriority > 5) {
    return {
      ok: false,
      error: new Error("Priority must be between 1 and 5"),
    };
  }
  const idSet = new Set(taskIds);

  const newState: TaskState = {
    tasks: state.tasks.map((task) =>
      idSet.has(task.id) ? { ...task, priority: newPriority } : task
    ),
  };

  return { ok: true, value: newState };
};

/**
 * Gathers statistics about the tasks in the state.
 */
const getStatistics = (state: Readonly<TaskState>): TaskStatistics => {
  return state.tasks.reduce(
    (stats, task) => {
      const newStats = { ...stats, total: stats.total + 1 };

      if (task.status === "pending") {
        newStats.pending++;
      } else if (task.status === "in-progress") {
        newStats.inProgress++;
      } else if (task.status === "completed") {
        newStats.completed++;
      }

      if (isOverdue(task)) {
        newStats.overdue++;
      }

      return newStats;
    },
    { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 }
  );
};

export {
  removeTask,
  getTask,
  updateTask,
  markInProgress,
  markCompleted,
  getAllTasks,
  getTasksByStatus,
  getPendingTasks,
  getInProgressTasks,
  getCompletedTasks,
  sortTasksByPriority,
  sortTasksByDeadline,
  getOverdueTasks,
  getNextTask,
  getNextTaskByDeadline,
  markMultipleCompleted,
  getStatistics,
};
