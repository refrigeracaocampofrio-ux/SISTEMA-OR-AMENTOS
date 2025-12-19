-- Create table to store OAuth credentials for Gmail provider
CREATE TABLE IF NOT EXISTS email_credentials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expiry_date BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_provider_email (provider, user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
