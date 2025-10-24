import { WebSocketServer, WebSocket } from 'ws';

// 방과 플레이어 정보를 저장하는 타입
interface Player {
  id: string;
  name: string;
  ws: WebSocket;
  choice: 'rock' | 'paper' | 'scissors' | null;
  isReady: boolean;
  hasChosen: boolean;
  isHost: boolean;
}

interface Room {
  id: string;
  players: Player[];
  gameState: 'waiting' | 'playing' | 'finished';
  currentRound: number;
}

interface WebSocketMessage {
  type: 'join-room' | 'make-choice' | 'reset-game' | 'start-game';
  data: any;
}

interface JoinRoomData {
  roomId: string;
  playerId: string;
  playerName: string;
}

interface MakeChoiceData {
  roomId: string;
  playerId: string;
  choice: 'rock' | 'paper' | 'scissors';
}

interface ResetGameData {
  roomId: string;
}

interface StartGameData {
  roomId: string;
}

interface GameResult {
  [playerId: string]: 'win' | 'lose' | 'draw';
}

interface PlayerChoice {
  playerId: string;
  playerName: string;
  choice: 'rock' | 'paper' | 'scissors';
}

// 전역 변수로 방 정보 저장
const rooms = new Map<string, Room>();

// WebSocket 서버 시작
const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket 서버가 포트 8080에서 시작되었습니다.');

wss.on('connection', (ws: WebSocket, req) => {
  console.log('새로운 클라이언트 연결');
  
  ws.on('message', (data: Buffer) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      handleMessage(ws, message);
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
    }
  });

  ws.on('close', () => {
    console.log('클라이언트 연결 종료');
    handleDisconnect(ws);
  });
});

function handleMessage(ws: WebSocket, message: WebSocketMessage): void {
  const { type, data } = message;

  switch (type) {
    case 'join-room':
      handleJoinRoom(ws, data as JoinRoomData);
      break;
    case 'make-choice':
      handleMakeChoice(ws, data as MakeChoiceData);
      break;
    case 'reset-game':
      handleResetGame(ws, data as ResetGameData);
      break;
    case 'start-game':
      handleStartGame(ws, data as StartGameData);
      break;
    default:
      console.log('알 수 없는 메시지 타입:', type);
  }
}

function handleJoinRoom(ws: WebSocket, data: JoinRoomData): void {
  const { roomId, playerId, playerName } = data;
  
  if (!rooms.has(roomId)) {
    // 새 방 생성
    rooms.set(roomId, {
      id: roomId,
      players: [],
      gameState: 'waiting',
      currentRound: 1
    });
    console.log(`새 방 생성: ${roomId}`);
  }

  const room = rooms.get(roomId)!;
  
  // 이미 방에 있는 플레이어인지 확인
  const existingPlayer = room.players.find(p => p.id === playerId);
  
  if (existingPlayer) {
    // 기존 플레이어 재연결
    existingPlayer.ws = ws;
    existingPlayer.isReady = true;
    existingPlayer.name = playerName; // 이름 업데이트
    console.log(`플레이어 재연결: ${playerName} (${playerId}) in ${roomId}`);
  } else {
    // 새 플레이어 추가
    if (room.players.length >= 2) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: '방이 가득 찼습니다.' }
      }));
      return;
    }

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      ws: ws,
      choice: null,
      isReady: true,
      hasChosen: false,
      isHost: room.players.length === 0 // 첫 번째 플레이어가 방장
    };
    
    room.players.push(newPlayer);
    console.log(`새 플레이어 입장: ${playerName} (${playerId}) in ${roomId}`);
  }

  // 방 상태 업데이트 (게임은 방장이 시작해야 함)
  console.log(`플레이어 입장 완료: ${roomId}, 현재 플레이어 수: ${room.players.length}`);

  // 모든 플레이어에게 방 상태 전송
  broadcastToRoom(roomId, {
    type: 'room-updated',
    data: {
      roomId,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        choice: p.choice,
        isReady: p.isReady,
        hasChosen: p.hasChosen,
        isHost: p.isHost
      })),
      gameState: room.gameState,
      currentRound: room.currentRound
    }
  });
}

function handleMakeChoice(ws: WebSocket, data: MakeChoiceData): void {
  const { roomId, playerId, choice } = data;
  
  const room = rooms.get(roomId);
  if (!room) return;

  const player = room.players.find(p => p.id === playerId);
  if (!player) return;

  player.choice = choice;
  player.hasChosen = true;
  console.log(`플레이어 선택: ${player.name} (${playerId}) chose ${choice} in ${roomId}`);

  // 모든 플레이어가 선택했는지 확인
  const allPlayersChose = room.players.every(p => p.choice !== null);
  
  if (allPlayersChose) {
    // 게임 결과 계산
    const results = calculateGameResult(room.players);
    console.log(`게임 결과: ${roomId}`, results);
    
    // 모든 플레이어에게 결과 전송
    broadcastToRoom(roomId, {
      type: 'game-result',
      data: {
        results,
        choices: room.players.map(p => ({
          playerId: p.id,
          playerName: p.name,
          choice: p.choice
        })) as PlayerChoice[]
      }
    });

    room.gameState = 'finished';
  } else {
    // 아직 모든 플레이어가 선택하지 않음
    broadcastToRoom(roomId, {
      type: 'player-chose',
      data: {
        playerId,
        playerName: player.name,
        choice: null // 선택을 숨김
      }
    });
  }
}

function handleStartGame(ws: WebSocket, data: StartGameData): void {
  const { roomId } = data;
  
  console.log(`게임 시작 요청: ${roomId}`);
  
  const room = rooms.get(roomId);
  if (!room) {
    console.log(`방을 찾을 수 없음: ${roomId}`);
    return;
  }

  // 방장인지 확인
  const player = room.players.find(p => p.ws === ws);
  if (!player || !player.isHost) {
    console.log(`방장 권한 없음: ${player?.name || 'unknown'}`);
    ws.send(JSON.stringify({
      type: 'error',
      data: { message: '방장만 게임을 시작할 수 있습니다.' }
    }));
    return;
  }

  // 플레이어가 2명인지 확인
  if (room.players.length !== 2) {
    console.log(`플레이어 수 부족: ${room.players.length}/2`);
    ws.send(JSON.stringify({
      type: 'error',
      data: { message: '플레이어가 2명이어야 게임을 시작할 수 있습니다.' }
    }));
    return;
  }

  room.gameState = 'playing';
  console.log(`게임 시작 성공: ${roomId} by ${player.name}`);

  // 모든 플레이어에게 게임 시작 알림
  broadcastToRoom(roomId, {
    type: 'game-started',
    data: {
      roomId,
      startedBy: player.name
    }
  });
}

function handleResetGame(ws: WebSocket, data: ResetGameData): void {
  const { roomId } = data;
  
  const room = rooms.get(roomId);
  if (!room) return;

  // 모든 플레이어의 선택 초기화
  room.players.forEach(player => {
    player.choice = null;
    player.hasChosen = false;
  });

  room.gameState = 'waiting'; // 게임 리셋 시 대기 상태로
  room.currentRound += 1;

  console.log(`게임 리셋: ${roomId}, 라운드 ${room.currentRound}`);

  // 모든 플레이어에게 게임 리셋 알림
  broadcastToRoom(roomId, {
    type: 'game-reset',
    data: {
      roomId,
      currentRound: room.currentRound
    }
  });
}

function handleDisconnect(ws: WebSocket): void {
  // 연결이 끊어진 플레이어 찾기
  for (const [roomId, room] of rooms.entries()) {
    const player = room.players.find(p => p.ws === ws);
    if (player) {
      player.isReady = false;
      console.log(`플레이어 연결 끊김: ${player.id} in ${roomId}`);
      
      // 다른 플레이어에게 연결 끊김 알림
      broadcastToRoom(roomId, {
        type: 'player-disconnected',
        data: {
          playerId: player.id
        }
      });
      
      // 방에 플레이어가 없으면 방 삭제
      if (room.players.every(p => !p.isReady)) {
        rooms.delete(roomId);
        console.log(`방 삭제: ${roomId}`);
      }
      break;
    }
  }
}

function calculateGameResult(players: Player[]): GameResult {
  const [player1, player2] = players;
  const choice1 = player1.choice!;
  const choice2 = player2.choice!;

  if (choice1 === choice2) {
    return {
      [player1.id]: 'draw',
      [player2.id]: 'draw'
    };
  }

  const winConditions: { [key: string]: string } = {
    'rock': 'scissors',
    'paper': 'rock',
    'scissors': 'paper'
  };

  const result: GameResult = {};
  
  if (winConditions[choice1] === choice2) {
    result[player1.id] = 'win';
    result[player2.id] = 'lose';
  } else {
    result[player1.id] = 'lose';
    result[player2.id] = 'win';
  }

  return result;
}

function broadcastToRoom(roomId: string, message: any): void {
  const room = rooms.get(roomId);
  if (!room) return;

  room.players.forEach(player => {
    if (player.ws && player.isReady) {
      try {
        player.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('메시지 전송 오류:', error);
      }
    }
  });
}
