# BetixPro: Comprehensive Admin Operations Guide

This guide is a deep-dive manual for platform administrators. It is organized by the navigation sections found in the admin dashboard, providing detailed instructions on how to use every feature you will interact with.

---

## 1. Dashboard (The Command Center)
The **Dashboard** is the first page you see upon login. It provides a real-time pulse of the platform.

*   **Real-Time Analytics Cards**:
    *   **Users**: Total registered users and growth trends.
    *   **Total Stakes**: The total value of all bets placed.
    *   **Revenue/GGR**: The platform's Gross Gaming Revenue.
    *   **Pending Withdrawals**: High-priority count of requests needing attention.
*   **System Health Indicators**: Monitor the status of the Odds API and database connectivity.
*   **Recent Activity**: A live feed of the latest bets and deposits.

---

## 2. Users (Customer Management)
The **Users** page allows you to manage the lifecycle of every customer on the platform.

*   **User Directory**: Search for users by email, phone number, or ID.
*   **Profile Deep-Dive**: Clicking a user opens their full administrative profile:
    *   **Financial Overview**: Current wallet balance and total life-time deposit/withdrawal stats.
    *   **Betting History**: View every bet the user has ever placed, including active and settled ones.
    *   **Account Status**: Toggle between **Active** and **Suspended**. 
    *   **Ban Appeals**: If a user is banned, their appeal (if submitted) will appear here for your review and response.
*   **Manual Adjustments**: (If enabled) Adjust user balances or reset passwords.

---

## 3. Bets (Market Monitoring)
The **Bets** page is where you monitor all wagering activity.

*   **Bet List**: A real-time view of all bets placed across the platform.
*   **Filtering**: Filter bets by status (Pending, Won, Lost, Void) or by specific sports.
*   **Audit Logs**: Click any bet to see its "Audit Trail"—this includes when it was placed, the IP address used, and any status changes made by the system or admins.

---

## 4. Payments (Deposit Tracking)
The **Payments** page (Transactions) tracks all funds entering the platform.

*   **Deposit Ledger**: View all successful and failed deposit attempts.
*   **Provider Details**: See whether a deposit came through M-Pesa or Paystack, along with the provider's unique reference number.
*   **Reconciliation**: Use this page to confirm that funds have actually hit your business account by matching the "Provider Reference" found here.

---

## 5. Withdrawals (Payout Management)
The **Withdrawals** page is arguably the most critical operational area.

*   **Processing Requests**:
    *   **Pending Tab**: Review new requests. Ensure the user's betting activity is legitimate before approving.
    *   **Approve Button**: Triggers the automated M-Pesa B2C payout. Ensure your M-Pesa B2C balance is sufficient.
    *   **Reject Button**: Prompts you for a reason (e.g., "Inconsistent Betting Pattern"). The funds are immediately returned to the user's wallet.
*   **Export CSV**: Generate a spreadsheet of all withdrawals for monthly financial reconciliation.
*   **Audio Alerts**: The platform will play a notification sound whenever a new withdrawal request is received (can be configured in Settings).

---

## 6. Events (Custom Market Engine)
The **Events** page allows you to create betting opportunities that aren't covered by our automated API.

*   **Custom Event Creation**:
    1.  Click "New Event".
    2.  Set the **Teams/Competitors**, **Category** (Football, Politics, etc.), and **Start Time**.
*   **Market Management**: Add markets (e.g., "Winner", "Total Goals").
*   **Manual Settlement**: Once the event is over, you MUST come here to mark the winning selection. This will automatically trigger payouts to all winning bettors.

---

## 7. Odds (Data Feed Management)
The **Odds** page manages the connection to external sports data providers.

*   **API Sync Logs**: View a history of data refreshes. If the odds on the site look "stale," check these logs for errors.
*   **Credit Monitor**: Displays how many "credits" remain on your Odds API plan.
*   **House Margin**: Adjust the "House Margin" to control the profitability of the odds displayed to users.

---

## 8. Risk (Security & Fraud)
The **Risk** page alerts you to suspicious activity.

*   **Automated Alerts**: The system flags:
    *   **High-Risk Bets**: Stakes exceeding your configured threshold.
    *   **Suspicious Patterns**: Rapid betting or unusual success rates.
    *   **Exposure Limits**: When a single match has too much total stake, potentially risking a large payout.
*   **Resolution**: Mark alerts as "Reviewed" or "Resolved" after taking action (like suspending a user).

---

## 9. Analytics & Reports
The **Analytics** and **Reports** pages turn data into insights.

*   **Financial Reports**: Download PDF or CSV summaries of daily, weekly, or monthly performance.
*   **User Growth**: Visualize how many new users are joining and their retention rates.
*   **Category Performance**: See which sports are generating the most volume.

---

## 10. Messages & Newsletter
*   **Messages**: An inbox for all "Contact Us" submissions from users. You can read, tag, and mark messages as resolved.
*   **Newsletter**: Manage your email subscriber list. Export the list for use in marketing tools or send platform-wide announcements.

---

## 11. Security (Admin Protection)
The **Security** page protects the administrative side of the platform.

*   **Two-Factor Authentication (2FA)**: Admins should use this to link a mobile authenticator app.
*   **Audit Trail**: A log of all actions taken by administrators (e.g., who changed a user's balance or updated a system setting).

---

## 12. Settings (Global Configuration)
The **Settings** page is the "brain" of the platform.

*   **Platform Info**: Change the site name, support email, and contact info.
*   **Transaction Limits**: Set the minimum and maximum amounts for deposits, withdrawals, and individual bets.
*   **Payment Credentials**: Update M-Pesa Shortcodes, API Keys, and Paystack Secrets directly—no code changes required.
*   **KYC Rules**: Toggle whether users must verify their ID before withdrawing.

---

*This guide is designed for daily operational use. If you encounter an error message not covered here, please contact technical support.*
