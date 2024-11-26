const { isAuthenticate } = require("../middlewares/isAuthenticate");
const Messages = require("../schemas/messageSchema");
const {
  connectSocket,
  getSocketIdByEmail,
  sendMessageUsingSocket,
} = require("../socketController");
const { upload } = require("../uploadProvider");
const cloudinary = require("cloudinary").v2;
const path = require("path"); // For file extension handling

const messageRoute = require("express").Router();

messageRoute.post("/get-all-messages", isAuthenticate, async (req, res) => {
  try {
    const messages = await Messages.find({
      conversationid: req?.body.conversationid,
    });

    return res.send({
      success: true,
      messages: messages,
      message: "all message get",
    });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
});

messageRoute.post(
  "/create-message",
  isAuthenticate,
  upload.single("file"),
  async (req, res) => {
    try {
      let newMessage;
      if (req.body.type == "text") {
        newMessage = new Messages({
          message: {
            type: req?.body.type,
            text: req?.body.text,
          },
          receiver: req?.body?.receiver?.email,
          sender: req?.user?.email,
          conversationid: req?.body?.conversationid,
        });
      }

      if (req.body.type == "audio") {
        const result = await cloudinary.uploader.upload(req?.file?.path, {
          resource_type: "video",
        });

        let receiver = JSON.parse(req.body.receiver);

        newMessage = new Messages({
          sender: req?.user?.email,
          receiver: receiver?.email,
          conversationid: req?.body?.conversationid,
          message: {
            type: "audio",
            url: result.secure_url,
          },
        });
      }
      await newMessage.save();

      // if (newMessage?.receiver)
      sendMessageUsingSocket(newMessage, newMessage?.receiver);

      return res.send({
        success: true,
        message: "message saved successfully",
        mssg: newMessage,
      });
    } catch (error) {
      return res.send({ success: false, message: error.message });
    }
  }
);

messageRoute.post(
  "/create-document-message",
  isAuthenticate,
  upload.array("file"),
  async (req, res) => {
    try {
      const { conversationid, receiver } = req.body;

      let messages = [];

      await Promise.all(
        req.files.map(async (file) => {
          // Get file extension and determine type
          const ext = path.extname(file.originalname).toLowerCase();
          let type;

          if (
            [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"].includes(ext)
          ) {
            type = "image";
          } else if (
            [".mp4", ".mkv", ".mov", ".avi", ".flv", ".wmv"].includes(ext)
          ) {
            type = "video";
          } else if ([".mp3", ".wav", ".aac", ".flac", ".ogg"].includes(ext)) {
            type = "audio";
          } else {
            type = "document"; // Default fallback for unsupported types
          }

          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "auto",
          });

          const newMessage = new Messages({
            conversationid,
            sender: req.user?.email,
            receiver,
            message: {
              type, // Dynamically determined
              url: result?.secure_url,
              fileName: result?.original_filename,
            },
          });

          messages.push(newMessage);
          await newMessage.save();

          // if (newMessage?.receiver)
          sendMessageUsingSocket(newMessage, newMessage?.receiver);
        })
      );

      return res.send({
        success: true,
        message: "Message sent successfully",
        messages,
      });
    } catch (error) {
      console.error("Error in create-document-message route:", error);
      return res.status(500).send({ success: false, message: error.message });
    }
  }
);

messageRoute.post(
  "/send-current-location",
  isAuthenticate,
  async function (req, res) {
    try {
      const { latitude, longitude } = req.body;

      console.log(latitude, longitude);

      const newMessage = new Messages({
        sender: req.user?.email,
        receiver: req.body?.receiver?.email,
        message: {
          type: "current-location",
          latitude: latitude,
          longitude: longitude,
        },
        conversationid: req.body?.conversationid,
      });

      await newMessage.save();

      // if (newMessage?.receiver)
      sendMessageUsingSocket(newMessage, newMessage?.receiver);

      return res.send({
        success: true,
        message: "location send ",
        mssg: newMessage,
      });
    } catch (error) {
      return res.send({ success: false, message: error.message });
    }
  }
);

module.exports = messageRoute;
