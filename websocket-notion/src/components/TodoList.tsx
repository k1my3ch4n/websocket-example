"use client";

import { useState } from "react";
import { Todo, TodoStatus } from "@/types/todo";
import TodoItem from "./TodoItem";

const COLUMNS: { status: TodoStatus; title: string; color: string }[] = [
  { status: "pending", title: "대기 중", color: "bg-neutral-500" },
  { status: "in_progress", title: "진행 중", color: "bg-blue-500" },
  { status: "completed", title: "완료", color: "bg-green-500" },
];

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [addingStatus, setAddingStatus] = useState<TodoStatus | null>(null);
  const [newTodoText, setNewTodoText] = useState("");

  const addTodo = (status: TodoStatus) => {
    if (!newTodoText.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: newTodoText.trim(),
      status,
      createdAt: new Date(),
    };

    setTodos([...todos, newTodo]);
    setNewTodoText("");
    setAddingStatus(null);
  };

  const cancelAdd = () => {
    setNewTodoText("");
    setAddingStatus(null);
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const editTodo = (id: string, text: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)));
  };

  const changeStatus = (id: string, status: TodoStatus) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, status } : todo))
    );
  };

  const getTodosByStatus = (status: TodoStatus) =>
    todos.filter((todo) => todo.status === status);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-6">
        Todo Board
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((column) => (
          <div
            key={column.status}
            className="bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">
                {column.title}
              </h2>
              <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
                {getTodosByStatus(column.status).length}
              </span>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {getTodosByStatus(column.status).map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                  onStatusChange={changeStatus}
                />
              ))}
            </div>
            {addingStatus === column.status ? (
              <div className="mt-2 p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTodo(column.status);
                    if (e.key === "Escape") cancelAdd();
                  }}
                  placeholder="새 작업 입력..."
                  autoFocus
                  className="w-full px-2 py-1 bg-transparent outline-none text-sm text-neutral-800 dark:text-white placeholder-neutral-400"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => addTodo(column.status)}
                    disabled={!newTodoText.trim()}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    추가
                  </button>
                  <button
                    onClick={cancelAdd}
                    className="px-3 py-1 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingStatus(column.status)}
                className="mt-2 w-full py-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center justify-center gap-1"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                추가
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
