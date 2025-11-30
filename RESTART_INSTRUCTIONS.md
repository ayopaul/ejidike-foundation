# How to Restart and Test

## 🔄 Clean Restart

When you see RSC errors or the app isn't loading properly:

```bash
# 1. Stop the server (Ctrl+C or):
pkill -f "next dev"

# 2. Clear Next.js cache (optional but recommended)
rm -rf .next

# 3. Start fresh
npm run dev
```

## ✅ Test Brevo Email Integration

Now that your API key is correct, test emails:

### **Test 1: Simple Email Test**

1. **Start server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000/api/test-email
   ```

3. **Check response** - should see:
   ```json
   {
     "success": true,
     "message": "✅ Test email sent successfully!"
   }
   ```

4. **Check your email:** `update@ejidikefoundation.com`
   - Check inbox
   - **Check spam/junk folder** (important!)
   - Email should arrive within 1-2 minutes

### **Test 2: Debug Configuration**

Verify your Brevo setup:
```
http://localhost:3000/api/debug-brevo
```

Should show:
```json
{
  "apiKeyDetails": {
    "startsWithXkeysib": "✅ Yes",
    "length": 97
  }
}
```

### **Test 3: Real Application Flow**

1. **As Applicant:**
   - Go to http://localhost:3000/programs
   - Apply to a program
   - Submit application

2. **As Admin:**
   - Go to http://localhost:3000/admin/dashboard/applications
   - Click on the new application
   - Add reviewer notes
   - Click "Approve"

3. **Check Results:**
   - ✅ Applicant gets in-app notification (bell icon)
   - ✅ Applicant gets email to their registered email
   - ✅ Email should be professional with green "Approved" theme

## 🔧 If Browser Still Has Issues

### Clear Browser Cache:

**Chrome/Edge:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Safari:**
1. Develop → Empty Caches
2. Or: Cmd+Option+E

**Firefox:**
1. Ctrl+Shift+Delete
2. Select "Cache"
3. Click "Clear Now"

### Or Use Incognito/Private Window:
- Chrome: Ctrl+Shift+N / Cmd+Shift+N
- Safari: Cmd+Shift+N
- Firefox: Ctrl+Shift+P

## 📊 Monitor Emails in Brevo

Check delivery status:
```
https://app.brevo.com/statistics/email
```

You should see:
- Emails sent count increasing
- Delivery rate (should be 100%)
- Any bounces or errors

## ✅ Success Checklist

- [ ] Server restarted cleanly
- [ ] `/api/debug-brevo` shows correct config
- [ ] `/api/test-email` returns success
- [ ] Email received in inbox (or spam)
- [ ] Admin dashboard loads properly
- [ ] Can approve application
- [ ] Applicant receives email notification
- [ ] Brevo dashboard shows emails sent

## 🚨 Common Issues

### "Failed to fetch RSC payload"
- **Solution:** Hard refresh browser (Ctrl+Shift+R)
- Or: Clear `.next` folder and restart

### "Load failed" errors
- **Solution:** Check if server is actually running
- Kill all Node processes and restart

### Multiple server instances
```bash
# Check for multiple processes
ps aux | grep "next dev"

# Kill all and start fresh
pkill -f "next dev"
npm run dev
```

### Email still not sending
1. Check server console for errors
2. Verify API key in `/api/debug-brevo`
3. Check Brevo dashboard for API errors
4. Regenerate API key if needed

## 🎯 Next Steps After Testing

Once emails work:
1. ✅ Test all notification types
2. ✅ Verify email deliverability
3. ✅ Check spam folder placement
4. ✅ Monitor Brevo statistics
5. ✅ Consider domain verification for better deliverability
