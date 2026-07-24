export interface Todo {
  id: number;
  text: string;
  done: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TodoInput {
  text: string;
}

export interface TodoUpdate {
  text?: string;
  done?: boolean;
}

export const DEFAULT_PORT = 8330;

export const MAX_TEXT_LENGTH = 1000;
