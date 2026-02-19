import React, { useState } from 'react';
import '../styles/Transfers.css';

export default function Transfers() {
  const [formData, setFormData] = useState({
    recipientName: '',
    accountNumber: '',
    bankName: '',
    amount: '',
    description: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, send to backend
    console.log('Transfer submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        recipientName: '',
        accountNumber: '',
        bankName: '',
        amount: '',
        description: '',
      });
    }, 3000);
  };

  const recentTransfers = [
    { id: 1, name: 'John Doe', amount: 50000, date: '2026-02-18', status: 'completed' },
    { id: 2, name: 'Jane Smith', amount: 25000, date: '2026-02-17', status: 'completed' },
    { id: 3, name: 'Mike Johnson', amount: 100000, date: '2026-02-16', status: 'completed' },
  ];

  return (
    <div className="transfers-container">
      <div className="transfers-header">
        <h1>Money Transfer</h1>
        <p>Send money to other accounts securely</p>
      </div>

      <div className="transfers-grid">
        {/* Transfer Form */}
        <div className="transfer-form-container">
          <div className="form-card">
            <h2>New Transfer</h2>

            {submitted && (
              <div className="alert alert-success">
                ✓ Transfer initiated successfully! The funds will be transferred shortly.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="recipientName">Recipient Name</label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  placeholder="Enter recipient's name"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="accountNumber">Account Number</label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bankName">Bank Name</label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    placeholder="Enter bank name"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount (₦)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter transfer description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-terms">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">I agree to the transfer fees and terms</label>
              </div>

              <button type="submit" className="btn btn-primary btn-lg">
                Send Money
              </button>
            </form>
          </div>
        </div>

        {/* Summary & Recent Transfers */}
        <div className="transfer-info-container">
          {/* Transfer Summary */}
          <div className="info-card summary">
            <h3>Transfer Summary</h3>
            <div className="summary-item">
              <label>Daily Limit</label>
              <p>₦500,000</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: '60%' }}></div>
              </div>
              <small>₦300,000 used</small>
            </div>
            <div className="summary-item">
              <label>Monthly Transfers</label>
              <p>15</p>
              <small>Transfers this month</small>
            </div>
            <div className="summary-item">
              <label>Transfer Fee</label>
              <p>₦100 - ₦500</p>
              <small>Depending on amount</small>
            </div>
          </div>

          {/* Recent Transfers */}
          <div className="info-card recent">
            <h3>Recent Transfers</h3>
            <div className="transfers-list">
              {recentTransfers.map((transfer) => (
                <div key={transfer.id} className="transfer-item">
                  <div className="transfer-icon">💸</div>
                  <div className="transfer-details">
                    <p className="transfer-name">{transfer.name}</p>
                    <p className="transfer-date">
                      {new Date(transfer.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="transfer-amount">
                    <p>-₦{transfer.amount.toLocaleString()}</p>
                    <span className={`status ${transfer.status}`}>
                      {transfer.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Card */}
          <div className="info-card tips">
            <h3>💡 Transfer Tips</h3>
            <ul>
              <li>Double-check account numbers before sending</li>
              <li>Transfers typically complete within 24 hours</li>
              <li>Beneficiary accounts must be active</li>
              <li>Keep transaction receipts for records</li>
              <li>Set up favorites for quick transfers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
