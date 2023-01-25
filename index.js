const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const userUtils = require("./utils/users");
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is up and runnning on port : ${PORT}`);
});

// Listen to the connection
io.on("connection", (socket) => {
  // Join the user to a specific room
  socket.on("join-room", (data) => {
    socket.join(data.roomName);
    const user = userUtils.joinUser({
      username: data.username,
      room: data.roomName,
      sessionId: socket.id,
    });
    socket.emit("join-done", {
      id: socket.id,
      username: data.username,
      room: data.roomName,
    });

    socket.broadcast.to(data.roomName).emit("user-join", data.username);
    io.to(data.roomName).emit(
      "room-mates",
      userUtils.getRoomMates(data.roomName)
    );
    // Listen to chat message event
    socket.on("chat-message", (message) => {
      //then send back to all users in the same room
      io.to(data.roomName).emit("receive-message", message);
    });

    socket.on("typing", () => {
      userUtils.setTyping(socket.id);
      socket.broadcast
        .to(data.roomName)
        .emit("user-typing", userUtils.getTypingUsers(data.roomName));
    });
    socket.on("stopped-typing", () => {
      userUtils.stoppedTyping(socket.id);
      socket.broadcast
        .to(data.roomName)
        .emit("user-typing", userUtils.getTypingUsers(data.roomName));
    });
    socket.on("disconnect", () => {
      userUtils.leaveUser(socket.id);
      io.to(data.roomName).emit(
        "room-mates",
        userUtils.getRoomMates(data.roomName)
      );
      socket.broadcast.to(data.roomName).emit("user-left", data.username);
    });
  });
});
