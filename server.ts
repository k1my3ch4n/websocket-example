import { createServer, Server as HttpServer } from "http";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { parse } from "url";

// Next.js 앱 설정
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// 모든 연결된 클라이언트를 저장하는 Map (WS 서버의 역할을 수행)
interface ChatClient {
  id: string;
  ws: WebSocket;
}
const clients = new Map<string, ChatClient>();

// 메시지 브로드캐스트 함수
function broadcast(message: string) {
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

// 서버 초기화 및 실행
app.prepare().then(() => {
  // 1. HTTP 서버 생성
  const server: HttpServer = createServer((req, res) => {
    // Next.js 라우팅 시스템에 요청 처리 위임
    try {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // 2. WebSocket 서버 생성 (HTTP 서버 재사용)
  // Next.js API Route 경로를 흉내내어 '/api/chat' 경로를 사용합니다.
  server.on("upgrade", (request, socket, head) => {
    const { pathname } = parse(request.url || "", true);

    // 요청 경로가 '/api/chat'인 경우에만 WebSocket 연결 처리
    if (pathname === "/api/socket") {
      const wss = new WebSocketServer({ noServer: true });

      wss.handleUpgrade(request, socket, head, (ws) => {
        const clientId = Math.random().toString(36).substring(2, 9);
        clients.set(clientId, { id: clientId, ws });

        console.log(
          `[WS] Client connected: ${clientId}. Total: ${clients.size}`
        );

        // 시스템 메시지 전송
        ws.send(
          JSON.stringify({
            type: "system",
            text: "채팅 서버에 연결되었습니다.",
            timestamp: new Date().toLocaleTimeString(),
          })
        );

        // 메시지 수신
        ws.on("message", (message: string) => {
          const data = JSON.parse(message);
          const fullMessage = JSON.stringify({
            type: "message",
            username: data.username || `User-${clientId}`,
            text: data.text,
            timestamp: new Date().toLocaleTimeString(),
          });

          // 메시지 브로드캐스트
          broadcast(fullMessage);
        });

        // 연결 해제
        ws.on("close", () => {
          clients.delete(clientId);
          console.log(
            `[WS] Client disconnected: ${clientId}. Total: ${clients.size}`
          );
          broadcast(
            JSON.stringify({
              type: "system",
              text: `User-${clientId} 님이 퇴장했습니다.`,
              timestamp: new Date().toLocaleTimeString(),
            })
          );
        });

        ws.on("error", (err) =>
          console.error(`[WS] Client error: ${clientId}`, err)
        );
      });
    } else {
      // '/api/chat'이 아닌 경우, 연결 종료 (WebSocket이 아님)
      socket.destroy();
    }
  });

  // 서버 리스닝
  server.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
