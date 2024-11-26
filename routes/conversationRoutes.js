const { createConversation ,getAllConversations} = require("../controllers/conversationRoute");
const { isAuthenticate } = require("../middlewares/isAuthenticate");
const Conversations = require("../schemas/conversationSchema");

const conversationRoute = require("express").Router();

conversationRoute.post(
  "/create-conversation",
  isAuthenticate,
  createConversation
);

conversationRoute.get('/get-all-conversations', isAuthenticate,getAllConversations)

module.exports = conversationRoute;
