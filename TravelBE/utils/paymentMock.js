// Simple deterministic mock: cardNumber ending with even digit => success.
module.exports = {
  processPayment: async ({ method, payload }) => {
    // Simulate network/payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (method === 'credit_card') {
      const card = (payload.cardNumber || '').toString();
      const lastDigit = card.slice(-1);
      const success = parseInt(lastDigit || '1') % 2 === 0; // even digit => success
      return { success, provider: 'mock_credit', raw: { cardLast: lastDigit } };
    } else if (method === 'banking') {
      // 80% success rate
      const success = Math.random() < 0.8;
      return { success, provider: 'mock_bank', raw: {} };
    } else {
      return { success: false, provider: 'unknown', raw: {} };
    }
  }
};