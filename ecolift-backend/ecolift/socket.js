import { Server } from "socket.io";

let io;
const connectedUsers = new Map();

function initSocketIO(server) {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("register", ({ userId }) => {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

function getConnectedUsers() {
  return connectedUsers;
}

export { initSocketIO, getIO, getConnectedUsers };
