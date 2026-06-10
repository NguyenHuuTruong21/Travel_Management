const Promotion = require('../models/Promotion');
const VoucherUsage = require('../models/VoucherUsage');
const User = require('../models/User');
const Booking = require('../models/Booking');

// ═══════════════════════════════════════════════════════════════════════
//  RULE-BASED VALIDATION ENGINE
//  Kiểm tra lần lượt 8 điều kiện trước khi apply voucher
// ═══════════════════════════════════════════════════════════════════════

/**
 * Hàm chính: validate voucher theo rule-based system
 * @param {Object} params - { code, userId, bookingType, amount, location, tourId }
 * @returns {Object} - { valid, discount, finalAmount, message, promotion }
 */
const validateVoucher = async (params) => {
  const { code, userId, bookingType, amount, location = '', tourId = null } = params;

  // ─── RULE 1: Voucher có tồn tại không? ────────────────────────────
  const promo = await Promotion.findOne({ code: code.toUpperCase().trim() });
  if (!promo) {
    return { valid: false, message: 'Mã giảm giá không tồn tại' };
  }

  // ─── RULE 2: isActive = true? ─────────────────────────────────────
  if (!promo.isActive) {
    return { valid: false, message: 'Mã giảm giá đã bị vô hiệu hóa' };
  }

  // ─── RULE 3: Trong thời gian hiệu lực? ────────────────────────────
  const now = new Date();
  if (promo.startDate > now) {
    return {
      valid: false,
      message: `Mã giảm giá chưa có hiệu lực (bắt đầu từ ${promo.startDate.toLocaleDateString('vi-VN')})`
    };
  }
  if (promo.endDate < now) {
    return { valid: false, message: 'Mã giảm giá đã hết hạn' };
  }

  // ─── RULE 4: usageLimit chưa vượt quá? ────────────────────────────
  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
    return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' };
  }

  // ─── RULE 5: User thuộc đúng nhóm khách hàng? ────────────────────
  if (promo.userGroup !== 'ALL') {
    const user = await User.findById(userId);
    if (!user) {
      return { valid: false, message: 'Không tìm thấy thông tin người dùng' };
    }
    if (user.group !== promo.userGroup) {
      const groupLabels = { NEW_USER: 'Khách hàng mới', VIP: 'VIP', NORMAL: 'Thành viên thường' };
      return {
        valid: false,
        message: `Mã này chỉ dành cho ${groupLabels[promo.userGroup] || promo.userGroup}`
      };
    }
  }

  // ─── RULE 6: bookingType hợp lệ? ─────────────────────────────────
  if (promo.applicableTypes && promo.applicableTypes.length > 0) {
    if (!promo.applicableTypes.includes(bookingType?.toLowerCase())) {
      const typeLabels = { tour: 'Tour du lịch', hotel: 'Khách sạn', car: 'Thuê xe' };
      const allowed = promo.applicableTypes.map(t => typeLabels[t] || t).join(', ');
      return {
        valid: false,
        message: `Mã này chỉ áp dụng cho: ${allowed}`
      };
    }
  }

  // ─── RULE 7: Tour cụ thể hợp lệ? (nếu có giới hạn tour) ──────────
  if (promo.applicableTours && promo.applicableTours.length > 0 && tourId) {
    const tourIdStr = tourId.toString();
    const isApplicable = promo.applicableTours.some(t => t.toString() === tourIdStr);
    if (!isApplicable) {
      return { valid: false, message: 'Mã giảm giá không áp dụng cho sản phẩm này' };
    }
  }

  // ─── RULE 7b: Location hợp lệ? ────────────────────────────────────
  if (promo.applicableLocations && promo.applicableLocations.length > 0 && location) {
    const locationMatch = promo.applicableLocations.some(loc =>
      location.toLowerCase().includes(loc.toLowerCase())
    );
    if (!locationMatch) {
      return {
        valid: false,
        message: `Mã này chỉ áp dụng tại: ${promo.applicableLocations.join(', ')}`
      };
    }
  }

  // ─── RULE 8: amount >= minOrderValue? ────────────────────────────
  if (promo.minOrderValue > 0 && amount < promo.minOrderValue) {
    return {
      valid: false,
      message: `Đơn hàng tối thiểu ${promo.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã này`
    };
  }

  // ─── RULE 9: Mỗi user dùng bao nhiêu lần? ────────────────────────
  if (userId && promo.perUserLimit > 0) {
    const userUsageCount = await VoucherUsage.countDocuments({
      voucherId: promo._id,
      userId
    });
    if (userUsageCount >= promo.perUserLimit) {
      return {
        valid: false,
        message: promo.perUserLimit === 1
          ? 'Bạn đã sử dụng mã giảm giá này rồi'
          : `Bạn đã dùng mã này ${userUsageCount}/${promo.perUserLimit} lần`
      };
    }
  }

  // ─── TÍNH TOÁN GIẢM GIÁ ──────────────────────────────────────────
  let discountAmount = 0;
  if (promo.discountType === 'percent') {
    discountAmount = (amount * promo.discountValue) / 100;
    // Áp dụng giới hạn maxDiscount nếu có
    if (promo.maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, promo.maxDiscount);
    }
  } else {
    // Fixed amount
    discountAmount = promo.discountValue;
  }

  // Đảm bảo không giảm nhiều hơn tổng tiền
  discountAmount = Math.min(discountAmount, amount);
  const finalAmount = Math.max(0, amount - discountAmount);

  return {
    valid: true,
    discountAmount,
    finalAmount,
    promotion: promo,
    message: `Áp dụng thành công! Giảm ${discountAmount.toLocaleString('vi-VN')}đ`
  };
};

// ═══════════════════════════════════════════════════════════════════════
//  API: APPLY VOUCHER (Preview - chưa trừ usedCount)
// ═══════════════════════════════════════════════════════════════════════

/**
 * POST /api/vouchers/apply
 * Body: { code, bookingType, amount, location?, tourId? }
 * Auth: required (user)
 */
exports.applyVoucher = async (req, res) => {
  try {
    const { code, bookingType, amount, location, tourId } = req.body;
    const userId = req.user?.id;

    if (!code || !bookingType || !amount) {
      return res.status(400).json({ message: 'Thiếu thông tin: code, bookingType, amount' });
    }

    const result = await validateVoucher({
      code, userId, bookingType,
      amount: Number(amount),
      location, tourId
    });

    if (!result.valid) {
      return res.status(400).json({ valid: false, message: result.message });
    }

    return res.json({
      valid: true,
      message: result.message,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
      voucherCode: result.promotion.code,
      discountType: result.promotion.discountType,
      discountValue: result.promotion.discountValue
    });

  } catch (error) {
    console.error('Apply voucher error:', error);
    res.status(500).json({ message: 'Lỗi server khi kiểm tra voucher', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  HÀM NỘI BỘ: Ghi nhận việc dùng voucher khi thanh toán thành công
//  (Gọi từ paymentController sau khi thanh toán xong)
// ═══════════════════════════════════════════════════════════════════════
exports.recordVoucherUsage = async ({ code, userId, bookingId, discountAmount, originalAmount, finalAmount }) => {
  try {
    const promo = await Promotion.findOne({ code: code.toUpperCase() });
    if (!promo) return;

    // Tạo VoucherUsage record
    await VoucherUsage.create({
      voucherId: promo._id,
      userId,
      bookingId,
      discountAmount,
      originalAmount,
      finalAmount
    });

    // Tăng usedCount
    await Promotion.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } });
  } catch (err) {
    console.error('recordVoucherUsage error:', err);
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  ADMIN CRUD APIs
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/vouchers
 * Admin: lấy danh sách tất cả voucher + thống kê
 */
exports.getVouchers = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, search } = req.query;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { code: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const total = await Promotion.countDocuments(filter);
    const vouchers = await Promotion.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Thêm thông tin: còn hiệu lực không
    const now = new Date();
    const enriched = vouchers.map(v => ({
      ...v,
      isExpired: v.endDate < now,
      isNotStarted: v.startDate > now,
      remainingUses: v.usageLimit > 0 ? v.usageLimit - v.usedCount : null
    }));

    res.json({
      data: enriched,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * GET /api/vouchers/:id
 * Admin: lấy chi tiết một voucher
 */
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Promotion.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * POST /api/vouchers
 * Admin: tạo voucher mới
 */
exports.createVoucher = async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue, maxDiscount,
      minOrderValue, startDate, endDate, applicableTypes,
      applicableLocations, userGroup, usageLimit, perUserLimit,
      isActive, isFlashSale, applicableTours
    } = req.body;

    // Kiểm tra code trùng
    const existing = await Promotion.findOne({ code: code?.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: `Mã voucher "${code.toUpperCase()}" đã tồn tại` });
    }

    const voucher = await Promotion.create({
      code, description, discountType, discountValue,
      maxDiscount: maxDiscount || 0,
      minOrderValue: minOrderValue || 0,
      startDate, endDate,
      applicableTypes: applicableTypes || [],
      applicableLocations: applicableLocations || [],
      userGroup: userGroup || 'ALL',
      usageLimit: usageLimit || 0,
      perUserLimit: perUserLimit || 1,
      isActive: isActive !== undefined ? isActive : true,
      isFlashSale: isFlashSale || false,
      applicableTours: applicableTours || []
    });

    res.status(201).json({ message: 'Tạo voucher thành công', voucher });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * PUT /api/vouchers/:id
 * Admin: cập nhật voucher
 */
exports.updateVoucher = async (req, res) => {
  try {
    const voucher = await Promotion.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });

    // Không cho sửa code
    const { code, usedCount, ...updateData } = req.body;

    const updated = await Promotion.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Cập nhật voucher thành công', voucher: updated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * DELETE /api/vouchers/:id
 * Admin: xóa voucher (chỉ xóa nếu chưa được dùng)
 */
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Promotion.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });

    if (voucher.usedCount > 0) {
      // Nếu đã có người dùng, disable thay vì xóa
      voucher.isActive = false;
      await voucher.save();
      return res.json({ message: 'Voucher đã được vô hiệu hóa (đã có người sử dụng nên không thể xóa)' });
    }

    await Promotion.deleteOne({ _id: req.params.id });
    res.json({ message: 'Xóa voucher thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * GET /api/vouchers/public/suggest
 * User: gợi ý voucher phù hợp với đơn hàng hiện tại
 */
exports.suggestVouchers = async (req, res) => {
  try {
    const { bookingType, amount } = req.query;
    const userId = req.user?.id;
    const now = new Date();

    // Lấy user để xét nhóm
    const user = userId ? await User.findById(userId) : null;
    const userGroup = user?.group || 'NEW_USER';

    // Tìm các voucher đang active, còn hạn
    const vouchers = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: 0 },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ],
      $or: [
        { userGroup: 'ALL' },
        { userGroup: userGroup }
      ],
      $or: [
        { applicableTypes: { $size: 0 } },
        { applicableTypes: bookingType?.toLowerCase() }
      ],
      minOrderValue: { $lte: Number(amount) || 0 }
    })
      .sort({ discountValue: -1 })
      .limit(5)
      .select('code description discountType discountValue maxDiscount endDate userGroup');

    res.json({ suggestions: vouchers });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * GET /api/vouchers/usage
 * Admin: lịch sử sử dụng voucher
 */
exports.getUsageHistory = async (req, res) => {
  try {
    const { voucherId, page = 1, limit = 20 } = req.query;
    const filter = voucherId ? { voucherId } : {};

    const total = await VoucherUsage.countDocuments(filter);
    const usages = await VoucherUsage.find(filter)
      .populate('userId', 'fullName email')
      .populate('voucherId', 'code discountType discountValue')
      .populate('bookingId', 'type totalPrice status')
      .sort({ usedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ data: usages, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Export validateVoucher để dùng trong paymentController
exports.validateVoucher = validateVoucher;
