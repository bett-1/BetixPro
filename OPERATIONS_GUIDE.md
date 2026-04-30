# 🏆 BetixPro Operations & Management Guide

> [!IMPORTANT]
> **This guide is the definitive manual for platform operators.**
> It covers every module of the BetixPro ecosystem, from user-facing betting workflows to advanced administrative controls. No technical expertise is required to follow these instructions.

---

## 📑 Table of Contents

1.  [**Platform Overview**](#1-platform-overview)
2.  [**The User Experience**](#2-the-user-experience)
    - [Betting Workflows](#betting-workflows)
    - [Wallet & Payments](#wallet--payments)
3.  [**Administrative Command Center**](#3-administrative-command-center)
    - [Real-Time Dashboard](#real-time-dashboard)
    - [User Management & KYC](#user-management--kyc)
    - [Withdrawal Mastery](#withdrawal-mastery)
    - [Betting Engine Control](#betting-engine-control)
    - [Custom Event Lifecycle](#custom-event-lifecycle)
4.  [**Risk & Intelligence**](#4-risk--intelligence)
    - [Fraud Detection](#fraud-detection)
    - [Deep Analytics](#deep-analytics)
5.  [**System Configuration**](#5-system-configuration)
    - [Dynamic Payment Settings](#dynamic-payment-settings)
    - [Security Protocols](#security-protocols)
6.  [**Daily Operations Checklist**](#6-daily-operations-checklist)
7.  [**Troubleshooting & FAQ**](#7-troubleshooting--faq)

---

## 1. Platform Overview

BetixPro is a high-performance sports betting and gaming platform designed for scale. It features a split architecture:
- **User Portal:** A lightning-fast, mobile-responsive interface for bettors.
- **Admin Command Center:** A secure, data-rich dashboard for operators to manage every aspect of the business.

---

## 2. The User Experience

Understanding what your users see is critical for effective support and management.

### Betting Workflows
Users interact with three main types of events:
- **Sports Events:** Automatically synced from global data providers (Football, Basketball, etc.).
- **Live Matches:** Real-time betting on ongoing games.
- **Custom Events:** Unique markets created by you (the Admin).

**How a user places a bet:**
1. Selects an event from the home or category page.
2. Clicks on an outcome (selection) to add it to their **Bet Slip**.
3. Enters a stake amount.
4. Confirms the bet. The stake is immediately deducted from their wallet.

### Wallet & Payments
The wallet is the heart of the user experience.
- **Deposits:** Users can top up via **M-Pesa STK Push** (prompted on phone) or **Paystack** (Card/Bank).
- **Withdrawals:** Users request funds to be sent to their mobile money or bank account.
- **Transaction History:** A full ledger of every KES that enters or leaves their account.

---

## 3. Administrative Command Center

### Real-Time Dashboard
The first screen you see after [Secure Login](#security-protocols).
- **Pulse Metrics:** Total users, active bets, and revenue snapshots.
- **Urgent Alerts:**
    - 🟨 **Pending Withdrawals:** Click to process immediately.
    - 🟩 **Unsettled Events:** Click to declare winners for finished games.
- **Trend Analysis:** Visual charts showing growth and financial health over time.

### User Management & KYC
Located at: **Admin → Users**
- **Profiles:** View a user's entire history, including every bet they've ever placed.
- **Balance Adjustments:** Manually credit or debit a wallet (e.g., for loyalty rewards or corrections).
- **Enforcement:** Suspend or Ban users who violate terms.
- **KYC Compliance:** Review uploaded ID documents (if enabled) to verify user identity before large withdrawals.

### Withdrawal Mastery
Located at: **Admin → Withdrawals**
> [!TIP]
> Efficient withdrawal processing is the #1 factor in user trust.

| Action | Result |
| :--- | :--- |
| **Approve** | Initiates automated payout via M-Pesa or Paystack. |
| **Reject** | Cancels the request and returns funds to the user's wallet. |
| **View Details** | Check the user's recent win history to ensure legitimacy before paying. |

### Betting Engine Control
Located at: **Admin → Bets** & **Admin → Odds**
- **Bet Monitoring:** Track every open liability the platform has.
- **Odds Tuning:** Adjust the "House Margin" to control profitability.
- **Market Control:** Hide specific markets or events if you suspect irregular activity.

### Custom Event Lifecycle
Located at: **Admin → Events → Custom**
1. **Creation:** Define teams, category, and start time.
2. **Markets:** Add betting options (e.g., "Winner", "Over/Under").
3. **Publication:** Make the event live for users.
4. **Settlement:** Once finished, mark the winner. **The system automatically pays out all winning tickets instantly.**

---

## 4. Risk & Intelligence

### Fraud Detection
Located at: **Admin → Risk**
The system's AI monitors for:
- **High-Stake Alerts:** Large bets that could impact liquidity.
- **Rapid Activity:** Detecting bot-like behavior.
- **Duplicate Accounts:** Finding users attempting to claim multiple bonuses.

### Deep Analytics
Located at: **Admin → Analytics**
Go beyond simple charts. This module provides:
- **NGR (Net Gaming Revenue):** Your actual profit after payouts.
- **Category Performance:** Which sports are making the most money?
- **User Retention:** Track how long users stay active on the platform.

---

## 5. System Configuration

### Dynamic Payment Settings
Located at: **Admin → Settings → Financial Operations**
> [!IMPORTANT]
> **No server restarts required.** Changes made here take effect immediately in production.

- **M-Pesa:** Configure your Paybill/Till, Consumer Keys, and B2C credentials.
- **Paystack:** Update Public/Secret keys and Webhook secrets.
- **Limits:** Set minimum/maximum amounts for deposits and withdrawals to manage cash flow.

### Security Protocols
Located at: **Admin → Security Center**
- **Mandatory 2FA:** Every admin MUST use Microsoft Authenticator.
- **Password Policy:** Forces strong passwords (uppercase, numbers, symbols).
- **Session Control:** Automatically logs out inactive admins to prevent unauthorized access.

---

## 6. Daily Operations Checklist

To maintain a healthy platform, follow this routine:

- [ ] **08:00 AM:** Review and clear all **Pending Withdrawals**.
- [ ] **09:00 AM:** Check **Risk Alerts** for any "High" or "Critical" flags.
- [ ] **12:00 PM:** Settle any **Custom Events** that finished overnight.
- [ ] **02:00 PM:** Review **Contact Messages** and **Appeals**.
- [ ] **06:00 PM:** Monitor **Analytics** for unusual betting spikes during major games.
- [ ] **Before Logout:** Final check of the **Dashboard** for urgent notifications.

---

## 7. Troubleshooting & FAQ

### "A user's deposit is missing"
1. Check **Admin → Transactions** for the reference code.
2. If it's "Pending", the callback from the provider hasn't arrived.
3. Verify the transaction in your M-Pesa/Paystack portal.
4. If valid, use the **User Profile** to manually credit the wallet.

### "We need to go offline for maintenance"
1. Go to **Admin → Settings → General**.
2. Toggle **Maintenance Mode** to **ON**.
3. Regular users will see a "Back Soon" page. Admins can still access the dashboard.

### "A bet was settled incorrectly"
1. Find the bet in **Admin → Bets**.
2. Use the **Void** action to refund the user's stake.
3. If it was a custom event, re-settle the market with the correct result.

---

> [!NOTE]
> **Need Technical Support?**
> For server issues, database errors, or API outages, contact your technical lead.
