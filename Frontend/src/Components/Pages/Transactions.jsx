import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Transactions.css';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user?.id]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/activities?userId=${user.id}&limit=50`
      );
      if (response.data.activities) {
        setTransactions(response.data.activities);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      // Fallback to demo data
      setTransactions([
        { id: 1, date: '2026-02-18', description: 'Transfer to John', amount: -5000, activity_type: 'transfer', status: 'completed' },
        { id: 2, date: '2026-02-17', description: 'Salary Deposit', amount: 200000, activity_type: 'deposit', status: 'completed' },
        { id: 3, date: '2026-02-16', description: 'Grocery Store', amount: -15000, activity_type: 'payment', status: 'completed' },
        { id: 4, date: '2026-02-15', description: 'Mobile Recharge', amount: -2500, activity_type: 'payment', status: 'completed' },
        { id: 5, date: '2026-02-14', description: 'Restaurant', amount: -8500, activity_type: 'payment', status: 'completed' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: '💰',
      withdrawal: '💸',
      transfer: '↔️',
      payment: '💳',
      account_opened: '🎉',
    };
    return icons[type] || '📌';
  };

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(tx => {
      if (filter === 'income') return tx.amount > 0;
      if (filter === 'expense') return tx.amount < 0;
      return true;
    });

  const totalIncome = transactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="transactions-container">
      <h1>Transaction History</h1>

      {/* Summary Cards */}
      <div className="txn-summary">
        <div className="summary-card income">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <label>Total Income</label>
            <h3>₦{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="summary-icon">📉</div>
          <div className="summary-content">
            <label>Total Expense</label>
            <h3>₦{Math.abs(totalExpense).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="summary-card transactions">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <label>Total Transactions</label>
            <h3>{transactions.length}</h3>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="txn-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Transactions
        </button>
        <button
          className={`filter-btn ${filter === 'income' ? 'active' : ''}`}
          onClick={() => setFilter('income')}
        >
          Income
        </button>
        <button
          className={`filter-btn ${filter === 'expense' ? 'active' : ''}`}
          onClick={() => setFilter('expense')}
        >
          Expenses
        </button>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="loading-message">Loading transactions...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No transactions found</p>
          <small>Start by making your first transaction</small>
        </div>
      ) : (
        <div className="txn-table-responsive">
          <table className="txn-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className={tx.amount < 0 ? 'expense-row' : 'income-row'}>
                  <td className="txn-type">
                    <span className="txn-icon">{getTransactionIcon(tx.activity_type)}</span>
                  </td>
                  <td className="txn-description">
                    <p className="txn-title">{tx.description || tx.activity_type}</p>
                    <p className="txn-category">{tx.activity_type.replace(/_/g, ' ')}</p>
                  </td>
                  <td className="txn-date">
                    {new Date(tx.timestamp || tx.date).toLocaleDateString('en-US', {
                      year: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="txn-amount">
                    <span className={tx.amount < 0 ? 'negative' : 'positive'}>
                      {tx.amount >= 0 ? '+' : ''}
                      ₦{Math.abs(tx.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                  <td className="txn-status">
                    <span className={`status-badge ${tx.status}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
