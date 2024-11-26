const mongoose = require("mongoose");

exports.userModal = {
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  isVarified: {
    type: Boolean,
    default: false,
  },
  otpData: {
    otp: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  status: {
    type: String,
    enum: ["active", "do not disturb"],
    default: "active",
  },
  profilePicture: {
    type: String,
    default: "everyone",
    enum: ["everyone", "nobody", "friends"],
  },
  lastSeen: {
    type: Boolean,
    default: true,
  },
  showNotifications: {
    type: Boolean,
    default: true,
  },
  notificationSound: {
    type: Boolean,
    default: true,
  },
  profileImage: {
    type: String,
  },
  backgroundImage: {
    type: String,
  },
  lastActive: {
    type: Date,
  },
  blockUsers: Array,
  contacts: Array,
};
const userSchema = new mongoose.Schema(this.userModal, { timestamps: true });

const Users = mongoose.model("user", userSchema);

module.exports = Users;
