/**
 * Transaction model
 */
class Transaction {
  constructor(data = {}) {
    this.id = data.id || Math.random().toString(36).substring(2, 15);
    this.amount = data.amount || 0;
    this.description = data.description || '';
    this.category = data.category || 'Uncategorized';
    this.type = data.type || 'expense'; // 'income' or 'expense'
    this.date = data.date || new Date().toISOString();
    this.accountId = data.accountId || 'default';
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Helper method to format amount with currency symbol
  formattedAmount(currencySymbol = '$') {
    return `${this.type === 'income' ? '+' : '-'} ${currencySymbol}${Math.abs(this.amount).toFixed(2)}`;
  }

  // Helper method to get color based on transaction type
  getColor() {
    return this.type === 'income' ? 'success.main' : 'error.main';
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      amount: this.amount,
      description: this.description,
      category: this.category,
      type: this.type,
      date: this.date,
      accountId: this.accountId,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create from plain object
  static fromJSON(json) {
    return new Transaction(json);
  }
}

export default Transaction;
