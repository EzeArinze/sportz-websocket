import WebSocket, { WebSocketServer } from "ws";

function sendJson(socket, payload) {
  const stringifiedPayload = JSON.stringify(payload);
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(stringifiedPayload);
}

function broadcast(wss, payload) {
  const stringifiedPayload = JSON.stringify(payload);

  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) return;

    client.send(stringifiedPayload);
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (socket) => {
    sendJson(socket, {
      type: "welcome",
      message: "Welcome to the Sportz WebSocket server!",
    });

    socket.on("error", console.error);
  });

  function broadcastMatchCreated(match) {
    broadcast(wss, {
      type: "match_created",
      data: match,
    });
  }

  return { broadcastMatchCreated };
}
