/**
 * Account Number Generation Utility
 * Generates professional, unique bank account numbers
 */

/**
 * Generate a unique account number
 * Format: XXX-XXXXXXXXXX-XXX (Bank code-Account-Check digit)
 * @returns {string} Formatted account number
 */
export const generateAccountNumber = () => {
  // Bank code (3 digits) - represents the bank
  const bankCode = String(Math.floor(Math.random() * 900) + 100);
  
  // Main account number (10 digits)
  const mainNumber = String(Math.floor(Math.random() * 9000000000) + 1000000000);
  
  // Check digit (Luhn algorithm)
  const checkDigit = calculateLuhnCheckDigit(bankCode + mainNumber);
  
  return `${bankCode}-${mainNumber}-${checkDigit}`;
};

/**
 * Calculate Luhn check digit for account validation
 * @param {string} accountBase - The base account number without check digit
 * @returns {string} Single check digit
 */
const calculateLuhnCheckDigit = (accountBase) => {
  let sum = 0;
  let isEven = false;

  // Process digits from right to left
  for (let i = accountBase.length - 1; i >= 0; i--) {
    let digit = parseInt(accountBase[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return String((10 - (sum % 10)) % 10);
};

/**
 * Validate account number format
 * @param {string} accountNumber - Account number to validate
 * @returns {boolean} True if valid format
 */
export const validateAccountNumber = (accountNumber) => {
  const pattern = /^\d{3}-\d{10}-\d$/;
  return pattern.test(accountNumber);
};

/**
 * Format currency amount for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: NGN)
 * @returns {string} Formatted amount with currency symbol
 */
export const formatCurrency = (amount, currency = 'NGN') => {
  const symbols = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = symbols[currency] || currency;
  return `${symbol}${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
