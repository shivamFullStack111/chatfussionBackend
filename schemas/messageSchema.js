const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationid: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },

    receiver: {
      type: String,
    },

    message: {
      type: {
        type: String,
        enum: [
          "text",
          "image",
          "video",
          "audio",
          "document",
          "current-location",
        ],
        default: "text",
      },
      text: String,
      url: String,
      latitude: String,
      longitude: String,
      fileName: String,
      width: Number,
      height: Number,
    },
  },
  { timestamps: true }
);

const Messages = mongoose.model("messages", messageSchema);

module.exports = Messages;
