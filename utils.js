const generateOtp = (length) => {
  let otp;
  for (let i = 0; i < length; i++) {
    let num = Math.floor(Math.random() * 10);
    otp = `${otp || ""}` + `${num}`;
  }

  return otp;
};

const JWTSECRET = "gerhjjehfu4y78687ryugewfubwje ";

module.exports = { generateOtp, JWTSECRET };
