export type TaskStatus = "pending" | "in-progress" | "completed";

// Task entity
export interface Task {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly priority: number;
  readonly status: TaskStatus;
  readonly createdAt: Date;
  readonly deadline?: Date;
  readonly completedAt?: Date;
}

// Application state
export interface TaskState {
  readonly tasks: ReadonlyArray<Task>;
}

// Result type for error handling
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// Task statistics
export interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

// Task update operations
export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: number;
  deadline?: Date | null;
}
