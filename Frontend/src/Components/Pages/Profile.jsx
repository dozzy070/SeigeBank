import React, { useState, useEffect } from 'react';
import api from '../../Utility/Api';
import '../styles/Profile.css';

export default function Profile() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.id) {
      fetchAccountInfo();
    }
  }, [user?.id]);

  const fetchAccountInfo = async () => {
    try {
      const response = await api.get(`/user/account?userId=${user.id}`);
      if (response.data.account) {
        setAccount(response.data.account);
      }
    } catch (err) {
      console.error('Failed to fetch account:', err);
    } finally {
      setLoading(false);
    }
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    const parts = accountNumber.split('-');
    return `${parts[0]}-****${parts[2]}`;
  };

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      {/* Personal Information Card */}
      <div className="profile-card">
        <h3>Personal Information</h3>
        <div className="profile-grid">
          <div className="profile-item">
            <label>Username</label>
            <p>{user?.username}</p>
          </div>
          <div className="profile-item">
            <label>Email Address</label>
            <p>{user?.email}</p>
          </div>
          <div className="profile-item">
            <label>Member Since</label>
            <p>February 2026</p>
          </div>
          <div className="profile-item">
            <label>Account Status</label>
            <p><span className="status-badge active">Active</span></p>
          </div>
        </div>
      </div>

      {/* Account Information Card */}
      {loading ? (
        <div className="profile-card loading">Loading account information...</div>
      ) : account ? (
        <div className="profile-card">
          <h3>Account Information</h3>
          <div className="profile-grid">
            <div className="profile-item">
              <label>Account Type</label>
              <p>{account.account_type}</p>
            </div>
            <div className="profile-item">
              <label>Account Number</label>
              <p className="account-number">{maskAccountNumber(account.account_number)}</p>
            </div>
            <div className="profile-item">
              <label>Currency</label>
              <p>{account.currency}</p>
            </div>
            <div className="profile-item">
              <label>Current Balance</label>
              <p className="balance">
                {account.currency === 'NGN' ? '₦' : '$'}
                {parseFloat(account.balance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="profile-item">
              <label>Account Created</label>
              <p>{new Date(account.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
            </div>
            <div className="profile-item">
              <label>Last Updated</label>
              <p>{new Date(account.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-card no-account">
          <p>No account found. Create one to get started!</p>
        </div>
      )}

      {/* Security Settings Card */}
      <div className="profile-card">
        <h3>Security Settings</h3>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Password</h4>
              <p>Last changed 2 months ago</p>
            </div>
            <button className="btn btn-outline">Change Password</button>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Two-Factor Authentication</h4>
              <p>Not enabled</p>
            </div>
            <button className="btn btn-outline">Enable 2FA</button>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Login History</h4>
              <p>View devices and locations</p>
            </div>
            <button className="btn btn-outline">View History</button>
          </div>
        </div>
      </div>
    </div>
  );
}
