const nodemailer = require("nodemailer");

exports.transporter = nodemailer.createTransport({
  service: "gmail", // Gmail SMTP service use kar rahe hain
  auth: {
    user: "shivamtestinghost@gmail.com", // Aapka Gmail address
    pass: "awdxjdvzaksepqtv", // Generated app password (replace it with this one)
  },
});
