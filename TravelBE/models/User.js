const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ===== USER SCHEMA =====
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },

    fullName: {
      type: String,
      trim: true,
      maxlength: 100
    },

    avatar: {
      type: String
    },

    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[0-9]{9,15}$/.test(v);
        },
        message: "Invalid phone number"
      }
    },

    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: "Invalid email format"
      }
    },

    password: {
      type: String,
      required: [true, "Password required"],
      minlength: 6
    },

    province: { type: String, trim: true },
    district: { type: String, trim: true },

    agreedToTerms: { type: Boolean, default: false },

    roles: {
      type: [String],
      enum: ["user", "admin", "guide"],
      default: ["user"]
    },

    // Trạng thái tài khoản
    status: {
      type: String,
      enum: ["inactive", "active", "deleted"],
      default: "inactive"
    },

    // Bảo mật
    locked: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0, min: 0 },

    verificationToken: String, // Xác minh email

    refreshTokens: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // ─── LOYALTY / VOUCHER SYSTEM ────────────────────────────────────
    // Tổng số booking đã hoàn thành (dùng để tính nhóm KH)
    totalBookings: { type: Number, default: 0, min: 0 },

    // Tổng số tiền đã chi (dùng để xét VIP)
    totalSpent: { type: Number, default: 0, min: 0 },

    // Nhóm khách hàng: tự động cập nhật sau mỗi booking
    // NEW_USER: chưa có booking nào
    // NORMAL: có booking nhưng chưa đủ VIP
    // VIP: totalSpent >= 10,000,000 VND hoặc totalBookings >= 5
    group: {
      type: String,
      enum: ['NEW_USER', 'NORMAL', 'VIP'],
      default: 'NEW_USER'
    }
  },
  { timestamps: true }
);

// ===== HASH PASSWORD =====
UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (err) {
    next(err);
  }
});

// ===== COMPARE PASSWORD =====
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);
