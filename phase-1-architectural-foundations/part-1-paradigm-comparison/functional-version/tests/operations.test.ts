import { beforeEach, describe, expect, it } from "@jest/globals";
import { createInitialState } from "../src/state";
import {
  addTask,
  getNextTask,
  getNextTaskByDeadline,
  getOverdueTasks,
  getPendingTasks,
  getStatistics,
  getTask,
  markCompleted,
  markInProgress,
  markMultipleCompleted,
  removeTask,
  sortTasksByPriority,
  updateTask,
} from "../src/task-operations";
import { TaskState } from "../src/types";

describe("Functinal Task scheduler", () => {
  let state: TaskState;

  beforeEach(() => {
    state = createInitialState();
  });

  describe("Task Management", () => {
    it("should add a task to an empty state", () => {
      const newState = addTask(state, "Test title", "Test description", 3);

      expect(newState.tasks.length).toBe(1);
      expect(newState.tasks[0]!.title).toBe("Test title");
      expect(newState.tasks[0]!.priority).toBe(3);
      expect(newState.tasks[0]!.status).toBe("pending");
    });

    it("should add multiple tasks to an empty state", () => {
      let newState = addTask(state, "Task 1", "Desc 1", 5);
      newState = addTask(newState, "Task 2", "Desc 2", 3);
      newState = addTask(newState, "Task 3", "Desc 3", 4);

      expect(newState.tasks.length).toBe(3);
    });

    it("should not mutate original state when adding task", () => {
      const newState = addTask(state, "Test title", "Test description", 3);

      expect(state.tasks.length).toBe(0);
      expect(newState.tasks.length).toBe(1);
    });

    it("should remove a task by id", () => {
      let newState = addTask(state, "Task 1", "Desc 1", 5);
      const taskId = newState.tasks[0]!.id;

      newState = removeTask(newState, taskId);

      expect(newState.tasks.length).toBe(0);
    });

    it("should throw error for invalid priority", () => {
      expect(() => addTask(state, "Task", "Desc", 0)).toThrow();
      expect(() => addTask(state, "Task", "Desc", 6)).toThrow();
    });

    it("should throw error for empty title", () => {
      expect(() => addTask(state, "", "Desc", 3)).toThrow();
      expect(() => addTask(state, "   ", "Desc", 3)).toThrow();
    });

    it("should get a task by id", () => {
      let newState = addTask(state, "Test task", "Description", 3);
      const taskId = newState.tasks[0]!.id;

      const result = getTask(newState, taskId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.title).toBe("Test task");
      }
    });

    it("should return error for non-existent task", () => {
      const result = getTask(state, "non-existent-id");

      expect(result.ok).toBe(false);
    });
  });

  describe("Status Management", () => {
    it("should mark task as in-progress", () => {
      let newState = addTask(state, "Task", "Desc", 3);
      const taskId = newState.tasks[0]!.id;

      newState = markInProgress(newState, taskId);

      expect(newState.tasks[0]!.status).toBe("in-progress");
    });

    it("should mark task as completed", () => {
      let newState = addTask(state, "Task", "Desc", 3);
      const taskId = newState.tasks[0]!.id;

      newState = markCompleted(newState, taskId);

      expect(newState.tasks[0]!.status).toBe("completed");
      expect(newState.tasks[0]!.completedAt).toBeInstanceOf(Date);
    });

    it("should not mutate original state when changing status", () => {
      let newState = addTask(state, "Task", "Desc", 3);
      const taskId = newState.tasks[0]!.id;

      const originalStatus = newState.tasks[0]!.status;
      const completedState = markCompleted(newState, taskId);

      expect(newState.tasks[0]!.status).toBe(originalStatus);
      expect(completedState.tasks[0]!.status).toBe("completed");
    });

    it("should get pending tasks", () => {
      let newState = addTask(state, "Task 1", "Desc 1", 5);
      newState = addTask(newState, "Task 2", "Desc 2", 3);
      const task1Id = newState.tasks[0]!.id;

      newState = markCompleted(newState, task1Id);

      const pending = getPendingTasks(newState);
      expect(pending.length).toBe(1);
      expect(pending[0]!.title).toBe("Task 2");
    });
  });

  describe("Scheduling", () => {
    beforeEach(() => {
      state = addTask(state, "Low priority", "Desc", 2);
      state = addTask(state, "High priority", "Desc", 5);
      state = addTask(state, "Medium priority", "Desc", 3);
    });

    it("should get next task by priority", () => {
      const next = getNextTask(state);

      expect(next).not.toBeNull();
      expect(next!.title).toBe("High priority");
      expect(next!.priority).toBe(5);
    });

    it("should return null when no pending tasks", () => {
      let newState = createInitialState();
      newState = addTask(newState, "Task", "Desc", 5);
      const taskId = newState.tasks[0]!.id;
      newState = markCompleted(newState, taskId);

      const next = getNextTask(newState);
      expect(next).toBeNull();
    });

    it("should sort tasks by priority", () => {
      const sorted = sortTasksByPriority(state);

      expect(sorted[0]!.priority).toBe(5);
      expect(sorted[1]!.priority).toBe(3);
      expect(sorted[2]!.priority).toBe(2);
    });

    it("should get next task by deadline", () => {
      let newState = createInitialState();
      newState = addTask(newState, "Task 1", "Desc", 3, new Date("2025-10-30"));
      newState = addTask(newState, "Task 2", "Desc", 5, new Date("2025-10-25"));

      const next = getNextTaskByDeadline(newState);

      expect(next).not.toBeNull();
      expect(next!.title).toBe("Task 2");
    });
  });

  describe("Batch Operations", () => {
    beforeEach(() => {
      state = addTask(state, "Task 1", "Desc 1", 5);
      state = addTask(state, "Task 2", "Desc 2", 3);
      state = addTask(state, "Task 3", "Desc 3", 4);
    });

    it("should mark multiple tasks as completed", () => {
      const taskIds = state.tasks.slice(0, 2).map((t) => t.id);

      const newState = markMultipleCompleted(state, taskIds);

      const completed = newState.tasks.filter((t) => t.status === "completed");
      expect(completed.length).toBe(2);
    });

    it("should update priorities for multiple tasks", () => {
      const taskIds = state.tasks.slice(0, 2).map((t) => t.id);

      const result = updateTask(state, taskIds[0]!, { priority: 1 });

      expect(result.ok).toBe(true);
    });
  });

  describe("Statistics", () => {
    beforeEach(() => {
      state = addTask(state, "Task 1", "Desc 1", 5);
      state = addTask(state, "Task 2", "Desc 2", 3);
      state = addTask(state, "Task 3", "Desc 3", 4);

      const task1Id = state.tasks[0]!.id;
      state = markCompleted(state, task1Id);

      const task2Id = state.tasks[1]!.id;
      state = markInProgress(state, task2Id);
    });

    it("should calculate correct statistics", () => {
      const stats = getStatistics(state);

      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.completed).toBe(1);
    });

    it("should count overdue tasks", () => {
      let newState = createInitialState();
      newState = addTask(
        newState,
        "Overdue task",
        "Desc",
        5,
        new Date("2020-01-01")
      );

      const overdue = getOverdueTasks(newState);
      expect(overdue.length).toBe(1);
    });

    it("should not count completed tasks as overdue", () => {
      let newState = createInitialState();
      newState = addTask(
        newState,
        "Past task",
        "Desc",
        5,
        new Date("2020-01-01")
      );
      const taskId = newState.tasks[0]!.id;
      newState = markCompleted(newState, taskId);

      const overdue = getOverdueTasks(newState);
      expect(overdue.length).toBe(0);
    });
  });

  describe("Immutability", () => {
    it("should not mutate state when adding task", () => {
      const originalLength = state.tasks.length;
      const newState = addTask(state, "New task", "Desc", 3);

      expect(state.tasks.length).toBe(originalLength);
      expect(newState.tasks.length).toBe(originalLength + 1);
    });

    it("should not mutate tasks array directly", () => {
      let newState = addTask(state, "Task", "Desc", 3);
      const originalTasks = newState.tasks;

      newState = addTask(newState, "Another task", "Desc", 5);

      expect(originalTasks).not.toBe(newState.tasks);
    });

    it("should not mutate individual task objects", () => {
      let newState = addTask(state, "Task", "Desc", 3);
      const originalTask = newState.tasks[0]!;
      const taskId = originalTask.id;

      newState = markCompleted(newState, taskId);

      expect(originalTask.status).toBe("pending");
      expect(newState.tasks[0]!.status).toBe("completed");
    });
  });

  describe("Update Operations", () => {
    it("should update task title", () => {
      let newState = addTask(state, "Old title", "Desc", 3);
      const taskId = newState.tasks[0]!.id;

      const result = updateTask(newState, taskId, { title: "New title" });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.tasks[0]!.title).toBe("New title");
      }
    });

    it("should update task priority", () => {
      let newState = addTask(state, "Task", "Desc", 3);
      const taskId = newState.tasks[0]!.id;

      const result = updateTask(newState, taskId, { priority: 5 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.tasks[0]!.priority).toBe(5);
      }
    });

    it("should return error for invalid priority update", () => {
      let newState = addTask(state, "Task", "Desc", 3);
      const taskId = newState.tasks[0]!.id;

      const result = updateTask(newState, taskId, { priority: 10 });

      expect(result.ok).toBe(false);
    });

    it("should return error for non-existent task", () => {
      const result = updateTask(state, "non-existent", { title: "New" });

      expect(result.ok).toBe(false);
    });
  });
});
