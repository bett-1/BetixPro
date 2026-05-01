# BetixPro: Comprehensive Admin Operations Guide

This guide is the  manual for BetixPro operations. It is intended to be updated as the platform evolves.

---

## Table of Contents
1.  [Dashboard (The Intelligence Center)](#1-dashboard-the-intelligence-center)
2.  [User Management (CRM)](#2-user-management-crm)
3.  [Betting & Market Operations](#3-betting--market-operations)
4.  [Financial Operations (Payments & Withdrawals)](#4-financial-operations-payments--withdrawals)
5.  [Market & Event Management](#5-market--event-management)
6.  [Risk Management & Fraud Prevention](#6-risk-management--fraud-prevention)
7.  [Administrative Security & Account Protection](#7-administrative-security--account-protection)
8.  [Communications (Messages & Newsletter)](#8-communications-messages--newsletter)
9.  [System Intelligence (Analytics & Reports)](#9-system-intelligence-analytics--reports)
10. [Global Platform Configuration (Settings)](#10-global-platform-configuration-settings)
11. [Personal Preferences (Quick Settings)](#11-personal-preferences-quick-settings)

---

## 1. Dashboard (The Intelligence Center)
The **Dashboard** is the administrative command center, providing real-time visibility into the platform's health and performance.

### **Real-Time Analytics Grid**
*   **Active Users**: Displays current registered users and a percentage growth indicator.
*   **Total Stakes**: The cumulative value of all wagers placed in the current period.
*   **Gross Gaming Revenue (GGR)**: Real-time calculation of platform profitability (Stakes - Payouts).
*   **Pending Withdrawals**: High-priority counter indicating requests requiring immediate approval.

### **System Vital Indicators**
*   **Odds API Status**: Green indicates a healthy connection to sports data providers. Amber/Red indicates sync issues.
*   **Database Latency**: Monitors the responsiveness of the core system.
*   **Activity Feed**: A scrolling live ledger of the latest bets, deposits, and new user registrations.

---

## 2. User Management (CRM)
Manage the full lifecycle of platform customers and resolve account-level issues.

### **User Directory**
*   **Search**: Filter by UUID, Email, Phone Number, or Full Name.
*   **Status Badges**: Instantly see who is **Active**, **Suspended**, or **Pending Verification**.

### **The User Profile Modal (Deep-Dive)**
Clicking any user opens the comprehensive administrative profile:
*   **Financial Summary**: Life-time value (LTV), current wallet balance, and total withdrawal history.
*   **Manual Adjustments**: Administrators can manually "Credit" or "Debit" a user's wallet. *Every manual adjustment is logged in the Audit Trail.*
*   **Betting History**: A searchable list of every bet placed by the user, including odds, stakes, and settlement status.
*   **Account Controls**:
    *   **Suspend Account**: Blocks all betting and withdrawal activity.
    *   **Ban Reason**: When banning, you MUST record a reason for future reference and for the user to see if they appeal.
    *   **Reset Password**: Triggers a secure password reset link to the user's email.

### **Ban Appeal Resolution**
Found under **Users > Appeals**, this module manages users contesting their suspension.
1.  **Review**: Read the user's submission and compare it against their ban reason and betting logs.
2.  **Respond**: You must provide a response of at least 10 characters.
3.  **Action**: 
    *   **Approve**: Lifts the ban immediately and notifies the user.
    *   **Reject**: Maintains the ban and sends your explanation to the user.

---

## 3. Betting & Market Operations
Monitor the platform's primary revenue driver: the betting markets.

### **Live Bet Monitoring**
*   **Ledger**: A real-time view of all slips. Click any slip to view the specific "Bet Audit Trail."
*   **Audit Trail**: Shows the exact timestamp of placement, the user's IP address, the device used, and the system settlement logic applied.
*   **Voiding**: Admins can "Void" a bet in case of verified technical errors or match cancellations. This returns the stake to the user's wallet.

---

## 4. Financial Operations (Payments & Withdrawals)
Managing the flow of capital is the most sensitive administrative task.

### **Deposit Ledger (Transactions)**
*   **Provider Reference**: Every deposit includes a unique ID from M-Pesa or Paystack. Use this to reconcile funds in your business dashboards.
*   **Status Tracking**: Monitor "Initiated" deposits to identify friction points in the user checkout flow.

### **Withdrawal Processing Flow**
*   **Pending Queue**: Review requests for "Abnormal Betting Patterns" before approval.
*   **Automated Payout (M-Pesa B2C)**: 
    *   Clicking **Approve** triggers a real-time disbursement via the M-Pesa B2C API.
    *   The system checks your B2C balance before processing.
*   **Manual Rejection**: If a request is rejected, funds are instantly returned to the user's wallet.
*   **Approval Thresholds**: Requests below the "Auto-Approval Threshold" (set in Settings) can be processed automatically by the system.

---

## 5. Market & Event Management
Control what users can bet on, including custom markets.

### **Sport Categories**
*   Manage the list of available sports (Football, Basketball, Tennis, etc.).
*   Toggle visibility: Hide sports during the off-season to clean up the user interface.

### **Custom Events Manager**
For events not covered by the automated Odds API (e.g., local tournaments, politics, reality TV):
1.  **Create Event**: Define the category, participants, and start time.
2.  **Add Markets**: Create options like "Team A Win", "Draw", or "Team B Win".
3.  **Manual Settlement**: Once the event concludes, an admin **MUST** come here to select the winner. This triggers the platform-wide payout logic.

### **Odds API Management**
*   **Sync Logs**: Monitor when the last data refresh occurred.
*   **House Margin**: Adjust the percentage of profit the house takes on every odd. (Higher margin = lower odds for users).

---

## 6. Risk Management & Fraud Prevention
The **Risk** module protects the platform from heavy losses and bad actors.

### **Automated Risk Alerts**
The system flags activity based on thresholds defined in Settings:
*   **High-Stake Alerts**: Any bet exceeding the "Risk Threshold."
*   **Success Spikes**: Users with an unusually high win rate over a short period.
*   **Market Exposure**: Alerts when the total potential payout on a single match exceeds platform limits.

---

## 7. Administrative Security & Account Protection
Protecting the admin panel is critical to platform integrity.

### **The Security Wizard**
Found in **Settings > Security**, this wizard guides admins through:
*   **Two-Factor Authentication (2FA)**: Mandatory setup using Microsoft Authenticator.
    *   **Step 1**: Install the app.
    *   **Step 2**: Scan the secure QR code.
    *   **Step 3**: Verify the 6-digit TOTP token to activate protection.
*   **Disabling 2FA**: Requires the current 6-digit code for verification.

### **Password Management**
*   **Password Complexity**: Must be 10+ characters, including Uppercase, Lowercase, Number, and Special Character.
*   **Forced Change**: New admin accounts are forced to change their temporary password upon first login before accessing any data.

---

## 8. Communications (Messages & Newsletter)
### **Inbound Messages**
*   An inbox for all user inquiries via the "Contact Us" form.
*   **Thread Status**: Mark as "In Progress," "Resolved," or "Spam."

### **Newsletter Engine**
*   **Subscriber List**: Export your email database for external marketing.
*   **Announcements**: Send platform-wide emails (e.g., maintenance alerts or bonus offers) directly from the dashboard.

---

## 9. System Intelligence (Analytics & Reports)
### **Financial Reporting**
*   Generate **Daily**, **Weekly**, and **Monthly** P&L reports.
*   **Export formats**: PDF for board meetings, CSV for accounting software.

### **Behavioral Analytics**
*   **Churn Rate**: Track how many users stop betting.
*   **Peak Activity**: Identify the hours of the day with the highest traffic to schedule maintenance during lulls.

---

## 10. Global Platform Configuration (Settings)
The "Brain" of BetixPro. Settings are grouped into logical modals.

### **Platform & Financial Settings Modal**
*   **Min/Max Deposit**: The floor and ceiling for single transactions.
*   **Withdrawal Limits**: Daily and per-transaction payout caps.
*   **Max Active Bets**: Limit how many open slips a single user can have.
*   **KYC Requirements**: Toggle whether ID verification is mandatory before withdrawal.

### **M-Pesa Integration Modal**
*   **Credentials**: Shortcode, Consumer Key, Consumer Secret, and Online Passkey.
*   **B2C Config**: Initiator Name, Security Credential, and Result/Timeout URLs.
*   **STK Result Callback**: The URL where Safaricom sends payment confirmations.
*   **Platform Fee**: Percentage charged to the user on every transaction.

### **Paystack Gateway Modal**
*   **API Keys**: Live Secret and Public keys.
*   **Webhooks**: Configure the Webhook Secret and Merchant Callback URL to ensure deposits are credited instantly.

---

## 11. Personal Preferences (Quick Settings)
These settings are **unique to your admin account** and do not affect the platform globally.

*   **Withdrawal Audio Alerts**: Enable/Disable the notification sound for new withdrawal requests.
*   **Tone Selection**: Choose from several alert sounds
*   **Volume & Visibility**: Adjust volume and choose if sounds should play when the tab is in the background.

---

*For technical emergencies or bugs not covered in this guide, contact the Platform Engineering Team immediately.*
