# BetixPro Owner Guide

This guide is written for you as the owner or operator of the BetixPro platform.

In this guide, you will find:

- what your customers see and do
- what you do inside the admin panel
- how money moves through your system
- how you manage users, bets, withdrawals, events, odds, risk, and security
- what you should check every day to keep the platform running smoothly

## Table of Contents

1. [What BetixPro Is](#1-what-betixpro-is)
2. [Quick Map Of The System](#2-quick-map-of-the-system)
3. [First-Time Owner Setup](#3-first-time-owner-setup)
4. [What Your Customers Do On The User Side](#4-what-your-customers-do-on-the-user-side)
5. [How The Owner Uses The Admin Panel](#5-how-the-owner-uses-the-admin-panel)
6. [Payment Flow Explained Simply](#6-payment-flow-explained-simply)
7. [Event And Bet Lifecycle](#7-event-and-bet-lifecycle)
8. [Important Status Words You Will See](#8-important-status-words-you-will-see)
9. [Daily Owner Checklist](#9-daily-owner-checklist)
10. [Weekly Owner Checklist](#10-weekly-owner-checklist)
11. [Common Problems And What To Do](#11-common-problems-and-what-to-do)
12. [Best Practices For Running The Platform Well](#12-best-practices-for-running-the-platform-well)
13. [Very Important Owner Warnings](#13-very-important-owner-warnings)
14. [Simple "Who Handles What" Summary](#14-simple-who-handles-what-summary)
15. [Final Practical Advice](#15-final-practical-advice)

---

## 1. What BetixPro Is

Your BetixPro platform has two main sides:

- `User side`: this is the public/customer side where your players register, deposit, browse matches, place bets, track bets, and contact support
- `Admin side`: this is the management side where you control the platform

Think of your platform this way:

- your users place bets
- the wallet records money in and money out
- the admin panel controls what is allowed, what is visible, and what gets approved

---

## 2. Quick Map Of The System

### Your user side includes

- account registration and login
- password reset
- home page with sports, featured events, highlights, and live betting
- custom events
- bet slip
- my bets
- profile
- wallet
- deposit
- withdrawal
- transaction history
- notifications
- FAQ, contact, terms, and privacy pages
- ban appeal submission if a user account is blocked

### Your admin side includes

- dashboard
- users
- bets
- payments
- withdrawals
- events
- odds
- risk
- analytics
- reports
- messages
- newsletter
- security
- settings
- personal quick settings

---

## 3. First-Time Owner Setup

If you are using the platform for the first time, follow this order.

### Step 1: Sign in as admin

- open the login screen
- enter your admin phone number and password
- if the system asks for a one-time password change, complete it first
- if the system asks for Microsoft Authenticator verification, complete that before continuing

### Step 2: Change the temporary password

On first admin login, the system can force a password change.

Use a strong password with:

- uppercase letters
- lowercase letters
- numbers
- special characters

Do not share this password with staff or agents.

### Step 3: Enable 2FA in Security Center

Go to `Admin > Security`.

You will be guided through:

- installing Microsoft Authenticator
- opening the QR setup
- scanning the QR code
- entering the 6-digit code
- activating protection

This is one of the most important setup steps in the whole system.

### Step 4: Review Settings before going live

Go to `Admin > Settings`.

Check these areas first:

- minimum and maximum deposit
- minimum and maximum withdrawal
- daily transaction limit
- max active bets per user
- payment method enable/disable
- M-Pesa credentials
- Paystack credentials
- withdrawal fee percentage
- auto-withdraw settings

Do not enable live payments until the gateway details are complete and correct.

### Step 5: Review Sport Categories and Events

Go to `Admin > Events`.

Check:

- which sports are active
- whether categories appear in navigation
- whether events are syncing
- whether events have odds
- whether featured events are set correctly

### Step 6: Test the full customer journey

Before launch, test:

1. register a user
2. log in as that user
3. make a deposit
4. place a bet
5. check `My Bets`
6. request a withdrawal
7. approve it from admin

If these steps work, your main flow is ready.

---

## 4. What Your Customers Do On The User Side

As the owner, you should understand your customer journey clearly.

## 4.1 Registration

Your customers can create an account by entering:

- email address
- Kenyan phone number
- password
- confirm password
- agreement to terms and privacy policy

After successful registration, the customer is taken into the user area.

## 4.2 Login

Your customers log in with:

- phone number
- password

If the account is banned:

- login is blocked
- the customer can be shown the ban reason
- the customer can submit an appeal

## 4.3 Forgot Password

Your customers can request a password reset link by email.

## 4.4 Home Page

Your user home page is the main betting entrance.

It includes:

- hero banner
- sport tabs
- featured events
- highlights
- upcoming matches
- custom events
- bet slip

The home page is designed to help your customers find matches quickly.

## 4.5 Sport Navigation

Your customers can browse by:

- all sports
- popular sports
- more sports
- live betting
- featured events
- custom events
- highlights

Sports shown here come from your sport category configuration.

## 4.6 Featured Events

Featured events are special matches you want to promote to your customers.

These appear separately from the normal event list and help direct your customers' attention.

## 4.7 Highlights

Highlights help surface important or interesting events.

This gives your customers a faster path to betting without scrolling through everything.

## 4.8 Live Betting

Your customers can open the `Live` section and see:

- live matches
- live scores
- available live markets
- live odds

Live betting is only useful when your event and odds feeds are healthy.

## 4.9 Custom Events

Custom events are events you create yourself instead of pulling them from the regular sports feed.

Examples:

- local matches
- special contests
- promotional events
- non-standard events

Your customers can open custom events, choose a selection, and bet on them the same way they do on normal events.

## 4.10 Bet Slip

When a customer taps an odd, it goes into the bet slip.

The bet slip helps your customer:

- review selections
- see odds
- enter a stake
- view possible payout
- place the bet

On mobile, the bet slip can be opened from the bottom navigation.

## 4.11 Placing a Bet

Your customer’s basic betting flow is:

1. choose an event
2. tap an odd
3. review selections in the bet slip
4. enter stake
5. confirm the bet

After the bet is placed:

- money leaves the wallet as a bet stake
- the bet appears in `My Bets`

## 4.12 My Bets

This is where your customers track betting activity.

Your customers can:

- see active and past bets
- open a bet for full details
- filter the list
- move through pages
- hide lost bets if they want a cleaner view

Some bets may also allow cancellation if the system rules still permit it.

## 4.13 Bet Detail

When a customer opens a single bet, they can see:

- selections
- event details
- odds
- status
- payout information
- cancellation option if allowed

## 4.14 Profile

The user profile shows your customer:

- current balance
- phone number
- account status
- total deposits
- total withdrawals
- quick links to wallet, bets, and transaction history

Your customers can also:

- update their phone number
- sign out
- control whether quick navigation is shown under the top bar

## 4.15 Wallet

The wallet is your customer’s money area.

It connects to:

- deposits
- withdrawals
- bet stakes
- bet wins
- refunds
- bonuses

## 4.16 Deposits

Your customers can deposit using the payment methods you enable.

Currently supported in the system:

- M-Pesa
- Paystack

The deposit screen supports:

- quick amount buttons
- manual amount entry
- real-time payment status feedback
- success and failure messages

### M-Pesa deposits

Your customer:

1. enters amount
2. confirms the phone number on the account
3. receives an STK push
4. approves on the phone
5. gets wallet credit after confirmation

### Paystack deposits

Your customer:

1. enters amount
2. is redirected to secure Paystack checkout
3. completes payment
4. returns to the app
5. gets wallet credit after verification

If a payment method is disabled in settings, your customer will not be able to use it.

## 4.17 Withdrawals

Your customers can request a withdrawal from their wallet.

The screen shows:

- amount
- receiving phone number
- fee
- net amount the customer will receive

The customer must confirm before the request is sent.

Important owner note:

- a withdrawal request does not mean money has already left your business account
- it must still be processed from the admin side

## 4.18 Transaction History

Your customers can review wallet activity such as:

- deposits
- withdrawals
- bet stakes
- bet wins
- refunds
- bonuses

They can also filter the list by transaction type.

## 4.19 Notifications

Your customers receive in-app notifications for key events such as:

- deposit success
- withdrawal success
- withdrawal failure
- bet results
- system updates

## 4.20 Contact And Support

Your customers can send support messages from the contact page.

Logged-in users can also review their message history and see statuses like:

- submitted
- read
- resolved

## 4.21 FAQs, Terms, And Privacy

The user side also includes:

- FAQ page
- how-it-works page
- terms page
- privacy page

These help reduce support load and build trust.

---

## 5. How The Owner Uses The Admin Panel

The admin side is your control center.

## 5.1 Admin Layout Basics

Inside the admin shell, you have:

- left sidebar navigation
- top notification area
- search bar
- user/account menu
- quick settings link
- theme selector
- logout

You may also hear withdrawal alert sounds if they are enabled in your personal quick settings.

## 5.2 Dashboard

Go to `Admin > Dashboard`.

This is your main platform overview page.

It shows:

- platform summary metrics
- deposit and withdrawal trend chart
- registration trend chart
- recent transaction activity
- warning banner for pending withdrawals
- warning banner for finished custom events that still need settlement

Use this page first every day.

### What to look for on the dashboard

- pending withdrawals waiting for approval
- unusual drop in deposits
- unusual spike in withdrawals
- finished custom events that still need settlement
- recent activity that looks suspicious

## 5.3 Users

Go to `Admin > Users`.

This is where you manage your customer accounts.

You can:

- search users by name or phone
- filter active and banned users
- open a user profile
- create a new user manually
- edit user details
- verify or unverify a user
- change a user password
- ban a user
- unban a user

### User profile view includes

- phone
- full name
- status
- verification state
- join date
- wallet balance
- total bets

### When to ban a user

Use banning carefully for cases like:

- fraud
- abuse
- duplicate account misuse
- suspicious payment behavior
- rule violations

Always record a clear reason.

## 5.4 Ban Appeals

Go to `Admin > Appeals`.

This area is where you review banned users who ask to be reinstated.

You can:

- read the appeal message
- see the user details
- review the original ban reason
- approve the appeal
- reject the appeal
- send a written response

If approved:

- the ban is lifted

If rejected:

- the ban stays in place

## 5.5 Bets

Go to `Admin > Bets`.

This is your bet management area.

You use it to:

- monitor bets
- inspect bet details
- review settlements
- manage void actions

This is especially important when:

- a match is cancelled
- a market is disputed
- a user raises a complaint

## 5.6 Payments

Go to `Admin > Payments`.

This area focuses on your wallet payment activity, especially deposits.

Use it to review:

- deposit records
- transaction references
- payment channels
- statuses
- timestamps

This helps with reconciliation.

## 5.7 Withdrawals

Go to `Admin > Withdrawals`.

This is one of the most important screens in your system.

You can:

- filter by status
- review pending requests
- open full details
- approve a withdrawal
- reject a withdrawal
- export withdrawals to CSV

### What each withdrawal record shows

- user phone
- withdrawal phone
- amount
- fee
- total debit
- status
- reference
- provider message
- request time
- processed time

### What happens when you approve

When you approve:

- the withdrawal moves into processing or completion flow
- if automated payout is configured, the system can trigger the payout provider

### What happens when you reject

When you reject:

- the request is declined
- the platform should record the outcome

Best practice:

- always review the amount, phone number, and user history first
- be extra careful with large withdrawals

## 5.8 Events

Go to `Admin > Events`.

This area gives you three main working areas:

- feed events
- custom events
- sport categories

### Feed Events

Feed events are normal sports fixtures from your event/odds feed.

You can:

- search events
- filter by status
- view live, upcoming, finished, active, configured, and no-odds events
- inspect event details
- enable or disable markets
- adjust house margin
- bulk-apply settings
- create a simple custom event from the event area

Important uses:

- checking whether matches are loading
- checking whether matches have odds
- marking featured events
- configuring margins and markets

### Custom Events

Custom events are manually managed events.

You use them when you want betting outside the normal feed.

You can:

- create custom events
- publish them
- monitor them
- settle them manually after they end

This is critical:

- a finished custom event must still be settled by an admin if markets are not already settled
- until settlement is done, final results and payouts may not be complete

### Sport Categories

Sport categories control which sports appear on the user side.

You can manage:

- active or inactive state
- display order
- visibility in navigation
- category organization

If a category is hidden or inactive, users may stop seeing that sport.

## 5.9 Odds

Go to `Admin > Odds`.

This area helps you review and curate the odds your customers will see.

You can:

- view configured events
- see events with and without odds
- search by team or league
- inspect bookmaker odds
- compare configured events with odds-fed events
- expand an event to see market details
- sync or refresh odds data

Use this page when:

- odds are missing
- events are visible but not bettable
- you want to confirm pricing quality

## 5.10 Risk

Go to `Admin > Risk`.

This is your fraud and exposure monitoring area.

You can:

- filter alerts by status
- filter by severity
- filter by alert type
- open full alert details
- mark an alert as in review
- resolve an alert
- dismiss an alert

### Examples of risk alerts

- high risk bet
- suspicious pattern
- exposure limit exceeded
- duplicate account
- fraud indicator
- unusual odds movement

### High risk users panel

The page also highlights users with many alerts.

This helps you decide:

- who needs manual review
- who may need betting restrictions
- who may need suspension

## 5.11 Analytics

Go to `Admin > Analytics`.

This page helps you understand your business performance.

It includes:

- financial trend
- handle
- GGR
- NGR
- active bettor growth
- category performance
- outcome distribution
- ticket size distribution
- odds band efficiency
- top leagues
- strategic insights

Use this area for management decisions, not only daily operations.

## 5.12 Reports

Go to `Admin > Reports`.

This page is more structured than the analytics page and gives you cleaner reports in tabs.

The main tabs are:

- financial
- betting
- users
- risk

### Financial reports

Shows:

- total revenue
- deposits
- withdrawals
- bet totals
- transaction breakdown

### Betting reports

Shows:

- total bets
- total staked
- win rate
- average stake
- bet status distribution
- top markets

### User reports

Shows user-focused reporting such as top bettors and related summaries.

### Risk reports

Shows:

- total alerts
- high-risk alert levels
- severity distribution
- recent high-risk alerts

Use reports when you want cleaner management summaries over a chosen time period.

## 5.13 Messages

Go to `Admin > Messages`.

This area contains the contact form submissions your customers send to you.

You can:

- filter by status
- open a message
- mark as read
- mark as resolved
- export messages to CSV

Message statuses are:

- submitted
- read
- resolved

Use this area like a simple support inbox.

## 5.14 Newsletter

Go to `Admin > Newsletter`.

This area contains the email subscribers you can use for announcements and marketing.

You can:

- filter active and inactive subscribers
- copy subscriber emails
- export subscribers to CSV

Use this for marketing and announcements.

## 5.15 Security

Go to `Admin > Security`.

This is where you protect your own admin account and access.

You can:

- enable 2FA
- disable 2FA
- change your password
- view setup QR code
- copy the manual setup key

Never disable 2FA unless absolutely necessary.

## 5.16 Settings

Go to `Admin > Settings`.

This is where you control the business rules of your platform.

The settings area includes sections for:

- user defaults and restrictions
- M-Pesa integration
- Paystack gateway
- platform and financial rules
- gambling engine behavior
- growth and legal text

### Important things you control here

- min and max deposit
- min and max withdrawal
- daily transaction limit
- max active bets per user
- gateway activation
- M-Pesa credentials
- Paystack credentials
- callback and webhook URLs
- fees and withdrawal thresholds

If a payment gateway is incomplete, do not switch it on.

## 5.17 Quick Settings

Go to `Admin > Quick Settings`.

This page is personal to you, the current admin user on the current device.

It does not change the whole platform.

You can control:

- withdrawal request sound on or off
- alert tone
- sound volume
- whether sound plays only when the tab is visible
- reset personal quick settings

This page is for your comfort, not system policy.

---

## 6. Payment Flow Explained Simply

This is one of the most important parts for an owner.

## 6.1 Deposit flow

1. user chooses a deposit method
2. user enters amount
3. user completes payment
4. payment is confirmed
5. wallet is credited
6. a transaction record is stored
7. the user sees the new balance

## 6.2 Withdrawal flow

1. user enters amount and receiving phone
2. user sees fee and net amount
3. user confirms request
4. request appears in `Admin > Withdrawals`
5. admin reviews it
6. admin approves or rejects it
7. if approved, payout is processed
8. if rejected, the system records the outcome and the request closes

## 6.3 What the fee means

The user may request one amount, but the amount received can be lower because of the fee.

Example:

- requested withdrawal: `KES 1,000`
- fee: `KES 150`
- user receives: `KES 850`

Always look at:

- amount
- fee
- net amount
- phone number

---

## 7. Event And Bet Lifecycle

To run the system well, you should understand the full betting lifecycle.

## 7.1 Before the event

- the event must exist
- the event should have odds
- the event should be active if users are meant to bet on it
- the market should be enabled

## 7.2 While the event is available

- users can select odds
- bets are placed
- money is deducted from wallets as stakes

## 7.3 After the event

For normal feed events:

- result processing and status updates should happen through the event/odds workflow

For custom events:

- you must settle the event manually if it still needs settlement

## 7.4 Final bet outcomes

Common outcomes:

- `Pending`: not settled yet
- `Won`: user wins
- `Lost`: user loses
- `Void`: bet cancelled or invalidated fairly

If a bet is voided, the stake should normally be refunded to the wallet.

---

## 8. Important Status Words You Will See

## 8.1 User/account statuses

- `Active`: user can use the system
- `Suspended` or banned: user access is restricted

## 8.2 Transaction statuses

- `Pending`: started but not completed
- `Processing`: currently being worked on
- `Completed`: finished successfully
- `Failed`: unsuccessful
- `Reversed`: rolled back

## 8.3 Bet statuses

- `Pending`
- `Won`
- `Lost`
- `Void`

## 8.4 Message statuses

- `Submitted`
- `Read`
- `Resolved`

## 8.5 Risk alert statuses

- `Open`
- `In Review`
- `Escalated`
- `Resolved`
- `Dismissed`

## 8.6 Custom event statuses

- `Draft`
- `Published`
- `Live`
- `Suspended`
- `Finished`
- `Cancelled`

---

## 9. Daily Owner Checklist

Use this every day.

### Morning checklist

1. open `Dashboard`
2. check pending withdrawals
3. check finished custom events needing settlement
4. check if event feed and odds look healthy
5. check risk alerts
6. check new support messages

### During the day

1. monitor withdrawals
2. monitor suspicious users
3. review failed or missing payments
4. make sure important live and featured events are visible
5. settle any custom events that have finished

### End-of-day checklist

1. clear or review pending withdrawals
2. review unresolved risk alerts
3. review unresolved messages
4. check reports or analytics
5. confirm no important custom event is left unsettled

---

## 10. Weekly Owner Checklist

Once a week:

1. export financial and operational reports
2. review risk patterns
3. review top bettors and large winners
4. review inactive or failed payment methods
5. clean up sport categories if needed
6. review newsletter subscriber growth
7. check that support contact details and legal text are still correct

---

## 11. Common Problems And What To Do

## 11.1 Users say they cannot deposit

Check:

- is the payment method enabled in settings
- are min/max deposit values too strict
- are M-Pesa credentials complete
- are Paystack keys complete
- is the provider currently failing

## 11.2 Users say they cannot withdraw

Check:

- wallet balance
- min/max withdrawal rules
- fee impact
- phone number format
- whether the request is pending or already processed
- whether withdrawal approvals are waiting in admin

## 11.3 Events are visible but not bettable

Check:

- is the event active
- does it have odds
- are markets enabled
- is the category active

## 11.4 Live betting looks empty

Check:

- live feed health
- whether live events are actually available
- whether odds exist for live markets

## 11.5 Custom events ended but users still see unfinished outcomes

Check:

- has the custom event been settled
- are all markets settled

## 11.6 Too many risky users or alerts

Check:

- risk page
- related user accounts
- betting patterns
- duplicate phones or repeated suspicious activity

Take action:

- mark alerts in review
- resolve real issues
- dismiss false alarms
- ban users only when justified

## 11.7 Admin login is blocked

Check:

- correct phone and password
- required password change
- Microsoft Authenticator code

If 2FA is enabled, the 6-digit code is required.

---

## 12. Best Practices For Running The Platform Well

- review withdrawals carefully before approving
- do not ignore finished custom events
- keep payment credentials accurate and updated
- keep 2FA enabled
- do not share admin access
- record ban reasons clearly
- answer appeals professionally
- review support messages daily
- use analytics and reports to guide business decisions
- test user deposit and withdrawal flows after any major settings change

---

## 13. Very Important Owner Warnings

- Never enable a payment method until all credentials are complete.
- Never approve a suspicious high-value withdrawal without review.
- Never leave custom events unsettled after they finish.
- Never disable 2FA casually.
- Never share your admin password or authenticator access.

---

## 14. Simple "Who Handles What" Summary

### The user handles

- registration
- login
- deposits
- browsing events
- placing bets
- checking bets
- requesting withdrawals
- sending support messages

### The owner/admin handles

- enabling and configuring payments
- reviewing withdrawals
- managing events and categories
- settling custom events
- managing users
- handling appeals
- reviewing risk alerts
- reading support messages
- monitoring platform health
- changing global settings

---

## 15. Final Practical Advice

If you only remember five things, remember these:

1. Check the dashboard first every day.
2. Process withdrawals carefully and quickly.
3. Keep event feeds, odds, and custom event settlement under control.
4. Watch the risk page and user bans closely.
5. Protect the admin account with a strong password and 2FA.

---

If you want, this guide can also be turned into:

- a branded PDF owner manual
- a staff training handbook
- a shorter quick-start guide
- an in-app help center version
