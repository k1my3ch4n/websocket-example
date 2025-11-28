"use client";

import { useState } from "react";
import { Todo, TodoStatus } from "@/types/todo";
import TodoItem from "./TodoItem";

const COLUMNS: {
  status: TodoStatus;
  title: string;
  color: string;
}[] = [
  { status: "pending", title: "대기 중", color: "bg-amber-500" },
  { status: "in_progress", title: "진행 중", color: "bg-blue-500" },
  { status: "completed", title: "완료", color: "bg-emerald-500" },
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
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-stone-800 mb-2">
          Todo Board
        </h1>
        <p className="text-stone-500">
          작업을 관리하고 진행 상황을 추적하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => (
          <div
            key={column.status}
            className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-stone-200">
              <div className={`w-4 h-4 rounded-full ${column.color}`} />
              <h2 className="text-lg font-bold text-stone-700">
                {column.title}
              </h2>
              <span className="ml-auto px-3 py-1 bg-stone-100 rounded-full text-sm font-semibold text-stone-600">
                {getTodosByStatus(column.status).length}
              </span>
            </div>

            <div className="space-y-3 min-h-[250px]">
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
              <div className="mt-4 p-4 bg-white rounded-xl border-2 border-dashed border-stone-300 shadow-sm">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTodo(column.status);
                    if (e.key === "Escape") cancelAdd();
                  }}
                  placeholder="새 작업을 입력하세요..."
                  autoFocus
                  className="w-full px-3 py-2 bg-stone-50 rounded-lg outline-none text-stone-800 placeholder-stone-400 border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => addTodo(column.status)}
                    disabled={!newTodoText.trim()}
                    className="flex-1 px-4 py-2 bg-stone-800 text-white rounded-lg font-semibold hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    추가하기
                  </button>
                  <button
                    onClick={cancelAdd}
                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingStatus(column.status)}
                className="mt-4 w-full py-3 text-stone-400 hover:text-stone-600 bg-stone-50 hover:bg-stone-100 border-2 border-dashed border-stone-200 hover:border-stone-300 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
              >
                <svg
                  className="w-5 h-5"
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
                새 작업 추가
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
