const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    fullName: String,
    phoneNumber: String,

    email: { type: String, unique: true, required: true },

    password: { type: String, required: true },

    province: String,
    district: String,

    agreedToTerms: { type: Boolean, default: false },

    roles: { type: [String], default: ["user"] },

    status: {
      type: String,
      enum: ["inactive", "active", "deleted"],
      default: "inactive"
    },

    locked: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },

    verificationToken: String,

    resetPasswordToken: {
      token: String,
      expiresAt: Date
    },

    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// So sánh mật khẩu
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);
