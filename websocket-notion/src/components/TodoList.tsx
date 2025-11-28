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
  const [newTodoText, setNewTodoText] = useState("");

  const addTodo = () => {
    if (!newTodoText.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: newTodoText.trim(),
      status: "pending",
      createdAt: new Date(),
    };

    setTodos([...todos, newTodo]);
    setNewTodoText("");
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-4">
          Todo Board
        </h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="새 작업 추가..."
            className="flex-1 px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-neutral-800 dark:text-white placeholder-neutral-400"
          />
          <button
            onClick={addTodo}
            disabled={!newTodoText.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            추가
          </button>
        </div>
      </div>

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
          </div>
        ))}
      </div>
    </div>
  );
}
