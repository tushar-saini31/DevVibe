const { UserAuth } = require("../middleware/auth");
const express = require("express");
const { Chat } = require("../Models/chat");
const { User } = require("../Models/user");


const chatRouter = express.Router();

// Create or retrieve a chat between two users
chatRouter.get("/chat/:targetUserId", UserAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    // Correct: await the Chat.findOne result
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate("messages.senderId", "firstName lastName");

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = chatRouter;
