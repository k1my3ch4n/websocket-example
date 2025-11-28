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

  const statusLabel = {
    pending: "대기 중",
    in_progress: "진행 중",
    completed: "완료",
  };

  return (
    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 group hover:shadow-md hover:border-stone-300 transition-all">
      <div className="flex items-start gap-3">
        <input
          type="text"
          value={todo.text}
          onChange={(e) => onEdit(todo.id, e.target.value)}
          className={`flex-1 outline-none bg-transparent font-medium ${
            todo.status === "completed"
              ? "line-through text-stone-400"
              : "text-stone-700"
          }`}
        />
        <button
          onClick={() => onDelete(todo.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onStatusChange(todo.id, getNextStatus(todo.status))}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold border bg-white text-stone-600 border-stone-200 transition-all hover:bg-stone-100"
        >
          {statusLabel[todo.status]}
        </button>
      </div>
    </div>
  );
}
