const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const { Socket } = require("socket.io-client");
const PORT = process.env.PORT || 5000;
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server);
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    socket
  });
});

server.listen(PORT, () => {
  console.log("listing on 5000");
});
