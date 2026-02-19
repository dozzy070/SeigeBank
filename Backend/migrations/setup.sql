-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  account_number VARCHAR(20) NOT NULL UNIQUE,
  account_type VARCHAR(50) DEFAULT 'Checking',
  balance DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(5) DEFAULT 'NGN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  activity_type VARCHAR(50),
  description TEXT,
  amount DECIMAL(15, 2),
  balance_after DECIMAL(15, 2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'completed',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_user_accounts ON accounts(user_id);
CREATE INDEX idx_user_activities ON activities(user_id);
CREATE INDEX idx_account_activities ON activities(account_id);
CREATE INDEX idx_activity_timestamp ON activities(timestamp DESC);
