const { Server } = require("socket.io");
const Users = require("./schemas/userSchema");
const Conversations = require("./schemas/conversationSchema");
const emailToSocketid = new Map();
const socketidToEmail = new Map();
let activeUsers = [];

let io;

const addUserTo_activeUsers = (userEmail, socket) => {
  if (
    !emailToSocketid.has(userEmail) &&
    !socketidToEmail.has(socket.id) &&
    !activeUsers.includes(userEmail)
  ) {
    emailToSocketid.set(userEmail, socket.id);
    socketidToEmail.set(socket.id, userEmail);
    activeUsers.push(userEmail);
  }

  io.emit("activeUsers", activeUsers);
};

const removeFromActiveUsers = async (socket, io) => {
  try {
    const email = socketidToEmail.get(socket.id);
    socketidToEmail.delete(socket.id);
    emailToSocketid.delete(email);
    activeUsers = activeUsers.filter((user) => user !== email);
    await Users.findOneAndUpdate({ email }, { lastActive: new Date() });
    io.emit("activeUsers", activeUsers);
  } catch (error) {
    console.log(error.message);
  }
};

const joinUsersConversation = async (socket, user) => {
  try {
    const conversations = await Conversations.find({
      type: "group",
      users: { $elemMatch: { email: user?.email, _id: user?._id } },
    });

    conversations.forEach((conversation) => {
      const conversationid = conversation._id.toString().split("'")[0];
      socket.join(conversationid);
    });
  } catch (error) {
    console.log(error.message);
  }
};

const connectSocket = async (server) => {
  if (io) return io;
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("user connected:", socket.id);

    socket.on("me", (userEmail) => {
      addUserTo_activeUsers(userEmail, socket);
    });

    socket.on("candidate", ({ candidate, toUser }) => {
      const socketId = emailToSocketid.get(toUser.email);
      if (socketId) {
        io.to(socketId).emit("candidate", candidate);
      }
    });

    socket.on("incomingCall", ({ caller, receiver, offer, type }) => {
      console.log("type:---", type);
      console.log("candidate get");
      if (emailToSocketid.has(receiver?.email)) {
        const receiverSocketid = emailToSocketid.get(receiver?.email);
        io.to(receiverSocketid).emit("incomingCall", { offer, caller, type });
      }
    });

    socket.on("answer", ({ answer, caller }) => {
      console.log("answer get ", answer);
      if (emailToSocketid.has(caller.email)) {
        const callerSocketid = emailToSocketid.get(caller?.email);
        io.to(callerSocketid).emit("answer", answer);
      }
    });

    socket.on("disconnect", async () => {
      removeFromActiveUsers(socket, io);
    });

    socket.on("join-group-conversations", (user) => {
      console.log("for group join ", user?.email);
      joinUsersConversation(socket, user);
    });
  });

  console.log("Socket connection established");
  return io;
};

const getSocketIdByEmail = (email) => {
  const socketid = emailToSocketid.get(email);
  return socketid;
};

const sendMessageUsingSocket = (message, receiverEmail) => {
  io.to(message?.conversationid).emit("newMessage", message);
  const receiverSocketid = emailToSocketid.get(receiverEmail);
  console.log("message :", message);

  if (!receiverSocketid) return;
  io.to(receiverSocketid).emit("newMessage", message);
};

module.exports = {
  connectSocket,
  io,
  getSocketIdByEmail,
  sendMessageUsingSocket,
};
