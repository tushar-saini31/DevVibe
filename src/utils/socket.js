const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../Models/chat");
const connectionRequest=require("../Models/connectRequest")

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    // handle joinChat event
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joining room: " + roomId);
      socket.join(roomId);
    });

    // handle sendMessage event
    socket.on("sendMessage", async ({ firstName, userId, targetUserId, text }) => {
      try {

      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " " + text);
      // check if userId and targetId is friends

   
    
        // save message to the database
        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] }
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: userId,
          text,
        });

        await chat.save();

        // send message to the room
        io.to(roomId).emit("messageReceived", { firstName, text });

      } catch (err) {
        console.error("Error saving chat message:", err);
      }
    });

    // handle disconnect event
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

module.exports = initializeSocket;
