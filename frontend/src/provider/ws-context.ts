import { createContext } from "react";
import type { Socket } from "socket.io-client";

export const wsContext = createContext<
  Socket<any, any> | undefined
>(undefined);
