import { Task, TaskState } from "./types";

/**
 * Formats a Date object into a human-readable string.
 */
const formatDate = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/**
 * Formats a task into a readable string.
 */
const formatTask = (task: Task): string => {
  const deadline = task.deadline ? ` (Due: ${formatDate(task.deadline)})` : "";
  const status = task.status.toUpperCase();
  return `[${status}] ${task.title} - Priority: ${task.priority}${deadline}`;
};

/**
 * Prints a list of tasks to the console.
 */
const printTasks = (tasks: ReadonlyArray<Task>): void => {
  if (tasks.length === 0) {
    console.log("No tasks found.");
    return;
  }

  tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${formatTask(task)}`);
  });
};

/**
 * Prints a summary of the task state.
 */
const printStateSummary = (state: TaskState): void => {
  console.log("\n=== Task Scheduler State ===");
  console.log(`Total tasks: ${state.tasks.length}`);
  printTasks(state.tasks);
  console.log("============================\n");
};

export { formatDate, formatTask, printTasks, printStateSummary };
