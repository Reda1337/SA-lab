import { TaskState } from "./types";

/**
 * Creates initial empty state
 */
export const createInitialState = (): TaskState => ({
  tasks: [],
});
