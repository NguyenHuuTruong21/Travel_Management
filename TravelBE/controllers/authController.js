const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const sendMail = require("../utils/mailer");
const notification = require("../utils/notification");

// tạo access token
const createAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// tạo refresh token
const createRefreshToken = () => uuidv4();

/* ---------------------- REGISTER ----------------------- */
exports.register = async (req, res) => {
  try {
    const {
      username,
      fullName,
      phoneNumber,
      email,
      password,
      province,
      district,
      agreedToTerms
    } = req.body;

    if (!agreedToTerms)
      return res.status(400).json({ message: "Bạn phải đồng ý điều khoản" });
    if (!email || !password)
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });

    const existEmail = await User.findOne({ email });
    if (existEmail)
      return res.status(400).json({ message: "Email đã tồn tại!" });

    if (username) {
      const existUsername = await User.findOne({ username });
      if (existUsername)
        return res.status(400).json({ message: "Username đã tồn tại!" });
    }

    const verificationToken = uuidv4();

    const user = new User({
      username,
      fullName,
      phoneNumber,
      email,
      password,
      province,
      district,
      agreedToTerms,
      verificationToken,
      status: "inactive"
    });

    await user.save();

    const link = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${email}`;

    try {
      await sendMail(
        email,
        "Xác thực tài khoản",
        `<p>Nhấn vào link để kích hoạt tài khoản:</p><a href="${link}">${link}</a>`
      );
    } catch (mailErr) {
      console.error("Failed to send verification email", mailErr);
    }

    res.json({ message: "Đăng ký thành công. Vui lòng kiểm tra email." });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ---------------------- VERIFY EMAIL ----------------------- */
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) return res.status(400).json({ message: "Token/email không hợp lệ" });

    const user = await User.findOne({
      verificationToken: token,
      email
    });

    if (!user)
      return res.status(400).json({ message: "Token không hợp lệ" });

    user.status = "active";
    user.verificationToken = null;
    await user.save();

    res.json({ message: "Xác thực email thành công" });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ---------------------- LOGIN ----------------------- */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Email không tồn tại" });

    // Kiểm tra tài khoản bị khóa
    if (user.locked)
      return res.status(403).json({ message: "Tài khoản bị khoá" });
    
    //So sánh mật khẩu
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Khóa tài khoản sau 5 lần sai
      if (user.failedLoginAttempts >= 5) {
        user.locked = true;
        await user.save();

        // Gửi cảnh báo bảo mật
        await notification.createAndDeliver({
          userId: user._id,
          title: "Cảnh báo bảo mật: Tài khoản bị khóa",
          message: `Tài khoản của bạn đã bị khóa sau 5 lần đăng nhập thất bại lúc ${new Date().toLocaleString()}.`,
          type: "security",
          sendEmail: true,
          isImportant: true
        });

        return res.status(403).json({ message: "Tài khoản bị khoá do nhập sai 5 lần" });
      }

      await user.save();
      return res.status(400).json({
        message: `Sai mật khẩu. Bạn còn ${5 - user.failedLoginAttempts} lần thử`
      });
    }

    // Reset failed attempts on success
    user.failedLoginAttempts = 0;

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken();

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ---------------------- REFRESH TOKEN ----------------------- */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token bắt buộc" });

    const user = await User.findOne({
      "refreshTokens.token": refreshToken
    });

    if (!user)
      return res.status(403).json({ message: "Refresh token không hợp lệ" });

    // Tạo access token mới
    const newToken = createAccessToken(user);

    res.json({ accessToken: newToken });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ---------------------- LOGOUT ----------------------- */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token bắt buộc" });

    // Xóa refresh token cụ thể
    await User.updateOne(
      { "refreshTokens.token": refreshToken },
      { $pull: { refreshTokens: { token: refreshToken } } }
    );

    res.json({ message: "Đăng xuất thành công" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


/* ---------------------- PROFILE (VIEW / UPDATE / DELETE) ----------------------- */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -refreshTokens -verificationToken");
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    res.json({ user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, province, district, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (province) user.province = province;
    if (district) user.district = district;

    // Handle avatar upload
    if (req.file) {
      // Assuming server serves static files from /uploads
      // Check server.js for static folder configuration first, defaulting to logic consistent with other controllers
      user.avatar = `/uploads/users/${req.file.filename}`;
    }

    if (password) user.password = password; // sẽ được hash bởi pre("save")

    const updatedUser = await user.save();

    res.json({
      message: "Cập nhật hồ sơ thành công",
      user: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        avatar: updatedUser.avatar,
        roles: updatedUser.roles
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { status: "deleted" });
    res.json({ message: "Tài khoản đã bị xoá (soft delete)" });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
