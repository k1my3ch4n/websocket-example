'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [roomId, setRoomId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');

  // 랜덤한 방 ID 생성
  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-lg w-full">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            가위바위보 게임
          </h1>
          <p className="text-gray-600">
            친구와 함께 실시간으로 가위바위보를 즐겨보세요!
          </p>
        </div>

        {/* 게임 시작 섹션 */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              게임 시작하기
            </h2>
          </div>

          {/* 플레이어 이름 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              플레이어 이름
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 방 ID 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              방 ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="방 ID 입력"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={generateRoomId}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                랜덤 생성
              </button>
            </div>
          </div>

          {/* 게임 시작 버튼 */}
          <div className="pt-4">
            <Link
              href={`/game?roomId=${roomId}`}
              className={`block w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold text-lg text-center ${
                !roomId.trim() || !playerName.trim()
                  ? 'opacity-50 cursor-not-allowed pointer-events-none'
                  : 'shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              🚀 게임 시작하기
            </Link>
          </div>
        </div>

        {/* 게임 설명 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            게임 방법
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">1</div>
              <span>플레이어 이름과 방 ID를 입력하세요</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">2</div>
              <span>같은 방 ID로 친구가 입장하도록 안내하세요</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">3</div>
              <span>가위바위보를 선택하고 결과를 확인하세요</span>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>실시간 WebSocket 연결로 즐기는 멀티플레이어 게임</p>
        </div>
      </div>
    </div>
  );
}