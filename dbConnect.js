const mongoose = require("mongoose");

async function connectDb() {
  await mongoose
    .connect(
      "mongodb+srv://shivam111:shivam111@cluster0.rpeveqo.mongodb.net/chat-fussion?retryWrites=true&w=majority&appName=Cluster0"
    )
    .then(() => {
      console.log("db connection established");
    })
    .catch((err) => console.log(err));
}

module.exports = connectDb;
