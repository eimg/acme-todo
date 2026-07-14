export type Priority = "low" | "medium" | "high";

export const VALID_PRIORITIES: Priority[] = ["low", "medium", "high"];

export interface Todo {
  id: number;
  text: string;
  priority: Priority;
  done: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TodoInput {
  text: string;
  priority?: Priority;
}

export interface TodoUpdate {
  text?: string;
  done?: boolean;
  priority?: Priority;
}

export const DEFAULT_PORT = 8330;
