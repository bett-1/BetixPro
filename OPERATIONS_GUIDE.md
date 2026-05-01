# BetixPro: Professional Operations & Administrator Guide

This guide provides a comprehensive walkthrough for platform administrators and operators. It covers every module of the BetixPro administrative ecosystem, from day-to-day financial processing to advanced system configuration.

---

## 1. Dashboard & Platform Analytics
The **Admin Dashboard** is your central command center.
*   **Key Metrics**: Monitor total active users, betting volume, and platform revenue in real-time.
*   **Performance Trends**: View charts detailing transaction growth and sport category popularity.
*   **System Status**: Quick-glance indicators for API health, database connectivity, and maintenance mode status.

---

## 2. User Management & Compliance

### 2.1 Managing the User Directory
*   **Search & Filter**: Locate users by email, phone number, or account status.
*   **User Profiles**: Click on any user to view their:
    *   **Wallet Balance**: Current available funds.
    *   **Betting History**: A complete list of all placed, won, and lost bets.
    *   **Activity Logs**: Record of logins and sensitive account changes.
*   **Account Controls**: Admins can manually adjust account statuses (Active/Suspended) and provide specific reasons for bans.

### 2.2 Ban Appeals
When a user is suspended, they may submit an appeal.
*   **Review Process**: Access the "Appeals" module to read user justifications.
*   **Resolution**: Approve the appeal to instantly restore account access or reject it with a final administrative response.

---

## 3. Financial Operations

### 3.1 Processing Withdrawals
Withdrawals are the most critical daily task. The **Withdrawals Module** allows for precise control:
*   **Workflow**:
    1.  Filter by **"Pending"** to see new requests.
    2.  **Review**: Check the user's betting history and transaction patterns for potential fraud.
    3.  **Approve**: Click "Approve" to initiate an automated M-Pesa B2C disbursement.
    4.  **Reject**: If suspicious, click "Reject" and provide a reason. Funds are automatically returned to the user's wallet.
*   **Audit Tools**: View provider messages (e.g., M-Pesa response codes) and transaction references for every request.
*   **Reporting**: Use the **"Export CSV"** feature to download financial records for accounting.

### 3.2 Transaction Monitoring
*   **Global Ledger**: Monitor all deposits (M-Pesa STK/Paystack) and stakes in real-time.
*   **Reconciliation**: Use the unique transaction references to cross-match with payment gateway dashboards.

---

## 4. Sportsbook & Odds Management

### 4.1 Odds Synchronization
BetixPro integrates with **TheOddsAPI** for professional-grade data.
*   **API Logs**: Monitor the "Sync Logs" to ensure data is flowing correctly.
*   **Credit Management**: Track your API credit usage to prevent service interruptions.
*   **Manual Verification**: Admins can verify odds for specific high-profile events to ensure accuracy before they go live.

### 4.2 Custom Event Engine
For events not covered by APIs (e.g., local tournaments or custom specials):
1.  **Create Event**: Define the teams, start time, and category.
2.  **Define Markets**: Add markets (e.g., Match Winner, Total Points).
3.  **Set Odds**: Manually enter the decimal odds for each selection.
4.  **Settlement**: Once the event concludes, manually mark selections as **Win**, **Lose**, or **Void** to trigger automated bet payouts.

---

## 5. System Configuration & Settings

### 5.1 Financial Limits (User Defaults)
Located in **Settings > User Defaults**:
*   **Min/Max Deposit**: Control the floor and ceiling for incoming funds.
*   **Withdrawal Limits**: Set the minimum and maximum amount per request (Default Min: 100 KES).
*   **Daily Limits**: Cap the total transaction volume per user per day to mitigate risk.

### 5.2 Payment Gateway Configuration
#### M-Pesa (Safaricom)
*   **Credentials**: Configure Shortcodes, Consumer Keys, Secrets, and Online Passkeys.
*   **B2C Settings**: Enter Initiator names and Security Credentials for automated payouts.
*   **Auto-Approval**: Toggle automated withdrawal approval for amounts below a specific threshold.

#### Paystack
*   **Keys**: Manage Live Secret and Public keys.
*   **Webhooks**: Configure the Webhook Secret to ensure secure communication between Paystack and your server.

### 5.3 Risk Management
*   **Exposure Limits**: Set maximum payouts per bet and per day.
*   **Thresholds**: Configure "High Risk" bet amounts that trigger administrative alerts.
*   **Security**: Manage IP Whitelisting and Blacklisting for the admin portal.

---

## 6. Security & Support

### 6.1 Administrator Security
*   **Password Policy**: All admins must use complex passwords (10+ chars, symbols, uppercase).
*   **Two-Factor Authentication (2FA)**: Use the **Security Wizard** to enable TOTP (e.g., Google Authenticator) for your admin account.
*   **First-Time Login**: New admins are required to change their temporary passwords immediately upon first access.

### 6.2 Customer Communication
*   **Contact Messages**: Review and respond to inquiries submitted via the platform's contact form.
*   **Newsletter**: Manage the list of subscribers and export emails for marketing campaigns.

---

*This guide is updated as of May 2026. For technical issues beyond operational scope, contact the development team.*
