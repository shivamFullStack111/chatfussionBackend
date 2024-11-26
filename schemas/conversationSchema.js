const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    users: [
      {
        email: String,
        userid: String,
      },
    ],

    type: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },
    groupName: {
      type: String,
    },
    admins: {
      type: Array,
    },

    lastMessage: {
      type: {
        type: String,
      },
      message: String,
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
  },
  { timestamps: true }
);

const Conversations = mongoose.model("conversations", conversationSchema);

module.exports = Conversations;
