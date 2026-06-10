const { VNPay } = require('vnpay');

/**
 * Cấu hình VNPay từ biến môi trường
 */
const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE || '2QXUI4J4',
  secureSecret: process.env.VNP_HASH_SECRET || 'SECRETKEY123456789',
  vnpayHost: 'https://sandbox.vnpayment.vn',
  testMode: true,
});

/**
 * Sinh URL thanh toán VNPay
 * @param {Object} data { _id, totalPrice, paymentId }
 * @param {Object} req Request object
 */
exports.createPaymentUrl = (data, req) => {
  const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5000/api/payments/vnpay/return';

  // Định dạng thời gian yyyyMMddHHmmss
  const date = new Date();
  const vnp_CreateDate = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0') +
    date.getHours().toString().padStart(2, '0') +
    date.getMinutes().toString().padStart(2, '0') +
    date.getSeconds().toString().padStart(2, '0');

  return vnpay.buildPaymentUrl({
    vnp_Amount: data.totalPrice, // Thư viện vnpay v2 tự nhân 100
    vnp_TxnRef: data._id.toString(),
    vnp_OrderInfo: `Thanh toan don hang ${data._id}`,
    vnp_OrderType: 'billpayment',
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: vnp_CreateDate,
    vnp_Locale: 'vn',
    vnp_Command: 'pay'
  });
};

/**
 * Kiểm tra tính hợp lệ của IPN query
 * @param {Object} query req.query từ VNPay gọi qua
 */
exports.verifyIPN = (query) => {
  const verifyResult = vnpay.verifyIpn(query);
  return {
    success: verifyResult.isVerified && verifyResult.isSuccess,
    vnp_ResponseCode: query['vnp_ResponseCode'],
    vnp_TxnRef: query['vnp_TxnRef']
  };
};