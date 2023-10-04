import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import express from "express";
import chokidar from "chokidar";
import path from "path";
import { Server } from "socket.io";
import http from "http";

// notice that the result of `remix build` is "just a module"
import * as build from "./build/index.js";
import { createIPX, createIPXMiddleware } from "ipx";

const pathSeperator = path.sep;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  socket.on('joinRoom', (room) => {
    socket.join(room);
    const socketIoRoom = io.sockets.adapter.rooms.get(room);
    if (socketIoRoom) {
      io.to(room).emit('watchers', socketIoRoom.size);
    }
  });

  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    const socketIoRoom = io.sockets.adapter.rooms.get(room);
    if (socketIoRoom) {
      io.to(room).emit('watchers', socketIoRoom.size);
    }
  });

  socket.on('disconnecting', () => {
    socket.rooms.forEach(room => {
      const socketIoRoom = io.sockets.adapter.rooms.get(room);
      if (socketIoRoom) {
        io.to(room).emit('watchers', socketIoRoom.size - 1);
      }
    });
  });
});

chokidar.watch("public/images").on("all", (event, path) => {
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
    const folders = path.split(pathSeperator);
    if (folders.length != 4) return;
    const folder = folders[folders.length - 2];
    const fileName = folders[folders.length - 1];
    io.to(folder).emit('imageChange', fileName);
  }
});

const ipx = createIPX({
  dir: "public/images",
});

app.use("/_ipx",  createIPXMiddleware(ipx));
app.use(express.static("public"));

// and your app is "just a request handler"
app.all("*", createRequestHandler({ build }));

server.listen(3000, () => {
  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(build);
  }
  console.log("App listening on http://localhost:3000");
});