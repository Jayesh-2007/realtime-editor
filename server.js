// const express = require("express");
// const app = express();
// const http = require("http");
// const { Server } = require("socket.io");
// const PORT = process.env.PORT || 5000;
// const ACTIONS = require("./src/Actions");

// const server = http.createServer(app);
// const io = new Server(server);
// const userSocketMap = {};
// const roomCode = {};

// function getAllConnectedClients(roomId) {
//   return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
//     (socketId) => {
//       return {
//         socketId,
//         username: userSocketMap[socketId],
//       };
//     }
//   );
// }

// io.on("connection", (socket) => {
//   console.log("socket connected", socket.id);

//   socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
//     const clients = getAllConnectedClients(roomId);
//     const isAlreadyInRoom = clients.some((c) => c.username === username);

//     if (!isAlreadyInRoom) {
//       userSocketMap[socket.id] = username;
//       socket.join(roomId);
//     }
//     const updatedClients = getAllConnectedClients(roomId);
//     clients.forEach(({ socketId }) => {
//       io.to(socketId).emit(ACTIONS.JOINED, {
//         clients: updatedClients,
//         username,
//         socketId: socket.id,
//       });
//     });
//     // Send current code if available
//     if (roomCode[roomId]) {
//       io.to(socket.id).emit(ACTIONS.CODE_CHANGE, { code: roomCode[roomId] });
//     }
//   });

//   socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
//     console.log(`[SERVER] received code:`, code);
//     console.log("[SERVER] broadcasting to room", roomId, "event:", ACTIONS.CODE_CHANGE);
//     console.log(`[CODE_CHANGE] from ${socket.id} in room ${roomId}`);
//     roomCode[roomId] = code;
//     socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
//   });

//   socket.on("disconnecting", () => {
//     const rooms = [...socket.rooms];
//     rooms.forEach((roomId) => {
//       socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
//         socketId: socket.id,
//         username: userSocketMap[socket.id],
//       });
//     });
//     delete userSocketMap[socket.id];
//     socket.leave();
//   });
// });

// server.listen(PORT, () => {
//   console.log("listing on 5000");
// });

/*****************************************- bug fixed code ***************************************************************** */

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 5000;
const ACTIONS = require("./src/Actions");
const path = require("path");

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next)=>{
  res.sendFile(path.join(__dirname,"build", "index.html"));
})

const userSocketMap = {};
const roomCode = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    const clients = getAllConnectedClients(roomId);
    const isAlreadyInRoom = clients.some((c) => c.username === username);

    if (!isAlreadyInRoom) {
      userSocketMap[socket.id] = username;
      socket.join(roomId);
    }

    const updatedClients = getAllConnectedClients(roomId);

    // ❌ Wrong: iterating old clients list, not sending to all
    // clients.forEach(({ socketId }) => {
    //   io.to(socketId).emit(ACTIONS.JOINED, {
    //     clients: updatedClients,
    //     username,
    //     socketId: socket.id,
    //   });
    // });

    // ✅ Fixed: broadcast to ALL in the room including the new client
    io.in(roomId).emit(ACTIONS.JOINED, {
      clients: updatedClients,
      username,
      socketId: socket.id,
    });

    // Send current code if available
    if (roomCode[roomId]) {
      io.to(socket.id).emit(ACTIONS.CODE_CHANGE, { code: roomCode[roomId] });
    }
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    console.log(`[SERVER] received code:`, code);
    console.log(
      "[SERVER] broadcasting to room",
      roomId,
      "event:",
      ACTIONS.CODE_CHANGE
    );
    console.log(`[CODE_CHANGE] from ${socket.id} in room ${roomId}`);
    roomCode[roomId] = code;
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, {code});
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];

    // ❌ Wrong: unnecessary, socket leaves rooms automatically
    // socket.leave();

    // ✅ Fixed: no manual leave needed, cleanup handled by socket.io
  });
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
