/**
 * Currency and Number Formatting Utility for WorkPulse AI
 * Standard currency: Indian Rupee (₹ - INR)
 */

export const CURRENCY_SYMBOL = '₹';

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const formatRupees = formatCurrency;
