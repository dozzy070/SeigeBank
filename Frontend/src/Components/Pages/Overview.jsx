import React, { useState, useEffect } from 'react';
import api from '../../Utility/Api';
import AccountCard from '../AccountCard';
import Activities from '../Activities';
import '../styles/Overview.css';

export default function Overview() {
  const [account, setAccount] = useState(null);
  const [stats, setStats] = useState({ balance: 0, savings: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.id) fetchAccountData();
  }, [user?.id]);

  // -----------------------------
  // Fetch Account Data
  // -----------------------------
  const fetchAccountData = async () => {
    try {
      console.log('Fetching account for userId:', user?.id);
      if (!user?.id) {
        setError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      const accountResponse = await api.get(`/user/account?userId=${user.id}`);
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
      console.error('Failed to fetch account:', err);
      if (err.response?.status === 404) {
        setAccount(null);
        setError(null);
      } else if (!err.response) {
        setError('Could not connect to server. Make sure backend is running on port 5000.');
      } else {
        setError(err.response?.data?.error || 'Could not load account data');
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Create Account
  // -----------------------------
  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/create-account', {
        userId: user.id,
        accountType: 'Checking',
      });
      setAccount(response.data.account);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Add Money
  // -----------------------------
  const handleAddMoney = async () => {
    const amount = prompt("Enter amount to add:");
    if (!amount || isNaN(amount)) return alert("Please enter a valid number");

    try {
      setLoading(true);
      await api.post("/transactions/deposit", {
        accountId: account.id,
        amount: parseFloat(amount),
      });
      alert("Money added successfully!");
      fetchAccountData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add money");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Send Money
  // -----------------------------
  const handleSendMoney = async () => {
    const receiverAccount = prompt("Enter receiver account ID:");
    const amount = prompt("Enter amount to send:");
    if (!receiverAccount || !amount || isNaN(amount)) return alert("Invalid input");

    try {
      setLoading(true);
      await api.post("/transactions/transfer", {
        senderAccountId: account.id,
        receiverAccountId: receiverAccount,
        amount: parseFloat(amount),
      });
      alert("Transfer successful!");
      fetchAccountData();
    } catch (err) {
      alert(err.response?.data?.error || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Bill Payment
  // -----------------------------
  const handleBillPayment = async () => {
    const billType = prompt("Enter bill type (e.g., Electricity, Internet):");
    const amount = prompt("Enter amount:");
    if (!billType || !amount || isNaN(amount)) return alert("Invalid input");

    try {
      setLoading(true);
      await api.post("/transactions/bill-payment", {
        accountId: account.id,
        billType,
        amount: parseFloat(amount),
      });
      alert("Bill paid successfully!");
      fetchAccountData();
    } catch (err) {
      alert(err.response?.data?.error || "Bill payment failed");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // More
  // -----------------------------
  const handleMore = () => {
    alert("More features coming soon 🚀");
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
                  {stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">💵</div>
              <div className="stat-content">
                <label>Savings</label>
                <h3>
                  {getCurrencySymbol()}
                  {stats.savings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <label>Spending</label>
                <h3>
                  {getCurrencySymbol()}
                  {stats.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="action-btn" onClick={handleAddMoney}>
              <span className="action-icon">➕</span>
              <span>Add Money</span>
            </button>
            <button className="action-btn" onClick={handleSendMoney}>
              <span className="action-icon">💸</span>
              <span>Send Money</span>
            </button>
            <button className="action-btn" onClick={handleBillPayment}>
              <span className="action-icon">📱</span>
              <span>Bill Payment</span>
            </button>
            <button className="action-btn" onClick={handleMore}>
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