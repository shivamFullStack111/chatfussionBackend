const {
  register,
  login,
  verifyOtp,
  checkAuthenticated,
  updateUser,
  uploadprofileImage,
  getAllUsers,
  addToContact,
  getUsersBySearch,
  getContactsBySearch,
  blockUser,
  unblockUser,
  removeFromContact,
} = require("../controllers/userControllers");
const { isAuthenticate } = require("../middlewares/isAuthenticate");
const { upload } = require("../uploadProvider");
const userRouter = require("express").Router();

userRouter.post("/register", register);
userRouter.post("/verify-otp", verifyOtp);
userRouter.get("/check-authentication", isAuthenticate, checkAuthenticated);
userRouter.post("/login", login);
userRouter.post("/update-user", isAuthenticate, updateUser);
userRouter.get("/get-all-users", getAllUsers);
userRouter.post(
  "/update-image",
  isAuthenticate,
  upload.single("file"),
  uploadprofileImage
);

userRouter.post("/add-to-contact", isAuthenticate, addToContact);
userRouter.post("/remove-from-contact", isAuthenticate, removeFromContact);
userRouter.post("/get-users-by-search-or-number", getUsersBySearch);
userRouter.post("/get-contacts-by-search", isAuthenticate, getContactsBySearch);
userRouter.post("/block-user", isAuthenticate, blockUser);
userRouter.post("/unblock-user", isAuthenticate, unblockUser);

module.exports = userRouter;
