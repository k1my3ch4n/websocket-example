"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// 메시지 타입 정의
interface ChatMessage {
  type: "system" | "message";
  username: string;
  text: string;
  timestamp: string;
}

// Next.js의 URL은 개발 환경에서 동일한 포트 3000을 사용합니다.
const WS_PATH = "ws://localhost:3000/api/socket";

// 사용자 ID를 생성하거나 로컬 스토리지에서 가져옵니다.
const getOrCreateUserId = (): string => {
  let id = localStorage.getItem("chatUserId");
  if (!id) {
    id = "User_" + Math.floor(Math.random() * 1000).toString();
    localStorage.setItem("chatUserId", id);
  }
  return id;
};

export default function ChatPage() {
  const userId = useRef(getOrCreateUserId());
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 목록 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 추가 함수
  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // WebSocket 연결 설정 및 관리
  useEffect(() => {
    if (typeof window === "undefined") return;

    const connection = new WebSocket(WS_PATH);

    connection.onopen = () => {
      console.log("WebSocket Connected");
      setWs(connection);
      addMessage({
        type: "system",
        username: "System",
        text: "서버 연결 성공. 채팅을 시작하세요!",
        timestamp: new Date().toLocaleTimeString(),
      });
    };

    connection.onmessage = (event) => {
      try {
        const data: ChatMessage = JSON.parse(event.data);
        addMessage(data);
      } catch (error) {
        console.error("메시지 파싱 오류:", event.data);
      }
    };

    connection.onclose = () => {
      console.log("WebSocket Disconnected");
      setWs(null);
      addMessage({
        type: "system",
        username: "System",
        text: "서버 연결이 끊어졌습니다. (재시도 필요)",
        timestamp: new Date().toLocaleTimeString(),
      });
    };

    connection.onerror = (error) => {
      console.error("WebSocket 오류:", error);
      connection.close();
    };

    return () => {
      // 컴포넌트 언마운트 시 연결 해제
      connection.close();
    };
  }, [addMessage]);

  // 메시지 전송 핸들러
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    if (ws && ws.readyState === WebSocket.OPEN && trimmedInput) {
      const messageData = {
        username: userId.current,
        text: trimmedInput,
      };

      // 서버로 메시지 전송
      ws.send(JSON.stringify(messageData));
      setInput("");
    }
  };

  // Tailwind CSS v4 스타일 적용 (다크 모드 지원 포함)
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
          NextChat v2.0 (App Router + WS)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          현재 사용자:{" "}
          <span className="font-mono bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 rounded-md text-sm">
            {userId.current}
          </span>
        </p>
      </header>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isMyMessage = msg.username === userId.current;
          const isSystem = msg.type === "system";

          if (isSystem) {
            return (
              <p
                key={index}
                className="text-center text-sm text-gray-500 dark:text-gray-400 italic"
              >
                --- {msg.text} ({msg.timestamp}) ---
              </p>
            );
          }

          return (
            <div
              key={index}
              className={`flex ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs sm:max-w-md p-3 rounded-xl shadow-lg transition-all duration-300 ${
                  isMyMessage
                    ? "bg-indigo-500 text-white rounded-tr-none"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-600"
                }`}
              >
                <p
                  className={`font-semibold text-xs mb-1 ${
                    isMyMessage
                      ? "text-indigo-200"
                      : "text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  {msg.username}
                </p>
                <p className="break-words text-base">{msg.text}</p>
                <span
                  className={`text-xs mt-1 block ${
                    isMyMessage
                      ? "text-indigo-300"
                      : "text-gray-400 dark:text-gray-500"
                  } float-right`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 폼 */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-inner"
      >
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={ws ? "메시지를 입력하세요..." : "연결 중..."}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            disabled={!ws}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:shadow-none"
            disabled={!ws || !input.trim()}
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}
