const VNPayService = require('./vnpay');
const MoMoService = require('./momo');

class PaymentService {
  async createPaymentUrl(booking, paymentMethod, req) {
    if (paymentMethod === 'VNPay') {
      return VNPayService.createPaymentUrl(booking, req);
    }
    if (paymentMethod === 'MoMo') {
      return MoMoService.createPaymentUrl(booking);
    }
    throw new Error('Phương thức thanh toán không hỗ trợ');
  }

  // Xử lý IPN chung (gọi từ route)
  async handleIPN(provider, data) {
    if (provider === 'vnpay') {
      return VNPayService.handleIPN(data);
    }
    if (provider === 'momo') {
      return MoMoService.handleIPN(data);
    }
    throw new Error('Provider không hỗ trợ');
  }
}

module.exports = new PaymentService();