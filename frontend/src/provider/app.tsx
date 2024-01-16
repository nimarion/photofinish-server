import { connect } from "@/lib/socketio";
import { ReactNode, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { wsContext } from "./ws-context";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket<any, any>>();

  useEffect(() => {
    const connection = connect();
    setSocket(connection);
    return () => {
      connection.close();
    };
  }, []);
  return <wsContext.Provider value={socket}>{children}</wsContext.Provider>;
};
