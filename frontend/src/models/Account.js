/**
 * Account model for financial accounts
 */
class Account {
  constructor(data = {}) {
    this.id = data.id || Math.random().toString(36).substring(2, 15);
    this.name = data.name || 'Default Account';
    this.type = data.type || 'checking'; // checking, savings, credit, investment
    this.balance = data.balance || 0;
    this.currency = data.currency || 'USD';
    // Handle both camelCase (frontend) and snake_case (backend API) formats
    this.isDefault = data.isDefault || data.is_default || false;
    this.createdAt = data.createdAt || data.created_at || new Date().toISOString();
    this.updatedAt = data.updatedAt || data.updated_at || new Date().toISOString();
  }

  // Helper method to format balance with currency symbol
  formattedBalance(currencySymbol = '$') {
    return `${currencySymbol}${this.balance.toFixed(2)}`;
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      balance: this.balance,
      currency: this.currency,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create from plain object
  static fromJSON(json) {
    return new Account(json);
  }
}

export default Account;
