# Email Service Options - Free & Paid

## ✅ FREE OPTIONS

### 1. **Resend** (RECOMMENDED - Has Free Tier!)
- **Free Tier:** 100 emails/day, 3,000/month
- **Pros:**
  - Modern, developer-friendly API
  - Great React email template support
  - Good deliverability
  - Simple integration
  - Perfect for your current scale
- **Cons:**
  - Need credit card for verification (but won't charge on free tier)
- **Best for:** Most applications, especially Next.js projects

### 2. **SendGrid** (BEST FREE TIER)
- **Free Tier:** 100 emails/day FOREVER (no monthly limit)
- **Pros:**
  - Generous free tier
  - Industry standard
  - Good documentation
  - No credit card required
  - Email validation tools
- **Cons:**
  - More complex setup than Resend
  - Heavier SDK
- **Best for:** If you need truly zero-cost solution

### 3. **MailerSend** (Hidden Gem)
- **Free Tier:** 12,000 emails/month (400/day)
- **Pros:**
  - Most generous free tier
  - Beautiful email templates
  - Email analytics
  - No credit card required
- **Cons:**
  - Less popular (but reliable)
  - Fewer community resources
- **Best for:** Startups needing higher volume

### 4. **Brevo (formerly Sendinblue)**
- **Free Tier:** 300 emails/day
- **Pros:**
  - Good free tier
  - Includes SMS credits
  - Marketing automation features
  - Templates included
- **Cons:**
  - Branding in emails (free tier)
  - More marketing-focused
- **Best for:** If you need marketing emails too

### 5. **Supabase + Nodemailer with Gmail SMTP** (100% FREE)
- **Free Tier:** Unlimited (but Gmail has limits ~500/day)
- **Pros:**
  - Completely free
  - No external service needed
  - Full control
- **Cons:**
  - ⚠️ **NOT RECOMMENDED FOR PRODUCTION**
  - Gmail may flag/block your account
  - Poor deliverability
  - Can end up in spam
  - Gmail OAuth setup is complex
- **Best for:** Development/testing only

### 6. **AWS SES** (Almost Free)
- **Pricing:** $0.10 per 1,000 emails (not free, but ultra-cheap)
- **Free Tier:** 62,000 emails/month if sending from EC2 (not applicable here)
- **Pros:**
  - Extremely cheap
  - High reliability
  - Good deliverability
- **Cons:**
  - AWS account required
  - More complex setup
  - Need to verify domain
- **Best for:** High volume, low cost

---

## 📊 COMPARISON TABLE

| Service | Free Tier | Setup Difficulty | Deliverability | Best For |
|---------|-----------|------------------|----------------|----------|
| **Resend** | 3,000/month | ⭐ Easy | ⭐⭐⭐⭐⭐ | Next.js apps |
| **SendGrid** | 100/day forever | ⭐⭐ Medium | ⭐⭐⭐⭐⭐ | Zero-cost solution |
| **MailerSend** | 12,000/month | ⭐⭐ Medium | ⭐⭐⭐⭐ | Highest free volume |
| **Brevo** | 300/day | ⭐⭐ Medium | ⭐⭐⭐⭐ | Marketing + transactional |
| **Gmail SMTP** | ~500/day | ⭐⭐⭐ Hard | ⭐ Poor | Dev/testing only |
| **AWS SES** | $0.10/1k | ⭐⭐⭐ Hard | ⭐⭐⭐⭐⭐ | High volume |

---

## 🎯 MY RECOMMENDATION FOR YOU

### **Use SendGrid (100% Free, No Credit Card)**

Based on your current scale:
- ~10-50 notifications per day initially
- Need both in-app and email notifications
- Want zero cost to start
- Can scale later if needed

**SendGrid's 100 emails/day is perfect for you and completely free forever.**

---

## 📝 IMPLEMENTATION GUIDE

### Option 1: SendGrid (FREE - Recommended)

#### 1. Sign Up & Get API Key
```bash
# 1. Go to https://sendgrid.com/
# 2. Sign up (no credit card required)
# 3. Verify your email
# 4. Go to Settings > API Keys
# 5. Create API Key with "Full Access"
```

#### 2. Install SendGrid
```bash
npm install @sendgrid/mail
```

#### 3. Add to `.env.local`
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com  # Or use sendgrid-provided email
```

#### 4. Create Email Service (`lib/email.ts`)
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      html,
      text
    });
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error };
  }
}
```

#### 5. Update Notification API
```typescript
// app/api/partners/notify-verification/route.ts
import { sendEmail } from '@/lib/email';

// Replace the TODO section with:
const emailResult = await sendEmail({
  to: partnerProfile.email,
  subject,
  text: message,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${subject}</h2>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <a href="${request.nextUrl.origin}/partner/dashboard"
         style="background: #0070f3; color: white; padding: 12px 24px;
                text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
        Go to Dashboard
      </a>
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        © ${new Date().getFullYear()} Ejidike Foundation. All rights reserved.
      </p>
    </div>
  `
});

if (!emailResult.success) {
  console.error('Failed to send email:', emailResult.error);
}
```

---

### Option 2: MailerSend (12,000/month - Best Free Tier)

#### 1. Sign Up
```bash
# Go to https://www.mailersend.com/
# Sign up (no credit card)
# Verify email
# Get API token from Settings > API Tokens
```

#### 2. Install SDK
```bash
npm install mailersend
```

#### 3. Add to `.env.local`
```env
MAILERSEND_API_KEY=mlsn.xxxxxxxxxxxxxxxxxxxxxxx
MAILERSEND_FROM_EMAIL=noreply@trial-xxxxxxxx.mlsender.net  # Provided by MailerSend
```

#### 4. Create Email Service
```typescript
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  try {
    const sentFrom = new Sender(
      process.env.MAILERSEND_FROM_EMAIL!,
      'Ejidike Foundation'
    );
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(html)
      .setText(text);

    await mailerSend.email.send(emailParams);
    return { success: true };
  } catch (error) {
    console.error('MailerSend error:', error);
    return { success: false, error };
  }
}
```

---

### Option 3: Resend (3,000/month)

#### Setup (Even Simpler)
```bash
npm install resend
```

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  try {
    await resend.emails.send({
      from: 'Ejidike Foundation <noreply@yourdomain.com>',
      to,
      subject,
      html,
      text
    });
    return { success: true };
  } catch (error) {
    console.error('Resend error:', error);
    return { success: false, error };
  }
}
```

---

## 🚀 QUICK START RECOMMENDATION

**Start with SendGrid** because:
1. ✅ 100% free (no credit card)
2. ✅ 100 emails/day is enough for your scale
3. ✅ Easy to set up
4. ✅ Great deliverability
5. ✅ Can scale to paid plan later if needed

**Switch to MailerSend later** if you need more volume (12,000/month free).

---

## 📈 WHEN TO UPGRADE

You'll know it's time to consider paid plans when:
- Sending > 100 emails/day consistently (SendGrid limit)
- Need advanced analytics
- Want custom domain email authentication (DKIM/SPF)
- Need higher delivery guarantees
- Require dedicated IP address

**But for now, free tier is perfect for MVP!**

---

## ⚠️ IMPORTANT NOTES

### Email Verification (All Services)
Most free tiers require you to:
1. Verify your sender email address
2. Add SPF/DKIM records to your domain (optional but recommended)
3. Warm up your sending (start slow, increase gradually)

### Spam Prevention
To avoid spam folder:
- Always include unsubscribe link
- Use verified sender email
- Don't send too many emails at once
- Have clear subject lines
- Include text version (not just HTML)

### Testing in Development
For local testing without using your email quota:
```bash
# Use MailHog (catches emails locally)
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Or use Ethereal Email (fake SMTP for testing)
# https://ethereal.email/
```

---

## 🎁 BONUS: Email Template Library

Use these free React email templates with any service:
- https://react.email/ (works great with Resend)
- https://mjml.io/ (responsive email framework)
- Free templates: https://github.com/leemunroe/responsive-html-email-template
