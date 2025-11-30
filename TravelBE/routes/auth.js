const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const controller = require("../controllers/authController");

// AUTH
router.post("/register", controller.register);
router.get("/verify-email", controller.verifyEmail);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.post("/refresh-token", controller.refreshToken);

// PROFILE
router.get("/profile", auth(), controller.getProfile);
router.put("/profile", auth(), controller.updateProfile);
router.delete("/profile", auth(), controller.deleteAccount);

module.exports = router;
