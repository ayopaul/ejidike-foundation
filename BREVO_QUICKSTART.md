# Brevo Email Service - Quick Start Guide

## 🎯 What You Get

With Brevo integrated, your platform now sends **both in-app AND email notifications** for:

✅ **Applicants:**
- Application approved
- Application rejected
- More information requested

✅ **Partners:**
- Organization verified
- Organization rejected

✅ **Mentors:**
- Mentor application approved
- Mentor application rejected

---

## ⚡ 5-Minute Setup

### 1. Sign Up for Brevo (2 minutes)

1. Go to https://www.brevo.com/
2. Click "Sign up free" (no credit card needed!)
3. Verify your email address

### 2. Get Your API Key (1 minute)

1. Login to Brevo dashboard
2. Click your name (top right) → **SMTP & API**
3. Scroll to **API Keys**
4. Click **Create a new API key**
5. Name it "Ejidike Production"
6. **Copy the key** (starts with `xkeysib-...`)

### 3. Verify Sender Email (1 minute)

1. Go to **Senders & IP** → **Senders**
2. Click **Add a new sender**
3. Enter your email (e.g., `noreply@yourdomain.com` or your Gmail)
4. Check inbox and click verification link

### 4. Install Dependencies (30 seconds)

```bash
cd /Users/ayopaul/Documents/Ejidike/ejidike-foundation/ejidike-foundation
npm install @getbrevo/brevo
```

### 5. Configure Environment (30 seconds)

Open `.env.local` and update these values (already added to file):

```env
BREVO_API_KEY=xkeysib-your-actual-api-key-here
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_FROM_NAME=Ejidike Foundation
```

Replace:
- `xkeysib-...` with your actual API key from Step 2
- `noreply@yourdomain.com` with your verified email from Step 3

### 6. Restart Server

```bash
npm run dev
```

---

## ✅ Testing (5 minutes)

### Test 1: Application Approval Email

1. **As Applicant:**
   - Go to http://localhost:3000/programs
   - Apply to a program
   - Fill out the form and submit

2. **As Admin:**
   - Go to http://localhost:3000/admin/dashboard/applications
   - Click on the new application
   - Add reviewer notes
   - Click "Approve"

3. **Check Email:**
   - Open the applicant's email inbox
   - You should receive a professional approval email
   - Also check in-app notifications (bell icon)

### Test 2: Partner Verification Email

1. **As Partner:**
   - Sign up as partner
   - Go to http://localhost:3000/partner/organization
   - Fill out organization details
   - Click "Save Changes"

2. **As Admin:**
   - Go to http://localhost:3000/admin/partners
   - Click on the pending partner
   - Click "Verify Partner"

3. **Check Email:**
   - Partner should receive verification email
   - Check in-app notification too

---

## 🔍 Verification Checklist

After setup, verify:

- [ ] `.env.local` has all 3 Brevo variables filled
- [ ] API key starts with `xkeysib-`
- [ ] Sender email is verified in Brevo dashboard
- [ ] Server restarted (`npm run dev`)
- [ ] Test email received successfully
- [ ] Email not in spam folder
- [ ] In-app notification also appears

---

## 📊 What's Included

### Email Templates (8 Professional Templates)

1. **Application Approved** - Celebration email with green checkmark
2. **Application Rejected** - Professional rejection with feedback
3. **More Info Requested** - Clear action required message
4. **Partner Verified** - Welcome to partner network
5. **Partner Rejected** - Polite rejection
6. **Mentor Approved** - Welcome to mentorship
7. **Mentor Rejected** - Graceful decline
8. **Admin: New Application** - Alert for admins

All templates include:
- Professional header with branding
- Color-coded based on type (success, warning, error)
- Clear call-to-action buttons
- Mobile-responsive design
- Plain text fallback
- Unsubscribe footer

### Files Created

```
lib/
├── email.ts                 # Brevo email service
└── email-templates.ts       # All 8 email templates

app/api/
├── partners/notify-verification/route.ts  # Updated with Brevo
└── admin/mentors/approve/route.ts         # Updated with Brevo

components/
└── admin/ApplicationReview.tsx            # Updated with emails

.env.local                   # Added Brevo config (fill in your keys)
```

---

## 🚨 Troubleshooting

### "Email service not configured" error

**Fix:**
```bash
# Check your .env.local has these lines:
BREVO_API_KEY=xkeysib-...
BREVO_FROM_EMAIL=your@email.com
BREVO_FROM_NAME=Ejidike Foundation

# Restart server
npm run dev
```

### Email not received

**Check:**
1. Spam/junk folder
2. Brevo dashboard → Statistics → Check delivery status
3. Server logs for errors
4. Sender email is verified in Brevo

### Emails going to spam

**Solutions:**
1. Verify your domain in Brevo (add DNS records)
2. Use a verified sender email
3. Warm up sending (start with few emails, increase gradually)

---

## 📈 Free Tier Limits

Brevo Free Plan:
- **300 emails/day**
- **9,000 emails/month**
- **Unlimited contacts**
- **All features included**

Your expected usage:
- ~30-50 emails/day initially
- Well under the free limit ✅

---

## 🎨 Customizing Email Templates

Edit `lib/email-templates.ts`:

```typescript
// Change colors
const color = '#0070f3';  // Your brand color

// Change company name
const APP_NAME = 'Your Foundation Name';

// Add logo
<img src="https://yoursite.com/logo.png" alt="Logo" />
```

---

## 📚 Full Documentation

For detailed guides, see:

1. **BREVO_SETUP_GUIDE.md** - Step-by-step setup instructions
2. **BREVO_IMPLEMENTATION.md** - Complete technical documentation
3. **EMAIL_SERVICE_OPTIONS.md** - Comparison of all email services
4. **NOTIFICATION_GAPS_ANALYSIS.md** - Future notification improvements

---

## ✨ Success!

You now have a complete notification system with:
- ✅ Real-time in-app notifications
- ✅ Professional email notifications
- ✅ Beautiful HTML templates
- ✅ 100% free (up to 300/day)
- ✅ Complete user journey coverage

**Your users will love being kept in the loop!** 🎉

---

## 🆘 Need Help?

- Brevo Support: https://help.brevo.com/
- Brevo Status: https://status.brevo.com/
- API Docs: https://developers.brevo.com/

For implementation questions, check the detailed guides above or review the code in:
- `lib/email.ts`
- `lib/email-templates.ts`
