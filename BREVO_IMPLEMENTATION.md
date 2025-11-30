# Brevo Email Integration - Complete Implementation Guide

## ✅ What's Been Implemented

### 1. **Email Service** (`lib/email.ts`)
- Brevo API client setup
- `sendEmail()` function for single emails
- `sendBulkEmails()` for batch sending
- `isEmailConfigured()` validation helper
- Error handling and logging

### 2. **Email Templates** (`lib/email-templates.ts`)
- Base email wrapper with consistent styling
- Application approved email
- Application rejected email
- More information requested email
- Partner verified email
- Partner rejected email
- Mentor approved email
- Mentor rejected email
- New application notification (for admins)

### 3. **Integration Points**
- ✅ `ApplicationReview.tsx` - Approve/Reject/Request Info
- ✅ `app/api/partners/notify-verification/route.ts` - Partner verification
- ✅ `app/api/admin/mentors/approve/route.ts` - Mentor approval

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Sign Up for Brevo

1. Visit https://www.brevo.com/
2. Click "Sign up free"
3. Complete registration (no credit card needed)
4. Verify your email

### Step 2: Get API Key

1. Log in to Brevo dashboard
2. Go to your name (top right) → **SMTP & API**
3. Scroll to **API Keys**
4. Click **Create a new API key**
5. Name: "Ejidike Production"
6. Copy the key (it starts with `xkeysib-...`)

### Step 3: Verify Sender Email

1. Go to **Senders & IP** → **Senders**
2. Click **Add a new sender**
3. Enter your email address
4. Check your inbox and verify

**Recommended options:**
- Use: `noreply@yourdomain.com` (if you own a domain)
- Or: Your Gmail/work email for testing
- Brevo provides a default sender if you don't have a domain

### Step 4: Install Brevo SDK

```bash
npm install @getbrevo/brevo
```

### Step 5: Configure Environment Variables

Add these to `.env.local`:

```env
# Brevo Email Service
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_FROM_NAME=Ejidike Foundation
```

**Replace with:**
- Your actual API key from Step 2
- Your verified email from Step 3
- Your foundation's name

### Step 6: Run the Migration

You need to create the notifications table (if not already done):

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/create_notifications_table.sql`
3. Copy and paste the content
4. Click **Run**

### Step 7: Test Email Sending

Create a test file `test-email.ts`:

```typescript
import { sendEmail } from './lib/email';

async function testEmail() {
  const result = await sendEmail({
    to: 'your-email@example.com',  // Use your email
    toName: 'Test User',
    subject: 'Test Email from Ejidike Foundation',
    html: '<h1>Hello!</h1><p>This is a test email.</p>',
    text: 'Hello! This is a test email.'
  });

  console.log('Email result:', result);
}

testEmail();
```

Run it:
```bash
npx ts-node test-email.ts
```

Check your inbox (and spam folder) for the test email.

---

## 📧 HOW IT WORKS

### Application Review Flow

When an admin approves/rejects/requests info:

1. **Database Update**: Application status changed
2. **In-App Notification**: Created via `createNotification()`
3. **Email Sent**: Using Brevo via `sendEmail()`
4. **User Notified**: Both in-app (bell icon) and email

### Partner Verification Flow

When admin verifies/rejects partner:

1. **Database Update**: `verification_status` changed
2. **API Call**: `/api/partners/notify-verification` called
3. **In-App Notification**: Created
4. **Email Sent**: Professional HTML template
5. **Partner Notified**: Gets both notifications

### Mentor Approval Flow

When admin approves/rejects mentor application:

1. **Database Update**: Mentor profile created (if approved)
2. **Role Change**: User role updated to 'mentor'
3. **Notifications Sent**: In-app + email
4. **Welcome Process**: Mentor can access mentor portal

---

## 🎨 EMAIL TEMPLATES

All templates include:
- Professional header with foundation branding
- Clear call-to-action buttons
- Responsive design (mobile-friendly)
- Both HTML and plain text versions
- Consistent styling and colors

### Customizing Templates

Edit `lib/email-templates.ts`:

```typescript
// Change colors
const color = '#0070f3';  // Primary blue

// Change app name
const APP_NAME = 'Ejidike Foundation';

// Add your logo
<img src="https://yourdomain.com/logo.png" alt="Logo" />
```

---

## 🔍 TESTING CHECKLIST

### Test Each Notification Type:

- [ ] **Application Approved**
  1. Submit an application as applicant
  2. Login as admin
  3. Approve the application
  4. Check applicant's email inbox
  5. Check in-app notifications

- [ ] **Application Rejected**
  1. Submit application
  2. Reject as admin
  3. Verify email + notification received

- [ ] **More Info Requested**
  1. Submit application
  2. Request more info as admin
  3. Verify email + notification

- [ ] **Partner Verified**
  1. Create partner organization
  2. Verify as admin
  3. Check partner's email

- [ ] **Partner Rejected**
  1. Reject partner organization
  2. Verify email sent

- [ ] **Mentor Approved**
  1. Apply as mentor
  2. Approve as admin
  3. Check mentor's email

- [ ] **Mentor Rejected**
  1. Reject mentor application
  2. Verify email

---

## 📊 MONITORING

### Check Email Delivery

1. **Brevo Dashboard**:
   - Go to **Statistics** → **Email**
   - View delivery rates, opens, clicks
   - Check for bounces or spam reports

2. **Application Logs**:
   - Check server logs for email errors
   - Look for "Email sent successfully" messages
   - Monitor failed sends

3. **User Feedback**:
   - Ask users if they received emails
   - Check spam folder reports
   - Monitor email bounces

---

## 🚨 TROUBLESHOOTING

### Email Not Received

**Check:**
1. ✅ API key is correct in `.env.local`
2. ✅ Sender email is verified in Brevo
3. ✅ Recipient email is valid
4. ✅ Check spam/junk folder
5. ✅ Check Brevo dashboard for send status
6. ✅ Look at server logs for errors

### "Email service not configured" Error

**Fix:**
1. Make sure `.env.local` has all 3 variables:
   - `BREVO_API_KEY`
   - `BREVO_FROM_EMAIL`
   - `BREVO_FROM_NAME`
2. Restart development server: `npm run dev`
3. Verify env variables loaded: `console.log(process.env.BREVO_API_KEY)`

### Emails Going to Spam

**Solutions:**
1. **Verify Domain** (best solution):
   - Go to Brevo → **Domains**
   - Add your domain
   - Add DNS records (SPF, DKIM)
2. **Use Verified Sender**: Make sure sender is verified
3. **Include Unsubscribe Link**: Templates already have this
4. **Avoid Spam Words**: Don't use ALL CAPS, too many exclamation marks

### Daily Limit Reached

**Free tier limits:**
- 300 emails/day
- 9,000 emails/month

**If you hit limit:**
1. Wait until next day (resets at midnight UTC)
2. Consider upgrading to paid plan if needed
3. Implement email digest (batch multiple notifications)

---

## 📈 USAGE STATISTICS

Monitor your email usage:

```bash
# Expected daily volume (initial):
- Application reviews: ~10 emails/day
- Partner verifications: ~5 emails/day
- Mentor approvals: ~3 emails/day
- Admin notifications: ~15 emails/day
---
Total: ~33 emails/day (well under 300 limit)
```

---

## 🔐 SECURITY BEST PRACTICES

1. ✅ **Never commit** `.env.local` to Git
2. ✅ **API key** is only in environment variables
3. ✅ **Validate recipient** emails before sending
4. ✅ **Rate limit** email sending (handled by Brevo)
5. ✅ **Log errors** but not sensitive data

---

## 🎯 NEXT STEPS

Once basic emails are working:

### Phase 1 (Current) ✅
- [x] Application review emails
- [x] Partner verification emails
- [x] Mentor approval emails

### Phase 2 (Next)
- [ ] Email preferences page
- [ ] Notification settings (email vs in-app)
- [ ] Digest emails (daily/weekly summaries)

### Phase 3 (Future)
- [ ] Email templates with images/branding
- [ ] A/B testing email copy
- [ ] Email analytics dashboard
- [ ] Automated reminder emails

---

## 📞 SUPPORT

### Brevo Support
- Documentation: https://developers.brevo.com/
- Support: support@brevo.com
- Status: https://status.brevo.com/

### Common Issues
- API errors: Check Brevo dashboard logs
- Delivery issues: Review email statistics
- Template problems: Test with plain text first

---

## ✨ SUCCESS CRITERIA

Your email system is working when:

1. ✅ Applicants receive approval/rejection emails
2. ✅ Partners receive verification emails
3. ✅ Mentors receive approval emails
4. ✅ Emails arrive within 1 minute
5. ✅ Emails don't go to spam
6. ✅ Both HTML and text versions work
7. ✅ Links in emails work correctly
8. ✅ No error logs for email sending

---

## 🎉 YOU'RE DONE!

Your notification system now includes:
- ✅ Real-time in-app notifications
- ✅ Professional email notifications
- ✅ Beautiful HTML templates
- ✅ Complete user journey coverage
- ✅ Error handling and logging
- ✅ Free forever (up to 300/day)

**Congratulations! Your users will now be properly informed about everything happening in the system!** 🚀
