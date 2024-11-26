const { isAuthenticate } = require("../middlewares/isAuthenticate");
const { transporter } = require("../middlewares/nodemailer");
const Users = require("../schemas/userSchema");
const { generateOtp, JWTSECRET } = require("../utils");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { upload } = require("../uploadProvider");
const cloudinary = require("cloudinary").v2;

const checkAuthenticated = async (req, res) => {
  try {
    return res.send({ success: true, message: "api working", user: req?.user });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.send({ success: false, message: "all fields are required" });
    }

    const isExistWithEmail = await Users.findOne({ email: email });

    const hashPassword = await bcrypt.hash(password, 10);

    if (isExistWithEmail) {
      if (!isExistWithEmail.isVarified) {
        if (password !== confirmPassword) {
          return res.send({
            success: false,
            message: "password and confirm password do not match",
          });
        }

        let otp = generateOtp(4);

        const otpHash = await bcrypt.hash(otp, 10);

        const info = await transporter.sendMail({
          from: "shivamtestinghost@gmail.com", // sender address
          to: email, // list of receivers
          subject: "Registration otp", // Subject line
          text: "use this otp to verify your chat fussion registration", // plain text body
          html: `
          <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Email</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #121212;
          color: #ffffff;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .email-container {
          max-width: 400px;
          background-color: #1e1e1e;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          text-align: center;
        }
        .header {
          font-size: 24px;
          font-weight: bold;
          color: #e0aaff;
          margin-bottom: 10px;
        }
        .message {
          font-size: 16px;
          color: #bdbdbd;
          margin-bottom: 20px;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          color: #00e676;
          letter-spacing: 2px;
          margin: 10px 0;
        }
        .footer {
          font-size: 12px;
          color: #757575;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">ChatFussion</div>
        <p class="message">Thank you for registering with ChatFussion! Use the OTP below to complete your registration:</p>
        <div class="otp-code">${otp}</div>
        <p class="footer">If you didn’t request this, please ignore this email.</p>
      </div>
    </body>
    </html>
    `, // html body
        });

        isExistWithEmail.otpData.otp = otpHash;
        isExistWithEmail.otpData.createdAt = new Date();
        isExistWithEmail.name = name;
        isExistWithEmail.phoneNumber = phoneNumber;
        isExistWithEmail.password = hashPassword;

        await isExistWithEmail.save();
        return res.send({ success: true, message: "otp send to your email " });
      } else {
        return res.send({
          success: false,
          message: "account already exists with this email",
        });
      }
    }

    const isExistWithNumber = await Users.findOne({ phoneNumber });

    if (isExistWithNumber) {
      return res.send({
        success: false,
        message: "account already exists with this phone number",
      });
    }

    if (password !== confirmPassword) {
      return res.send({
        success: false,
        message: "password and confirm password do not match",
      });
    }

    let otp = generateOtp(4);

    const otpHash = await bcrypt.hash(otp, 10);

    const info = await transporter.sendMail({
      from: "shivamtestinghost@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Registration otp", // Subject line
      text: "use this otp to verify your chat fussion registration", // plain text body
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #121212;
      color: #ffffff;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .email-container {
      max-width: 400px;
      background-color: #1e1e1e;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      text-align: center;
    }
    .header {
      font-size: 24px;
      font-weight: bold;
      color: #e0aaff;
      margin-bottom: 10px;
    }
    .message {
      font-size: 16px;
      color: #bdbdbd;
      margin-bottom: 20px;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      color: #00e676;
      letter-spacing: 2px;
      margin: 10px 0;
    }
    .footer {
      font-size: 12px;
      color: #757575;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">ChatFussion</div>
    <p class="message">Thank you for registering with ChatFussion! Use the OTP below to complete your registration:</p>
    <div class="otp-code">${otp}</div>
    <p class="footer">If you didn’t request this, please ignore this email.</p>
  </div>
</body>
</html>
`, // html body
    });

    const newUser = new Users({
      name,
      email,
      phoneNumber,
      otpData: {
        otp: otpHash,
        createdAt: new Date(),
      },
      password: hashPassword,
      isVarified: false,
    });

    await newUser.save();

    return res.send({ success: true, message: "otp send to your email " });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const user = await Users.findOne({ email });

    const isSameOtp = await bcrypt.compare(otp, user?.otpData?.otp);

    if (!isSameOtp) return res.send({ success: false, message: "invalid otp" });

    // conparing the otp time is it is expire or not according to 10 minutes
    const currentTime = Date.now();
    const otpTime = new Date(user?.otpData.createdAt).getTime();
    const timeDifference = currentTime - otpTime;
    const tenMinutesinMS = 10 * 60 * 1000;

    if (timeDifference > tenMinutesinMS) {
      return res.send({ success: false, message: "otp is expired" });
    }

    user.isVarified = true;

    await user.save();
    const token = jwt.sign({ user }, JWTSECRET, { expiresIn: "365d" });
    return res.send({
      success: true,
      message: "Registration successful",
      user,
      token,
    });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.send({ success: false, message: "All fields are required" });

    const user = await Users.findOne({ email });

    if (!user) return res.send({ success: false, message: "User not found" });

    const isCompare = await bcrypt.compare(password, user?.password);

    if (!isCompare)
      return res.send({ success: false, message: "Credentials mismatch" });

    const token = jwt.sign({ user }, JWTSECRET, { expiresIn: "365d" });

    return res.send({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userr = await Users.findOne({ email: req.user.email });

    if (!userr) return res.send({ success: false, message: "user not found" });

    const user = await Users.findOneAndUpdate(
      { email: userr.email },
      req.body,
      {
        new: true,
      }
    );

    return res.send({
      success: true,
      message: "user updated successfully",
      user,
    });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const uploadprofileImage = async (req, res) => {
  try {
    const { imageType } = req.body;
    const user = await Users.findOne({ email: req?.user?.email });

    const result = await cloudinary.uploader.upload(req.file.path);

    if (!user) return res.send({ success: false, message: "User not found" });
    if (imageType === "background") {
      user.backgroundImage = result.secure_url;
      await user.save();
    }
    if (imageType === "profile") {
      user.profileImage = result.secure_url;
      await user.save();
    }

    return res.send({
      success: true,
      message: "Image update successfully",
      user,
    });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Users.find();

    return res.send({ success: true, message: "all users get", users });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const addToContact = async (req, res) => {
  try {
    const { userid } = req.body;
    const user = await Users.findOne({ email: req.user.email });
    user.contacts = [...user.contacts, userid];

    await user.save();

    return res.send({ success: true, message: "Successfully added" });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const getUsersBySearch = async (req, res) => {
  try {
    const { searchText } = req.body;
    const users = await Users.find({
      $or: [
        { name: { $regex: searchText, $options: "i" } },
        { phoneNumber: { $regex: searchText, $options: "i" } },
      ],
    });

    return res.send({ success: true, message: "users found", users });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const getContactsBySearch = async (req, res) => {
  try {
    let contacts;
    if (req.body?.searchText) {
      const searchValue = req.body.searchText.toLowerCase();
      contacts = await Users.find({
        $and: [
          {
            $or: [
              { name: { $regex: searchValue, $options: "i" } },
              { email: { $regex: searchValue, $options: "i" } },
              { phoneNumber: { $regex: searchValue, $options: "i" } },
            ],
          },
          { _id: { $in: req.user?.contacts } },
        ],
      }).sort({ createdAt: -1 });
    } else {
      contacts = await Users.find({
        _id: { $in: req.user?.contacts || [] },
      }).sort({ createdAt: -1 });
    }

    return res.send({ success: true, message: "contacts get", contacts });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userid } = req.body;

    const user = await Users.findOne({ email: req.user.email });

    user.blockUsers = [...user?.blockUsers, userid];

    await user.save();

    return res.send({ success: true, message: "user blocked", user });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    console.log("]]]]]]]]]]]]]]]]]]];-----", req.user, req.body.userid);
    const { userid } = req.body;
    const user = await Users.findOne({ email: req.user.email });
    user.blockUsers = user?.blockUsers?.filter((id) => id !== userid);

    await user.save();

    return res.send({ success: true, message: "unblock user", user });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

const removeFromContact = async (req, res) => {
  try {
    const { userid } = req.body;
    const user = await Users.findOne({ _id: req.user._id });

    user.contacts = user.contacts.filter((id) => id !== userid);

    await user.save();

    return res.send({
      success: true,
      message: "user remove from contact",
      user,
    });
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  getContactsBySearch,
  login,
  verifyOtp,
  checkAuthenticated,
  updateUser,
  uploadprofileImage,
  getAllUsers,
  addToContact,
  getUsersBySearch,
  blockUser,
  unblockUser,
  removeFromContact,
};
