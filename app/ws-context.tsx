import { createContext } from "react";
import type { Socket } from "socket.io-client";

export let wsContext = createContext<
  Socket<any, any> | undefined
>(undefined);
