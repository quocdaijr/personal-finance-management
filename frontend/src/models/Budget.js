/**
 * Budget model
 */
class Budget {
  constructor(data = {}) {
    this.id = data.id || Math.random().toString(36).substring(2, 15);
    this.name = data.name || 'Monthly Budget';
    this.amount = data.amount || 0;
    this.spent = data.spent || 0;
    this.category = data.category || 'General';
    this.period = data.period || 'monthly'; // monthly, quarterly, yearly
    this.startDate = data.startDate || new Date().toISOString();
    this.endDate = data.endDate || this.calculateEndDate(data.startDate || new Date().toISOString(), data.period || 'monthly');
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Calculate end date based on period
  calculateEndDate(startDate, period) {
    const date = new Date(startDate);
    
    switch (period) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    
    return date.toISOString();
  }

  // Get remaining budget
  getRemainingAmount() {
    return this.amount - this.spent;
  }

  // Get percentage spent
  getPercentageSpent() {
    if (this.amount === 0) return 0;
    return Math.min(100, Math.round((this.spent / this.amount) * 100));
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      amount: this.amount,
      spent: this.spent,
      category: this.category,
      period: this.period,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create from plain object
  static fromJSON(json) {
    return new Budget(json);
  }
}

export default Budget;
