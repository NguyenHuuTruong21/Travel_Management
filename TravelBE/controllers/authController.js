const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const sendMail = require("../utils/mailer");

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

    await sendMail({
      to: email,
      subject: "Xác thực tài khoản",
      html: `
        <p>Nhấn vào link để kích hoạt tài khoản:</p>
        <a href="${link}">${link}</a>
      `
    });

    res.json({ message: "Đăng ký thành công. Vui lòng kiểm tra email." });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ---------------------- VERIFY EMAIL ----------------------- */
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;

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

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Email không tồn tại" });

    if (user.locked)
      return res.status(403).json({ message: "Tài khoản bị khoá" });

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.failedLoginAttempts++;

      if (user.failedLoginAttempts >= 5) {
        user.locked = true;
        await user.save();
        return res.status(403).json({ message: "Tài khoản bị khoá do nhập sai 5 lần" });
      }

      await user.save();
      return res.status(400).json({
        message: `Sai mật khẩu. Bạn còn ${5 - user.failedLoginAttempts} lần thử`
      });
    }

    user.failedLoginAttempts = 0;

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken();

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken
    });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ---------------------- REFRESH TOKEN ----------------------- */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({
      "refreshTokens.token": refreshToken
    });

    if (!user)
      return res.status(403).json({ message: "Refresh token không hợp lệ" });

    const newToken = createAccessToken(user);

    res.json({ accessToken: newToken });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ---------------------- LOGOUT ----------------------- */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    await User.updateOne(
      { "refreshTokens.token": refreshToken },
      { $pull: { refreshTokens: { token: refreshToken } } }
    );

    res.json({ message: "Đăng xuất thành công" });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ---------------------- PROFILE (VIEW / UPDATE / DELETE) ----------------------- */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -refreshTokens -verificationToken -resetPasswordToken");

    res.json({ user });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, province, district, password } = req.body;

    const user = await User.findById(req.user.id);

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (province) user.province = province;
    if (district) user.district = district;

    if (password) user.password = password; // sẽ được hash bởi pre("save")

    await user.save();

    res.json({ message: "Cập nhật hồ sơ thành công" });

  } catch (err) {
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
