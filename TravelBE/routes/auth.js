const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const uploadUser = require("../middlewares/uploadUser");
const controller = require("../controllers/authController");

/* --------------------------------
   AUTHENTICATION
-------------------------------- */
router.post("/register", controller.register);
router.get("/verify-email", controller.verifyEmail);
router.post("/login", controller.login);
router.post("/logout", auth(), controller.logout);
router.post("/refresh-token", controller.refreshToken);
// Forgot/Reset password endpoints removed by request

/* --------------------------------
   USER PROFILE
-------------------------------- */
router.get("/profile", auth(), controller.getProfile);
router.put("/profile", auth(), uploadUser.single('avatar'), controller.updateProfile);
router.delete("/profile", auth(), controller.deleteAccount);

module.exports = router;
