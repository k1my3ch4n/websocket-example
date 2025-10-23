'use client';

import { useState, useEffect, useRef } from 'react';

type GameChoice = 'rock' | 'paper' | 'scissors' | null;
type GameResult = 'win' | 'lose' | 'draw' | null;

interface Player {
  id: string;
  name: string;
  choice: GameChoice;
  isReady: boolean;
  hasChosen: boolean;
}

interface RoomData {
  roomId: string;
  players: Player[];
  gameState: 'waiting' | 'playing' | 'finished';
  currentRound: number;
}

export default function Home() {
  const [roomId, setRoomId] = useState<string>('');
  const [playerId] = useState<string>(() => Math.random().toString(36).substring(2, 15));
  const [playerName, setPlayerName] = useState<string>('');
  const [playerChoice, setPlayerChoice] = useState<GameChoice>(null);
  const [opponentChoice, setOpponentChoice] = useState<GameChoice>(null);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentHasChosen, setOpponentHasChosen] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket 연결
  useEffect(() => {
    if (isInRoom && !wsRef.current) {
      const ws = new WebSocket('ws://localhost:8080');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket 연결됨');
        setIsConnected(true);
        
        // 방 입장 메시지 전송
        ws.send(JSON.stringify({
          type: 'join-room',
          data: {
            roomId,
            playerId,
            playerName: playerName || `플레이어${playerId.substring(0, 4)}`
          }
        }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };

      ws.onclose = () => {
        console.log('WebSocket 연결 종료');
        setIsConnected(false);
        wsRef.current = null;
      };

      ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        setIsConnected(false);
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isInRoom, roomId, playerId]);

  const handleWebSocketMessage = (message: any) => {
    const { type, data } = message;

    switch (type) {
      case 'room-updated':
        setRoomData(data);
        if (data.players.length === 2) {
          setWaitingForOpponent(false);
          // 상대방 선택 상태 업데이트
          const opponent = data.players.find((p: Player) => p.id !== playerId);
          if (opponent) {
            setOpponentHasChosen(opponent.hasChosen);
          }
        } else {
          setWaitingForOpponent(true);
          setOpponentHasChosen(false);
        }
        break;
      
      case 'player-chose':
        // 상대방이 선택했지만 아직 결과는 모름
        if (data.playerId !== playerId) {
          setOpponentHasChosen(true);
        }
        break;
      
      case 'game-result':
        const myResult = data.results[playerId];
        const opponentPlayer = data.choices.find((c: any) => c.playerId !== playerId);
        
        setOpponentChoice(opponentPlayer.choice);
        setGameResult(myResult);
        break;
      
      case 'game-reset':
        setPlayerChoice(null);
        setOpponentChoice(null);
        setGameResult(null);
        setOpponentHasChosen(false);
        break;
      
      case 'player-disconnected':
        setWaitingForOpponent(true);
        break;
      
      case 'error':
        alert(data.message);
        break;
    }
  };

  // 랜덤한 방 ID 생성
  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
  };

  // 방 입장
  const joinRoom = () => {
    if (roomId.trim() && playerName.trim()) {
      setIsInRoom(true);
      setWaitingForOpponent(true);
    }
  };

  // 가위바위보 선택
  const makeChoice = (choice: GameChoice) => {
    if (!wsRef.current || !isConnected) return;
    
    setPlayerChoice(choice);
    
    wsRef.current.send(JSON.stringify({
      type: 'make-choice',
      data: {
        roomId,
        playerId,
        choice
      }
    }));
  };

  // 게임 리셋
  const resetGame = () => {
    if (!wsRef.current || !isConnected) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'reset-game',
      data: {
        roomId
      }
    }));
  };

  // 방 나가기
  const leaveRoom = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsInRoom(false);
    setRoomId('');
    setPlayerChoice(null);
    setOpponentChoice(null);
    setGameResult(null);
    setRoomData(null);
    setWaitingForOpponent(false);
    setIsConnected(false);
    setOpponentHasChosen(false);
    setPlayerName('');
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
                플레이어 이름
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              disabled={!roomId.trim() || !playerName.trim()}
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
              <p className="text-sm text-gray-500">나: {playerName || `플레이어${playerId.substring(0, 4)}`}</p>
              {roomData && roomData.players.length === 2 && (
                <p className="text-sm text-gray-500">
                  상대방: {roomData.players.find(p => p.id !== playerId)?.name || '알 수 없음'}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600">
                  {isConnected ? '연결됨' : '연결 끊김'}
                </span>
              </div>
              <button
                onClick={leaveRoom}
                className="mt-2 text-sm text-red-500 hover:text-red-700"
              >
                방 나가기
              </button>
            </div>

            {waitingForOpponent ? (
              <div className="text-center">
                <div className="animate-pulse text-lg text-gray-600">
                  상대방을 기다리는 중...
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    현재 플레이어: {roomData?.players.length || 1}/2
                  </p>
                </div>
              </div>
            ) : !playerChoice ? (
              // 선택 화면
              <div>
                <h2 className="text-xl font-semibold text-center mb-4">가위바위보를 선택하세요!</h2>
                {opponentHasChosen && (
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      상대방이 선택했습니다!
                    </div>
                  </div>
                )}
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
                    <p className="text-sm text-gray-600 mb-2">{playerName || `플레이어${playerId.substring(0, 4)}`}</p>
                    <div className="text-4xl">
                      {playerChoice === 'rock' && '✊'}
                      {playerChoice === 'paper' && '✋'}
                      {playerChoice === 'scissors' && '✌️'}
                    </div>
                  </div>
                  <div className="text-2xl">VS</div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      {roomData?.players.find(p => p.id !== playerId)?.name || '상대방'}
                    </p>
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
