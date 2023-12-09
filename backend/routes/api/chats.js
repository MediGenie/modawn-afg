const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ChatBot = mongoose.model("ChatBot");
const Chat = mongoose.model("Chat");
const { getAiResponse } = require("../../openAi");
const { requireUser } = require("../../config/passport");
const socket = require("../../config/socket");
const multer = require("multer");
const fs = require("fs");
const upload = multer();



import("p-queue").then((PQueueModule) => {
  const io = socket.getIO();

  const queue = new PQueueModule.default({ concurrency: 1 });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("start-chat-processing", async (data) => {
      try {
        let { chatId, formData, user } = data;

        const bodyData = JSON.parse(formData);

        const chat = await Chat.findOne({
          _id: chatId,
          author: { _id: user._id },
        }).populate("chatBot", "_id name");
        const chatBot = await ChatBot.findOne({ _id: chat.chatBot._id });

        const text = bodyData.text;

        // Pass the socket.id (clientSocketId) to getAiResponse
        const textResponse = await getAiResponse(
          chatBot,
          chat,
          bodyData.text,
          socket.id  // Pass the client's socket ID here
        );

        const formattedMessage = { role: "user", content: text };

        chat.messages = [
          ...chat.messages,
          formattedMessage,
          textResponse
        ];

        const updatedChat = await chat.save();
        socket.emit("chat-updated", updatedChat);
      } catch (error) {
        console.error(error , "errrrrrrrror");
      }
    });
  });
});



// router.patch('/:id', requireUser, async (req, res) => {

//   let chat, chatBot;

//   try {

//     chat = await Chat.findOne({ _id: req.params.id, author: { _id: req.user._id } })
//                      .populate('chatBot', '_id name'); 

//     chatBot = await ChatBot.findOne({ _id: chat.chatBot._id });

//     const data = await getAiResponse(chatBot, chat, req.body.chatRequest);

//     chat.messages = [...chat.messages, req.body.chatRequest, data];

//     const updatedChat = await chat.save();

//     return res.json(updatedChat);
//   } catch (err) {
//     console.error('Error during PATCH request:', err);
//     return res.status(500).json({ error: 'Could not process the request' });
//   }
// });

  


router.get('/:id', async (req, res, next) => {
  let chat = null;
  try {
    chat = await Chat.findById(req.params.id)
    return res.json(chat)
  } catch(err) {
    const error = new Error('Chat not found');
    error.statusCode = 404;
    error.errors = { message: "No chat found with that id" };
    return next(error);
  }
  
});

router.get('/', requireUser, async (req, res, next) => {
  try {
    const chat = await Chat.find({author: req.user})
                  .populate('chatBot, _id name')
    return res.json(chat)
  } catch(err) {
    const error = new Error('Chat not found');
    error.statusCode = 404;
    error.errors = { message: "No chat found with that id" };
    return next(error);
  }
  
});

router.post('/', requireUser, async (req, res) => {
  const chatBot = await ChatBot.findOne({_id: req.body.chatBotId})
  try {
      const newChat = new Chat ({
    author: req.user,
    chatBot: chatBot,
    messages: []
  });

  const chat = await newChat.save();
  return res.json(chat);

  }catch(err){
    const error = new Error('Chatbot not found');
    error.statusCode = 404;
    error.errors = { message: "No chatbot found with that id" };
    return next(error);
  }
});




module.exports = router;