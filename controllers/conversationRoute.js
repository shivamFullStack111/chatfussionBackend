const Conversations = require("../schemas/conversationSchema");

const createConversation = async (req, res) => {
  try {
    const { users, type, groupName } = req.body;

    if (type !== "group") {
      const isExist = await Conversations.findOne({
        users: { $all: users },
        type: "group",
      });

      if (isExist)
        return res.send({
          success: true,
          message: "conversation already exists",
          conversation: isExist,
        });
    }
    const newConversation = new Conversations({
      users: [
        ...users,
        {
          email: req.user.email,
          _id: req.user._id,
        },
      ],
      type,
      groupName,
      admins: type == "group" ? [req?.user?.email] : [],
    });

    await newConversation.save();

    return res.send({
      success: true,
      message: "conversation created;",
      conversation: newConversation,
    });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversations.find({
      users: {
        $in: {
          email: req.user.email,
          _id: req.user._id,
        },
      },
    }).sort({ updatedAt: -1 });

    return res.send({
      success: true,
      message: "all conversations get",
      conversations: conversations,
    });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

module.exports = { createConversation, getAllConversations };
