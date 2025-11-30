# Brevo (Sendinblue) Setup Guide

## Why Brevo is Great for You

- ✅ **300 emails/day** free tier
- ✅ **No credit card** required
- ✅ **Email templates** included
- ✅ **SMS credits** included (100 free)
- ✅ **Marketing automation** (if you need it later)
- ✅ **Good deliverability**
- ✅ **Easy-to-use dashboard**

## Step 1: Sign Up for Brevo

1. Go to https://www.brevo.com/
2. Click "Sign up free"
3. Fill in your details:
   - Email: your work email
   - Password: create strong password
   - Company name: Ejidike Foundation
4. Verify your email address
5. Complete the onboarding (select "Transactional Emails" as primary use case)

## Step 2: Get Your API Key

1. Log in to Brevo dashboard
2. Click your name (top right) → **SMTP & API**
3. Scroll to **API Keys** section
4. Click **Create a new API key**
5. Name it: "Ejidike Production"
6. Copy the API key (starts with `xkeysib-...`)
7. **IMPORTANT:** Save it somewhere safe - you can't see it again!

## Step 3: Verify Your Sender Email

1. Go to **Senders & IP** → **Senders**
2. Click **Add a new sender**
3. Add your email (e.g., noreply@yourdomain.com or your Gmail)
4. Brevo will send a verification email
5. Click the verification link

**Note:** Until you verify a domain, you can use the Brevo-provided sender address.

## Step 4: (Optional) Set Up Custom Domain

For better deliverability and professional emails:

1. Go to **Senders & IP** → **Domains**
2. Click **Add a domain**
3. Enter your domain (e.g., ejidike.org)
4. Add the DNS records they provide to your domain registrar:
   - SPF record
   - DKIM record
   - DMARC record (optional)
5. Wait for verification (can take up to 48 hours)

**For now, skip this and use the verified sender email from Step 3.**

## Step 5: Install Brevo SDK

```bash
cd /Users/ayopaul/Documents/Ejidike/ejidike-foundation/ejidike-foundation
npm install @getbrevo/brevo
```

## Step 6: Add Environment Variables

Add to `.env.local`:

```env
# Brevo (Sendinblue) Configuration
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxx
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_FROM_NAME=Ejidike Foundation
```

Replace with your actual values from Steps 2 and 3.

## Step 7: Test Your Setup

1. Go to Brevo dashboard
2. Navigate to **Email** → **Transactional emails**
3. Click **Send a test email**
4. Send to your email address
5. Check if you receive it (check spam folder too)

If successful, you're ready to integrate! 🎉

---

## Troubleshooting

### Email not arriving?
- Check spam/junk folder
- Verify sender email is verified in Brevo
- Check daily quota (300/day on free tier)
- Review error logs in Brevo dashboard

### API key not working?
- Make sure it's copied correctly (no extra spaces)
- Verify it has "Full Access" permissions
- Regenerate if needed

### Domain verification failing?
- DNS changes can take 24-48 hours
- Use DNS checker: https://mxtoolbox.com/
- For now, just use verified sender email

---

## Next Steps

Once setup is complete:
1. ✅ Create email service helper (`lib/email.ts`)
2. ✅ Create email templates (`lib/email-templates.ts`)
3. ✅ Update notification APIs to send emails
4. ✅ Test with real notifications
