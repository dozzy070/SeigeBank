import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountCard from '../AccountCard';
import Activities from '../Activities';
import '../styles/Overview.css';

export default function Overview() {
  const [account, setAccount] = useState(null);
  const [stats, setStats] = useState({
    balance: 0,
    savings: 0,
    expenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.id) {
      fetchAccountData();
    }
  }, [user?.id]);

  const fetchAccountData = async () => {
    try {
      console.log('Fetching account for userId:', user?.id);
      
      if (!user?.id) {
        setError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      const accountResponse = await axios.get(
        `http://localhost:5000/api/user/account?userId=${user.id}`
      );

      console.log('Account response:', accountResponse.data);
      
      if (accountResponse.data.account) {
        setAccount(accountResponse.data.account);
        setStats({
          balance: parseFloat(accountResponse.data.account.balance),
          savings: parseFloat(accountResponse.data.account.balance) * 0.4,
          expenses: parseFloat(accountResponse.data.account.balance) * 0.3,
        });
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch account - Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      
      // 404 means no account yet - this is not an error, user just needs to create one
      if (err.response?.status === 404) {
        console.log('No account found (404) - User needs to create one');
        setAccount(null);
        setError(null);
      } else if (err.message === 'Network Error' || !err.response) {
        setError('Could not connect to server. Make sure backend is running on port 5000.');
      } else {
        setError(err.response?.data?.error || 'Could not load account data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/api/auth/create-account',
        {
          userId: user.id,
          accountType: 'Checking',
        }
      );
      setAccount(response.data.account);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = () => '₦';

  return (
    <div className="overview-container">
      {/* Header Section */}
      <div className="overview-header">
        <div>
          <h1>Welcome, {user?.username}!</h1>
          <p>Manage your finances with ease</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading your account...</div>
      ) : !account ? (
        <div className="no-account-section">
          <div className="no-account-card">
            <div className="no-account-icon">🏦</div>
            <h3>Create Your Bank Account</h3>
            <p>Get started by creating your professional banking account</p>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleCreateAccount}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Account Card */}
          <div className="account-section">
            <h2>Your Account</h2>
            <AccountCard account={account} />
          </div>

          {/* Quick Stats */}
          <div className="stats-section">
            <div className="stat-card primary">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <label>Total Balance</label>
                <h3>
                  {getCurrencySymbol()}
                  {stats.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">💵</div>
              <div className="stat-content">
                <label>Savings</label>
                <h3>
                  {getCurrencySymbol()}
                  {stats.savings.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <label>Spending</label>
                <h3>
                  {getCurrencySymbol()}
                  {stats.expenses.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="action-btn">
              <span className="action-icon">➕</span>
              <span>Add Money</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">💸</span>
              <span>Send Money</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📱</span>
              <span>Bill Payment</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">⋮</span>
              <span>More</span>
            </button>
          </div>

          {/* Activities */}
          <Activities userId={user?.id} accountId={account?.id} />
        </>
      )}
    </div>
  );
}
