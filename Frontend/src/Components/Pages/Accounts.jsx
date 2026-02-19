import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountCard from '../AccountCard';
import '../styles/Accounts.css';

export default function Accounts() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [accountType, setAccountType] = useState('Checking');
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.id) {
      fetchAccount();
    }
  }, [user?.id]);

  const fetchAccount = async () => {
    try {
      console.log('Fetching account for userId:', user?.id);
      
      if (!user?.id) {
        console.error('User ID not found');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `http://localhost:5000/api/user/account?userId=${user.id}`
      );
      console.log('Account response:', response.data);
      
      if (response.data.account) {
        setAccount(response.data.account);
        setShowForm(false);
      }
    } catch (err) {
      console.error('Failed to fetch account - Full error:', err);
      console.error('Error response:', err.response);
      
      // 404 is not an error - it just means user needs to create an account
      if (err.response?.status === 404) {
        console.log('No account found - showing create form');
        setAccount(null);
        setShowForm(true);
      } else if (err.message === 'Network Error' || !err.response) {
        console.error('Network error - backend may not be running');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await axios.post(
        'http://localhost:5000/api/auth/create-account',
        {
          userId: user.id,
          accountType: accountType,
        }
      );
      setAccount(response.data.account);
      setShowForm(false);
      setAccountType('Checking');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="accounts-container">
      <div className="accounts-header">
        <h1>Bank Accounts</h1>
        <p>Manage and view your bank accounts</p>
      </div>

      {loading ? (
        <div className="loading">Loading accounts...</div>
      ) : account ? (
        <div className="accounts-grid">
          <div className="account-section">
            <h2>Primary Account</h2>
            <AccountCard account={account} />

            <div className="account-details">
              <h3>Account Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Account Number</label>
                  <p className="account-number">{account.account_number}</p>
                  <small>Full account number</small>
                </div>
                <div className="detail-item">
                  <label>Account Type</label>
                  <p>{account.account_type}</p>
                </div>
                <div className="detail-item">
                  <label>Currency</label>
                  <p>{account.currency}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p><span className="status-active">Active</span></p>
                </div>
                <div className="detail-item">
                  <label>Created</label>
                  <p>{new Date(account.created_at).toLocaleDateString()}</p>
                </div>
                <div className="detail-item">
                  <label>Last Updated</label>
                  <p>{new Date(account.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="account-actions">
              <button className="action-btn primary">
                <span>💳</span> Card Management
              </button>
              <button className="action-btn">
                <span>🔐</span> Security Settings
              </button>
              <button className="action-btn">
                <span>📋</span> Account Statement
              </button>
              <button className="action-btn">
                <span>⚙️</span> Account Settings
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-account">
          <div className="no-account-icon">🏦</div>
          <h2>No Account Found</h2>
          <p>Create your first bank account to get started with online banking</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setShowForm(true)}
          >
            Create Account
          </button>
        </div>
      )}

      {showForm && !account && (
        <div className="create-account-form">
          <div className="form-card">
            <h2>Create Bank Account</h2>
            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label htmlFor="accountType">Account Type</label>
                <select
                  id="accountType"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <option value="Checking">Checking Account</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Business">Business Account</option>
                  <option value="Money Market">Money Market Account</option>
                </select>
              </div>

              <div className="form-info">
                <p>Your account will be set up with:</p>
                <ul>
                  <li>✓ Unique account number (with Luhn validation)</li>
                  <li>✓ Debit card eligibility</li>
                  <li>✓ Online banking access</li>
                  <li>✓ Mobile app support</li>
                </ul>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
