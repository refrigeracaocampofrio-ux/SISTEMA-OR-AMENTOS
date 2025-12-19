# Code Analysis Report

**Files scanned:** 40  
**ESLint errors:** 0  
**ESLint warnings:** 12

## ESLint Details
### backend\middleware\auth.js
- [no-unused-vars] 'err' is defined but never used. (warn)

### backend\routes\auth.js
- [no-unused-vars] 'err' is defined but never used. (warn)

### backend\scripts\clear_test_data.js
- [no-unused-vars] 'e' is defined but never used. (warn)
- [no-unused-vars] 'e' is defined but never used. (warn)

### backend\scripts\create_and_init_db.js
- [no-unused-vars] 'createUserSql' is assigned a value but never used. Allowed unused vars must match /^_/u. (warn)

### backend\scripts\get_gmail_oauth.js
- [no-unused-vars] 'e' is defined but never used. (warn)

### backend\server.js
- [no-unused-vars] 'err' is defined but never used. (warn)

### scripts\analyze-report.js
- [no-unused-vars] 'e' is defined but never used. (warn)

### scripts\code-fix.js
- [no-unused-vars] 'err' is defined but never used. (warn)
- [no-unused-vars] 'err' is defined but never used. (warn)
- [no-unused-vars] 'e' is defined but never used. (warn)

### scripts\text-review.js
- [no-unused-vars] 'e' is defined but never used. (warn)
## MySQL Findings
- backend\scripts\add_password_column.js: No placeholders detected in SQL queries
- backend\scripts\clear_test_data.js: No placeholders detected in SQL queries
- backend\scripts\create_and_init_db.js: No placeholders detected in SQL queries
- backend\scripts\init_db.js: No placeholders detected in SQL queries
## Nodemailer Findings
- No transport issues detected
## .env Check
- backend/.env present
- Potentially sensitive keys set: DB_PASS, EMAIL_PASS, JWT_SECRET
