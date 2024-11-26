const Users = require("../schemas/userSchema");
const jwt = require("jsonwebtoken");
const { JWTSECRET } = require("../utils");

const isAuthenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization)
      return res.send({ success: false, message: "token not found" });

    const { user } = jwt.verify(authorization, JWTSECRET);
    const userr = await Users.findOne({ email: user.email });
    if (!userr)
      return res.send({ success: false, message: "token is invalid" });

    req.user = userr;
    next();
  } catch (error) {
    return res.send({ success: false, error: error.message });
  }
};

module.exports = { isAuthenticate };
