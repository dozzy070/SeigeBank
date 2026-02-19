import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/Activities.css';

export default function Activities({ userId, accountId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/activities?userId=${userId}&limit=10`
      );

      if (response.data.activities) {
        setActivities(response.data.activities);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      deposit: '💰',
      withdrawal: '💸',
      transfer: '↔️',
      payment: '💳',
      account_opened: '🎉',
      login: '🔐',
    };
    return icons[type] || '📌';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getCurrencySymbol = (currency = 'NGN') => {
    const symbols = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    return symbols[currency] || currency;
  };

  if (loading) {
    return <div className="activities-loading">Loading activities...</div>;
  }

  return (
    <div className="activities-container">
      <div className="activities-header">
        <h3>Recent Activities</h3>
        <a href="#" className="view-all">View All</a>
      </div>

      {activities.length === 0 ? (
        <div className="activities-empty">
          <div className="empty-icon">📟</div>
          <p>No activities yet</p>
          <small>Your transactions will appear here</small>
        </div>
      ) : (
        <div className="activities-list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.activity_type)}
              </div>

              <div className="activity-details">
                <div className="activity-title">
                  {activity.description}
                </div>
                <div className="activity-type">
                  {activity.activity_type.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="activity-meta">
                <div className="activity-amount">
                  <span className={activity.amount < 0 ? 'negative' : 'positive'}>
                    {activity.amount >= 0 ? '+' : ''}
                    {getCurrencySymbol()}
                    {Math.abs(activity.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="activity-date">
                  {formatDate(activity.timestamp)}
                </div>
                <div className={`activity-status ${activity.status}`}>
                  {activity.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
