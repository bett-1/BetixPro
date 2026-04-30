# BetixPro — Admin Operations Guide

> **This guide is written for the platform operator. No technical knowledge is required.**
> Read through each section carefully before operating the platform for the first time.

---

## Table of Contents

1. [Logging In](#1-logging-in)
2. [The Dashboard — Your Home Screen](#2-the-dashboard--your-home-screen)
3. [Managing Users](#3-managing-users)
4. [Handling Withdrawals](#4-handling-withdrawals)
5. [Viewing All Transactions](#5-viewing-all-transactions)
6. [Managing Bets](#6-managing-bets)
7. [Events — Sports & Custom](#7-events--sports--custom)
8. [Odds Management](#8-odds-management)
9. [Risk & Fraud Alerts](#9-risk--fraud-alerts)
10. [Analytics & Reports](#10-analytics--reports)
11. [Ban Appeals](#11-ban-appeals)
12. [Contact Messages](#12-contact-messages)
13. [Newsletter Subscribers](#13-newsletter-subscribers)
14. [Platform Settings](#14-platform-settings)
15. [Security Center (Admin Profile)](#15-security-center-admin-profile)
16. [Quick Settings](#16-quick-settings)
17. [Daily Checklist](#17-daily-checklist)
18. [Common Situations & What to Do](#18-common-situations--what-to-do)

---

## 1. Logging In

1. Open your browser and go to your admin URL (e.g. `https://betixpro.com/admin` or the local address your developer gave you).
2. Enter your **email address** and **password**.
3. Because your account has **Two-Factor Authentication (2FA)** enabled, you will be sent a one-time code after entering your password. Enter that code to complete login.

> ⚠️ **Never share your login credentials or 2FA codes with anyone.**

---

## 2. The Dashboard — Your Home Screen

The Dashboard is the first page you see after logging in. It gives you a real-time snapshot of everything happening on the platform.

### What you'll see

| Section | What it tells you |
|---|---|
| **Key Metrics Cards** | Total users, active bets, money deposited, money withdrawn, and more — updated every 10 seconds automatically |
| **Pending Withdrawal Alert** | A yellow/amber banner appears at the top if there are withdrawal requests waiting for your review. Click **"Review Requests"** to go handle them. |
| **Events Needing Settlement** | A green banner appears when a custom event has ended and you still need to declare results. Click **"Settle Events"** to go do that. |
| **Deposit vs Withdrawal Trend Chart** | A bar chart showing money in vs. money out over the past week, month, or 6 months. Use the dropdown button to change the time period. |
| **User Registration Trend Chart** | Shows how many new users signed up in a chosen period. |
| **Recent Activity Table** | The latest deposits and withdrawals on the platform. Click any row to see full details. |

### Tips
- The page **refreshes automatically** every 10 seconds — you do not need to manually reload.
- Click the **⋮ (three dots)** at the end of any transaction row for quick actions: view details, open the user's profile, or jump to the withdrawal review page.
- Click **"Export"** above the Recent Activity table to download it as a spreadsheet (CSV file).

---

## 3. Managing Users

Go to: **Admin → Users**

This section shows every registered user on the platform.

### What you can do

- **Search for a user** — Use the search bar to find a user by name, email, or phone number.
- **View a user's profile** — Click on a user's row to open their full profile, including their wallet balance, bet history, and transaction history.
- **Suspend a user** — If a user is breaking rules or you suspect fraud, you can suspend their account. A suspended user cannot log in or place bets.
- **Unsuspend a user** — You can reactivate a suspended account at any time.
- **Ban a user** — A harder action than suspension. A banned user's account is permanently blocked. You must give a reason when banning.
- **Reset a user's password** — You can trigger a password reset for any user.
- **Adjust a user's wallet balance** — You can manually add or remove funds from a user's wallet if needed (e.g., to correct an error). Always add a reason.

> ℹ️ All significant actions on a user's account are logged automatically for audit purposes.

---

## 4. Handling Withdrawals

Go to: **Admin → Withdrawals**

This is one of the most important parts of your daily work. When a user requests to withdraw money, it comes here first for your review and approval.

### Understanding the status tabs

Use the dropdown at the top right to switch between:

| Status | What it means |
|---|---|
| **Pending** | New requests waiting for you to approve or reject |
| **Processing** | Requests you've approved that are being sent via M-Pesa or another method |
| **Completed** | Successfully paid out |
| **Failed** | Payment attempt failed (M-Pesa error, wrong number, etc.) |

### How to process a withdrawal

1. Make sure you are on the **Pending** tab.
2. Click on any withdrawal row to open its details panel.
3. Review:
   - **User phone number** — Is this the right person?
   - **Withdrawal phone** — Where the money will be sent. Confirm it looks correct.
   - **Amount**, **Fee**, and **Total Debit** (amount + fee deducted from their wallet).
4. Choose one of two actions:
   - ✅ **Approve** — Click the green "Approve" button. The payout will be initiated automatically via M-Pesa.
   - ❌ **Reject** — Optionally type a reason in the "Rejection Reason" box, then click the red "Reject" button. The funds will be returned to the user's wallet.

> ⚠️ **Always check the withdrawal phone number carefully before approving.** Once approved, the payout is sent immediately.

### Tips
- If the dashboard shows a pending withdrawal alert, go here first thing.
- Click **"Export CSV"** to download the current list for your records.

---

## 5. Viewing All Transactions

Go to: **Admin → Transactions**

This is the complete financial record of the platform — every deposit, withdrawal, bet stake, win payout, and refund.

### What you can do
- **Filter by type** — View only deposits, only withdrawals, etc.
- **Filter by status** — View only completed, pending, or failed transactions.
- **Search by reference or phone** — Find a specific transaction quickly.
- **Click any row** to view the full details, including the M-Pesa code or payment reference.
- **Export to CSV** — Download your records for accounting.

---

## 6. Managing Bets

Go to: **Admin → Bets**

This page shows every bet placed on the platform.

### Bet statuses

| Status | Meaning |
|---|---|
| **Pending** | The event hasn't finished yet. The bet is active. |
| **Won** | The user won. Winnings have been credited to their wallet. |
| **Lost** | The user lost. Their stake was collected. |
| **Void** | The bet was cancelled (e.g., event cancelled). The stake was refunded. |

### What you can do
- **Search** for a bet by user, event, or bet code.
- **Filter** by status (Pending, Won, Lost, Void).
- **View bet details** — Click any row to see the full breakdown: stake, odds, potential payout, event, market, and selection.
- **Void/Cancel a bet** — If there was an error or the event was cancelled, you can void a bet. The user's stake will be refunded.

---

## 7. Events — Sports & Custom

Go to: **Admin → Events**

There are two types of events on the platform: **Sports Events** (fetched automatically from external sports data) and **Custom Events** (events you create manually).

### Sports Events tab
- These come in automatically from The Odds API.
- You can **activate** or **deactivate** individual events — only active events are shown to users.
- You can mark events as **Featured** so they appear prominently on the homepage.
- Scores and results are updated automatically when an event finishes.

### Custom Events tab
This is where you create your own events — for example, local leagues or special promotions.

#### How to create a custom event:
1. Click **"New Event"** or **"Create Custom Event"**.
2. Fill in:
   - **Title** (e.g., "AFC vs Gor Mahia")
   - **Home Team** and **Away Team**
   - **Category** (e.g., Football, Basketball)
   - **League name**
   - **Start Time** — The date and time the event begins.
3. Click **Save**. The event is created as a **Draft**.
4. Add **Markets** (the things people can bet on, e.g., "Full Time Result") and **Selections** (the options, e.g., "Home Win", "Draw", "Away Win") with their odds.
5. When you are ready for users to see and bet on it, click **"Publish"**.

#### How to settle a custom event (declare results):
When the event finishes:
1. Go to the **Custom Events** tab.
2. Find the finished event and open it.
3. Change the event status to **Finished**.
4. For each market, mark which selection **Won** and which ones **Lost** (or **Void** if the market is cancelled).
5. Click **"Settle"** — the system will automatically pay out winning bets and notify users.

> ℹ️ The dashboard will show a green alert when events need settling as a reminder.

---

## 8. Odds Management

Go to: **Admin → Odds**

This section lets you view and adjust the odds being shown to users for sports events.

### Key concepts

- **Raw Odds** — The original odds from the data provider.
- **Display Odds** — The odds users actually see. These can be slightly lower than raw odds, as the difference represents the platform's margin/profit.
- **House Margin** — A percentage that is applied to reduce the payout ratio. This is how the platform makes money on each bet.

### What you can do
- **View current odds** for any active event.
- **Edit displayed odds** for any market — click the odds value and type a new number.
- **Show or hide a market** — Toggle the visibility of specific markets so users cannot bet on them.
- **Set a house margin** for an event.

> ⚠️ Be careful when editing odds. Very high odds mean large potential payouts to users.

---

## 9. Risk & Fraud Alerts

Go to: **Admin → Risk**

The system automatically monitors user behaviour and raises alerts when something unusual is detected.

### Types of alerts

| Alert Type | What it means |
|---|---|
| **High Risk Bet** | A single bet with a very large stake. |
| **Exposure Limit Exceeded** | The platform's maximum liability for an event is being approached. |
| **Suspicious Pattern** | A user is betting in an unusual way (e.g., very rapid bets). |
| **Rapid Account Activity** | A new account making many transactions very quickly. |
| **Duplicate Account** | The system suspects two accounts may belong to the same person. |
| **Fraud Indicator** | General fraud signal detected. |
| **Self-Exclusion Breach** | A user who requested to be excluded has attempted to access the platform. |

### How to handle an alert

1. Click the alert to view its details.
2. Review the information — user ID, the specific activity that triggered it, and how severe it is (Low, Medium, High, Critical).
3. Choose an action:
   - **Dismiss** — The alert is a false alarm. Mark it as dismissed.
   - **Resolve** — You have investigated and taken action (e.g., suspended the user). Mark it as resolved.
   - **Escalate** — Flag it for further review.

> 🔴 **Always investigate CRITICAL alerts immediately.** These can indicate serious fraud or financial risk.

---

## 10. Analytics & Reports

### Analytics

Go to: **Admin → Analytics**

Provides deeper charts and statistics about the platform's performance over time — user growth, betting volume, revenue, etc.

### Reports

Go to: **Admin → Reports**

Generates financial summaries that you can download for accounting, tax, or record-keeping purposes. You can typically filter by date range and export as a CSV or PDF.

---

## 11. Ban Appeals

Go to: **Admin → Appeals**

When a user has been banned, they can submit an appeal explaining why they believe the ban should be reversed. These appeals appear here.

### How to handle an appeal

1. Click on the appeal to read the user's message.
2. Review the user's account history and the reason they were originally banned.
3. Choose:
   - **Approve** — Unban the user. Write a response message explaining the decision.
   - **Reject** — Keep the ban in place. Write a response explaining why.
   - **Withdraw** — If the user has withdrawn their appeal.

> All appeal decisions are logged with a timestamp and your administrator ID.

---

## 12. Contact Messages

Go to: **Admin → Contacts**

Users can send support or contact messages through the website. These messages appear here.

### How to manage contacts

- Each message shows the user's name, phone, subject, and full message.
- Change the status of a message:
  - **Submitted** → **Read** (when you open it)
  - **Read** → **Resolved** (when you have dealt with it)
- Contact users back directly via phone or email (this is done outside the platform).

---

## 13. Newsletter Subscribers

Go to: **Admin → Newsletter**

This shows all email addresses that have subscribed to receive platform updates and promotions.

### What you can do
- View all active and unsubscribed email addresses.
- Export the list as a CSV to use with your email marketing tool.

---

## 14. Platform Settings

Go to: **Admin → Settings**

This is where you configure how the entire platform behaves. Changes here affect all users immediately.

> ⚠️ **Be careful here. Incorrect settings can disrupt the platform for all users.**

### Setting categories

#### General
- **Platform Name** — The name shown across the site.
- **Maintenance Mode** — When ON, the platform is offline for users. Only admins can log in. Use this when doing updates.
- **Registration Enabled** — When OFF, no new users can sign up.
- **Default Currency** — Currently set to **KES** (Kenyan Shillings).

#### Wallet Limits
- **Min/Max Deposit** — Minimum and maximum amounts a user can deposit at once.
- **Min/Max Withdrawal** — Minimum and maximum amounts a user can withdraw at once.
- **Daily Transaction Limit** — Maximum total transaction value per day.

#### Betting Rules
- **Min/Max Bet Amount** — The smallest and largest bet a user can place.
- **Max Win Per Bet** — The maximum a user can win on a single bet. This protects the platform from a single huge payout.
- **Max Active Bets Per User** — How many bets a user can have open at once.
- **Odds Margin %** — The built-in profit margin applied to all odds.
- **Allow Live Betting** — Toggle whether users can bet on live events.

#### Payments (M-Pesa)
- **M-Pesa Shortcode** — Your business short code.
- **M-Pesa Consumer Key & Secret** — API credentials (given by Safaricom).
- **Transaction Fee %** — The percentage fee charged on withdrawals.
- **Auto-Withdraw Enabled** — When ON, small withdrawals are processed automatically without your manual approval.
- **Withdrawal Approval Threshold** — Withdrawals above this amount always require your manual approval, even if auto-withdraw is on.

#### Bonuses
- **Welcome Bonus Enabled** — Toggle the sign-up bonus.
- **Bonus Amount/Percent** — The value of the welcome bonus.
- **Wagering Requirement** — How many times a user must bet the bonus amount before they can withdraw it.
- **Bonus Expiry Hours** — How long before an unused bonus expires.

#### Notifications
- **Email/SMS Enabled** — Toggle email and SMS notifications to users.
- **Notify on Deposit/Withdrawal/Bet Result** — Choose which events trigger a notification.

#### Global Security Rules
- **Admin 2FA Required** — Forces all admin accounts to use two-factor authentication.
- **Min Password Length** — The shortest password users are allowed to create.
- **Session Timeout (minutes)** — How long before an inactive user is automatically logged out.
- **Max Login Attempts** — After this many failed logins, an account is temporarily locked.

---

## 15. Security Center (Admin Profile)

Go to: **Admin → Security**

This section is dedicated to your personal administrator account security. It contains tools to harden your login credentials.

### What you can do

- **Enable Two-Factor Authentication (2FA)** — Set up Microsoft Authenticator (or any TOTP app) to require a unique code from your mobile device every time you log in. **We highly recommend keeping this ON.**
- **Change Password** — Update your administrative password at any time. You will need to provide your current password, and your new password must meet the system's strong password requirements (minimum 10 characters, including uppercase, lowercase, numbers, and special characters).
- **Disable Protection** — If 2FA is active, you can disable it by entering a valid code from your authenticator app.

---

## 16. Quick Settings

Go to: **Admin → Quick Settings**

A simplified, fast-access panel for the most commonly changed settings — without having to navigate the full Settings page. Useful for things like toggling maintenance mode quickly.

---

## 17. Daily Checklist

Use this checklist every day when operating the platform:

- [ ] **Log in** and check the Dashboard for any alerts.
- [ ] **Process pending withdrawals** — Go to Withdrawals → Pending and review all requests. Approve or reject each one.
- [ ] **Check Risk Alerts** — Go to Risk and review any new Medium, High, or Critical alerts.
- [ ] **Settle finished custom events** — If the Dashboard shows events needing settlement, go to Events → Custom and settle them.
- [ ] **Review contact messages** — Go to Contacts and read any new messages from users. Mark them as Read/Resolved.
- [ ] **Check ban appeals** — Go to Appeals and respond to any pending appeals.
- [ ] **Monitor analytics** — Quickly review the dashboard charts for any unusual spikes or drops.

---

## 18. Common Situations & What to Do

### "A user says their deposit went through on M-Pesa but their wallet wasn't topped up"
1. Go to **Transactions** and search for the user's phone number.
2. Find the deposit transaction and check its status.
3. If the status is **Pending** or **Failed**, the M-Pesa callback may have failed. Note the M-Pesa transaction code from the user and check with your payment provider.
4. If you confirm the money was received, you can **manually adjust the user's wallet** from their profile in the Users section.

### "A user is complaining they can't log in"
1. Go to **Users** and find the account.
2. Check the account status — it may be **Suspended** or **Banned**.
3. If it should be active, check if the email is verified.
4. You can trigger a **password reset** from their profile page.

### "I want to take the platform offline for maintenance"
1. Go to **Settings** (or **Quick Settings**).
2. Toggle **Maintenance Mode** to **ON**.
3. The platform will show a maintenance page to all regular users. You can still log in as admin.
4. When done, toggle it back **OFF**.

### "A bet result was settled incorrectly"
1. Go to **Bets** and find the affected bets.
2. You can **void** the incorrect bets, which returns stakes to users' wallets.
3. If it was a custom event, go to **Events → Custom**, find the event, and re-settle the markets correctly.

### "I see a suspicious user placing huge bets rapidly"
1. Go to **Risk** — there may already be an alert for this user.
2. Go to **Users** and open their profile.
3. Review their bet history and transaction history.
4. If you believe it is suspicious, **Suspend** the account while you investigate.
5. Update the Risk Alert status to "In Review".

### "I need to stop new users from registering temporarily"
1. Go to **Settings** or **Quick Settings**.
2. Toggle **Registration Enabled** to **OFF**.
3. New users will see a message saying registration is currently unavailable.

---

*For technical issues (server errors, payment integration problems, etc.), contact your developer.*
