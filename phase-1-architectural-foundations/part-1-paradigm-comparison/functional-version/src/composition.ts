import { Task, TaskState, TaskStatus } from "./types";
import {
  getPendingTasks,
  sortByPriority,
  sortByDeadline,
} from "./task-operations";
import { pipe as fpPipe } from "fp-ts/function";

/**
 * Filters tasks by minimum priority.
 */
const filterTasksByMinPriority =
  (minPriority: number) =>
  (tasks: ReadonlyArray<Task>): ReadonlyArray<Task> =>
    tasks.filter((task: Task) => task.priority >= minPriority);

/**
 * Filters tasks by their status.
 */
const filterByStatus =
  (status: TaskStatus) =>
  (tasks: ReadonlyArray<Task>): ReadonlyArray<Task> =>
    tasks.filter((task: Task) => task.status === status);

/**
 * Filters tasks with deadlines before the specified date.
 */
const filterByDeadlineBefore =
  (date: Date) =>
  (tasks: ReadonlyArray<Task>): ReadonlyArray<Task> =>
    tasks.filter((task) => task.deadline !== undefined && task.deadline < date);

/**
 * Takes the first n items from an array.
 */
const take =
  <T>(n: number) =>
  (items: ReadonlyArray<T>): ReadonlyArray<T> =>
    items.slice(0, n);

/**
 * Gets the top n priority tasks from the state.
 */
const getTopPriorityTasks = (
  state: TaskState,
  n: number
): ReadonlyArray<Task> =>
  fpPipe(state, getPendingTasks, sortByPriority, take(n));

/**
 * Gets high priority pending tasks (priority >= 4) from the state.
 */
const getHighPriorityPendingTasks = (state: TaskState): ReadonlyArray<Task> =>
  fpPipe(state, getPendingTasks, filterTasksByMinPriority(4), sortByPriority);

/**
 * Gets the next n tasks to work on based on earliest deadlines.
 */
export const getNextTasksByDeadline = (
  state: TaskState,
  n: number
): ReadonlyArray<Task> =>
  fpPipe(state, getPendingTasks, sortByDeadline, take(n));

export {
  filterTasksByMinPriority,
  filterByStatus,
  filterByDeadlineBefore,
  getTopPriorityTasks,
  getHighPriorityPendingTasks,
};
