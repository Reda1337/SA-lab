// index.ts

import {
  getHighPriorityPendingTasks,
  getNextTasksByDeadline,
  getTopPriorityTasks,
} from "./composition";
import { createInitialState } from "./state";
import {
  addTask,
  getAllTasks,
  getNextTask,
  getNextTaskByDeadline,
  getOverdueTasks,
  getStatistics,
  markCompleted,
  markInProgress,
  markMultipleCompleted,
  updateTask,
} from "./task-operations";
import { TaskState } from "./types";
import { formatTask, printStateSummary, printTasks } from "./utils";

/**
 * Main function demonstrating functional task scheduler
 */
const main = (): void => {
  console.log("Functional Task Scheduler\n");

  // Initialize empty state
  let state: TaskState = createInitialState();
  console.log("Initial state created.");

  // Add tasks (each operation returns NEW state)
  console.log("\nAdding tasks...");
  state = addTask(
    state,
    "Fix login bug",
    "Users cannot log in with email addresses",
    5,
    new Date("2025-10-25")
  );
  console.log("  Added: Fix login bug (priority 5)");

  state = addTask(
    state,
    "Write API documentation",
    "Document all REST endpoints",
    3,
    new Date("2025-10-30")
  );
  console.log("  Added: Write API documentation (priority 3)");

  state = addTask(
    state,
    "Review pull request #123",
    "Code review for new feature",
    4,
    new Date("2025-10-23")
  );
  console.log("  Added: Review pull request #123 (priority 4)");

  state = addTask(
    state,
    "Update npm dependencies",
    "Update all packages to latest versions",
    2
  );
  console.log("  Added: Update npm dependencies (priority 2)");

  state = addTask(
    state,
    "Refactor authentication module",
    "Clean up auth code",
    4,
    new Date("2025-10-28")
  );
  console.log("  Added: Refactor authentication module (priority 4)");

  // Display all tasks
  console.log("\nAll tasks:");
  printTasks(getAllTasks(state));

  // Get next task by priority
  console.log("\nNext task to work on (by priority):");
  const nextTask = getNextTask(state);
  if (nextTask) {
    console.log(`  -> ${formatTask(nextTask)}`);

    // Mark it as in-progress
    console.log("\nMarking task as in progress...");
    state = markInProgress(state, nextTask.id);
    console.log("  Task marked as in progress.");
  }

  // Get next task by deadline
  console.log("\nNext task to work on (by deadline):");
  const nextByDeadline = getNextTaskByDeadline(state);
  if (nextByDeadline) {
    console.log(`  → ${formatTask(nextByDeadline)}`);
  }

  // Get top 3 priority tasks using composition
  console.log("\nTop 3 priority pending tasks:");
  const topTasks = getTopPriorityTasks(state, 3);
  printTasks(topTasks);

  // Get high priority pending tasks
  console.log("\nHigh priority pending tasks (>= 4):");
  const highPriorityTasks = getHighPriorityPendingTasks(state);
  printTasks(highPriorityTasks);

  // Complete a task
  console.log("\nCompleting a task...");
  if (nextTask) {
    state = markCompleted(state, nextTask.id);
    console.log(`  Completed: ${nextTask.title}`);
  }

  // Batch complete multiple tasks
  console.log("\nBatch completing tasks...");
  const taskIds = state.tasks
    .filter((t) => t.priority <= 3 && t.status === "pending")
    .map((t) => t.id);

  state = markMultipleCompleted(state, taskIds);
  console.log(`  Completed ${taskIds.length} low-priority tasks`);

  // Update a task
  console.log("\nUpdating task priority...");
  const taskToUpdate = state.tasks.find((t) => t.status === "pending");
  if (taskToUpdate) {
    const updateResult = updateTask(state, taskToUpdate.id, { priority: 5 });
    if (updateResult.ok) {
      state = updateResult.value;
      console.log(`  Updated priority for: ${taskToUpdate.title}`);
    }
  }

  // Get statistics
  console.log("\nStatistics:");
  const stats = getStatistics(state);
  console.log(`  Total tasks: ${stats.total}`);
  console.log(`  Pending: ${stats.pending}`);
  console.log(`  In Progress: ${stats.inProgress}`);
  console.log(`  Completed: ${stats.completed}`);
  console.log(`  Overdue: ${stats.overdue}`);

  // Check for overdue tasks
  console.log("\nOverdue tasks:");
  const overdueTasks = getOverdueTasks(state);
  if (overdueTasks.length === 0) {
    console.log("  No overdue tasks.");
  } else {
    printTasks(overdueTasks);
  }

  // Get next tasks by deadline
  console.log("\nNext 3 tasks by deadline:");
  const nextByDeadlines = getNextTasksByDeadline(state, 3);
  printTasks(nextByDeadlines);

  // Final state
  printStateSummary(state);

  // Demonstrate immutability
  console.log("Demonstrating immutability:");
  const originalTaskCount = state.tasks.length;
  console.log(`  Original task count: ${originalTaskCount}`);

  // Try to add a task to a "copy" but actually creates new state
  const newState = addTask(state, "New task", "Description", 3);

  console.log(`  Original state task count (unchanged): ${state.tasks.length}`);
  console.log(`  New state task count: ${newState.tasks.length}`);
  console.log("  Original state was not mutated.");
};

// Run the example
if (require.main === module) {
  main();
}
