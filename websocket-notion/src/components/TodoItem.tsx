"use client";

import { Todo, TodoStatus } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
}

export default function TodoItem({
  todo,
  onDelete,
  onEdit,
  onStatusChange,
}: TodoItemProps) {
  const getNextStatus = (current: TodoStatus): TodoStatus => {
    switch (current) {
      case "pending":
        return "in_progress";
      case "in_progress":
        return "completed";
      case "completed":
        return "pending";
    }
  };

  return (
    <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 group hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={todo.text}
          onChange={(e) => onEdit(todo.id, e.target.value)}
          className={`flex-1 outline-none bg-transparent text-sm ${
            todo.status === "completed"
              ? "line-through text-neutral-400 dark:text-neutral-500"
              : "text-neutral-800 dark:text-neutral-200"
          }`}
        />
        <button
          onClick={() => onDelete(todo.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-all"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <button
        onClick={() => onStatusChange(todo.id, getNextStatus(todo.status))}
        className={`text-xs px-2 py-1 rounded-full transition-colors ${
          todo.status === "pending"
            ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
            : todo.status === "in_progress"
            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
            : "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
        }`}
      >
        {todo.status === "pending"
          ? "대기 중"
          : todo.status === "in_progress"
          ? "진행 중"
          : "완료"}
      </button>
    </div>
  );
}
