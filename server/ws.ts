export function sendJson<T>(
  ws: WebSocket | Bun.ServerWebSocket | undefined,
  data: T,
) {
  ws?.send(JSON.stringify(data));
}
