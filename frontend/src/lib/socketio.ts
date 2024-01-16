import io from "socket.io-client";

import { PHOTOFINISH_WEBSOCKET_URL } from "@/config";

export function connect() {
  return io(PHOTOFINISH_WEBSOCKET_URL);
}
