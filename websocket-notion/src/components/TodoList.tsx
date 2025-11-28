"use client";

import { useState, useEffect, useRef } from "react";
import { Todo } from "@/types/todo";
import TodoItem from "./TodoItem";

function getInitialTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("todos");
  if (saved) {
    const parsed = JSON.parse(saved);
    return parsed.map((todo: Todo) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
    }));
  }
  return [];
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(getInitialTodos);
  const [newTodoText, setNewTodoText] = useState("");
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodoText.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date(),
    };

    setTodos([...todos, newTodo]);
    setNewTodoText("");
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const editTodo = (id: string, text: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)));
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-2">
          Todo List
        </h1>
        {todos.length > 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {completedCount} / {todos.length} completed
          </p>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-neutral-800 dark:text-white placeholder-neutral-400"
        />
        <button
          onClick={addTodo}
          disabled={!newTodoText.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 dark:text-neutral-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>No tasks yet. Add one above!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ))
        )}
      </div>
    </div>
  );
}
