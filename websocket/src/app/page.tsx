'use client';

import { useState } from 'react';

type GameChoice = 'rock' | 'paper' | 'scissors' | null;
type GameResult = 'win' | 'lose' | 'draw' | null;

export default function Home() {
  const [roomId, setRoomId] = useState<string>('');
  const [playerChoice, setPlayerChoice] = useState<GameChoice>(null);
  const [opponentChoice, setOpponentChoice] = useState<GameChoice>(null);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [isInRoom, setIsInRoom] = useState(false);

  // 랜덤한 방 ID 생성
  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
  };

  // 방 입장
  const joinRoom = () => {
    if (roomId.trim()) {
      setIsInRoom(true);
    }
  };

  // 가위바위보 선택
  const makeChoice = (choice: GameChoice) => {
    setPlayerChoice(choice);
    // TODO: WebSocket으로 상대방에게 선택 전송
    // 임시로 랜덤한 상대방 선택 시뮬레이션
    setTimeout(() => {
      const choices: GameChoice[] = ['rock', 'paper', 'scissors'];
      const randomOpponentChoice = choices[Math.floor(Math.random() * choices.length)];
      setOpponentChoice(randomOpponentChoice);
      calculateResult(choice, randomOpponentChoice);
    }, 1000);
  };

  // 게임 결과 계산
  const calculateResult = (player: GameChoice, opponent: GameChoice) => {
    if (player === opponent) {
      setGameResult('draw');
    } else if (
      (player === 'rock' && opponent === 'scissors') ||
      (player === 'paper' && opponent === 'rock') ||
      (player === 'scissors' && opponent === 'paper')
    ) {
      setGameResult('win');
    } else {
      setGameResult('lose');
    }
  };

  // 게임 리셋
  const resetGame = () => {
    setPlayerChoice(null);
    setOpponentChoice(null);
    setGameResult(null);
  };

  // 방 나가기
  const leaveRoom = () => {
    setIsInRoom(false);
    setRoomId('');
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          가위바위보 게임
        </h1>

        {!isInRoom ? (
          // 방 생성/입장 화면
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                방 ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="방 ID 입력"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={generateRoomId}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  랜덤 생성
                </button>
              </div>
            </div>
            <button
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              방 입장
            </button>
          </div>
        ) : (
          // 게임 화면
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">방 ID: {roomId}</p>
              <button
                onClick={leaveRoom}
                className="mt-2 text-sm text-red-500 hover:text-red-700"
              >
                방 나가기
              </button>
            </div>

            {!playerChoice ? (
              // 선택 화면
              <div>
                <h2 className="text-xl font-semibold text-center mb-4">가위바위보를 선택하세요!</h2>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => makeChoice('rock')}
                    className="p-4 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    ✊
                  </button>
                  <button
                    onClick={() => makeChoice('paper')}
                    className="p-4 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    ✋
                  </button>
                  <button
                    onClick={() => makeChoice('scissors')}
                    className="p-4 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    ✌️
                  </button>
                </div>
              </div>
            ) : (
              // 결과 화면
              <div className="text-center space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">나</p>
                    <div className="text-4xl">
                      {playerChoice === 'rock' && '✊'}
                      {playerChoice === 'paper' && '✋'}
                      {playerChoice === 'scissors' && '✌️'}
                    </div>
                  </div>
                  <div className="text-2xl">VS</div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">상대방</p>
                    <div className="text-4xl">
                      {opponentChoice ? (
                        <>
                          {opponentChoice === 'rock' && '✊'}
                          {opponentChoice === 'paper' && '✋'}
                          {opponentChoice === 'scissors' && '✌️'}
                        </>
                      ) : (
                        <div className="animate-pulse">...</div>
                      )}
                    </div>
                  </div>
                </div>

                {gameResult && (
                  <div className="mt-6">
                    <div className={`text-2xl font-bold ${
                      gameResult === 'win' ? 'text-green-500' :
                      gameResult === 'lose' ? 'text-red-500' :
                      'text-gray-500'
                    }`}>
                      {gameResult === 'win' && '승리!'}
                      {gameResult === 'lose' && '패배!'}
                      {gameResult === 'draw' && '무승부!'}
                    </div>
                    <button
                      onClick={resetGame}
                      className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      다시 하기
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
