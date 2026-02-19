import React from 'react';
import './styles/AccountCard.css';

export default function AccountCard({ account }) {
  // Mask account number for display
  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    const parts = accountNumber.split('-');
    return `${parts[0]}-****${parts[2]}`;
  };

  // Get currency symbol
  const getCurrencySymbol = (currency) => {
    const symbols = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    return symbols[currency] || currency;
  };

  if (!account) {
    return (
      <div className="account-card-placeholder">
        <p>No account found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="account-card">
      <div className="card-header">
        <div className="card-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#0066cc" />
            <path d="M10 15h20M10 20h15M10 25h18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="card-type">{account.account_type}</div>
      </div>

      <div className="card-body">
        <div className="account-number">
          {maskAccountNumber(account.account_number)}
        </div>

        <div className="card-info">
          <div className="info-item">
            <label>Account Holder</label>
            <span>Professional Banking</span>
          </div>
          <div className="info-item">
            <label>Expires</label>
            <span>12/28</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="balance-section">
          <label>Available Balance</label>
          <div className="balance-amount">
            {getCurrencySymbol(account.currency || 'NGN')}
            {parseFloat(account.balance).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className="card-chip">
          <div className="chip-lines">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>

      <div className="card-brand">
        <div className="mastercard-logo">
          <div className="circle red"></div>
          <div className="circle orange"></div>
        </div>
      </div>
    </div>
  );
}
