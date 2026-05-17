# BetixPro Troubleshooting Guide

This guide is for system administrators who need to handle common problems in BetixPro without looking at code or logs. It focuses on what to check, what to try next, and when to ask for technical help.

## 1. What To Do First

When something looks wrong, stay calm and check the basics first:

1. Refresh the page once.
2. Confirm your internet connection is working.
3. Try the action again.
4. Check whether the problem is happening for one user or everyone.
5. If possible, note the exact time and what you clicked.

If the problem is only affecting one person, it is usually a user account issue. If it affects everyone, it is usually a system or payment issue.

## 2. Common Problems And What To Check

### The site is not loading

If the site does not open or keeps spinning:

- Try a different browser.
- Try a different device.
- Ask another staff member if they can open the site.
- Check whether the issue is on the public website or only the admin area.

If the site is down for everyone, escalate it to the technical team immediately.

### A user cannot log in

If a user says they cannot sign in:

- Confirm the email or phone number is correct.
- Ask the user to try the password carefully again.
- Ask the user to reset their password if that option is available.
- Confirm the account is not suspended or banned.

If the admin account cannot log in:

- Confirm the password is correct.
- Check whether two-factor authentication is required.
- Make sure the device time is correct if a code is being used.

### Payments are delayed or missing

If a deposit or withdrawal is not showing up:

- Ask the user for the transaction reference or receipt number.
- Check whether the payment is still processing.
- Confirm the correct payment method was used.
- Confirm the user did not send money to the wrong number or account.

For deposits:

- M-Pesa deposits should usually update after a short wait.
- Paystack deposits may take a little longer if the card bank is slow.

For withdrawals:

- Confirm the request is still pending.
- Confirm the account meets the normal withdrawal rules.
- Confirm the user has enough balance.

If money is missing but no transaction appears, escalate it right away.

### The user says a payment was taken but not credited

If a user has proof of payment but the wallet was not updated:

- Ask for a screenshot or receipt.
- Confirm the amount and time.
- Check whether the payment was made to the correct BetixPro account.
- Tell the user not to send the payment again until the issue is reviewed.

### A withdrawal is stuck

If a withdrawal request stays pending for too long:

- Check whether it needs approval.
- Check whether the user still qualifies for withdrawal.
- Check whether the wallet balance changed after the request.
- Ask whether the user recently changed their phone number or account details.

If the request has been pending longer than normal, escalate it.

### A user says their account was banned by mistake

If a user appeals a suspension:

- Read the ban reason.
- Check the user’s recent activity.
- Compare the complaint with the account history.
- Reply clearly and politely.

If the user should be unbanned, do that only after reviewing the case carefully.

### The admin dashboard looks wrong

If numbers or charts do not look right:

- Refresh the page.
- Sign out and back in.
- Check if the problem is only on one screen or the whole dashboard.
- Wait a few minutes and check again if the system is updating in the background.

If the same values stay wrong after a refresh, report it.

## 3. Simple Checks Before Escalating

Before you contact technical support, collect these details:

- What was happening.
- Which user or payment was involved.
- The time the issue started.
- What you expected to happen.
- What actually happened.
- A screenshot if available.

This information usually helps support resolve the issue much faster.

## 4. When To Escalate Immediately

Do not wait if any of these happen:

- The website is down for everyone.
- Money is missing or a user was charged twice.
- A withdrawal was approved but not received.
- Multiple users report the same payment problem.
- The admin system is showing obviously wrong balances.
- You think an account has been accessed without permission.

## 5. What Not To Do

To avoid making the situation worse:

- Do not keep resubmitting the same payment request.
- Do not tell a user to send money again unless support confirms it.
- Do not change settings if you are unsure what they do.
- Do not approve or reject a sensitive request without checking the details first.

## 6. Helpful Reference Points

- If the problem is about users, start in the user management area.
- If the problem is about deposits or withdrawals, start in the payments area.
- If the problem is about suspended accounts, start in the appeals or ban section.
- If the problem is about the whole system, report it as a platform issue.

If you want the technical version of this guide, use [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md). If you want the normal admin workflow, use [OPERATIONS_GUIDE.md](OPERATIONS_GUIDE.md).