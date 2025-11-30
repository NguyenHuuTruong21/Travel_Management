// Simple deterministic mock: cardNumber ending with even digit => success.
module.exports = {
  processPayment: async ({ method, payload }) => {
    // payload may include cardNumber, bankId, amount...
    // Simulate delay
    await new Promise(r => setTimeout(r, 500));
    if (method === 'credit_card') {
      const card = (payload.cardNumber || '').toString();
      const last = card.slice(-1);
      const success = parseInt(last || '1') % 2 === 0; // even succeeds
      return { success, provider: 'mock_credit', raw: { cardLast: last } };
    } else if (method === 'banking') {
      // 80% success
      const success = Math.random() < 0.8;
      return { success, provider: 'mock_bank', raw: {} };
    } else {
      return { success: false, provider: 'unknown' };
    }
  }
};