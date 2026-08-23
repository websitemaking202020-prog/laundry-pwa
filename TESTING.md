# 🧪 TESTING GUIDE - Setup OneSignal & Turnstile

## 🔔 OneSignal Setup (Push Notifications) - 5 minutes

### Step 1: Create Account
1. Go to **https://onesignal.com**
2. Sign up (free account)
3. Click "New App/Website"

### Step 2: Configure Web Push
1. **Platform:** Select "Web"
2. **Configuration:** Choose "Typical Site"
3. **Site URL:** 
   - For Vercel: `https://your-app.vercel.app`
   - For testing: `http://localhost:8000`
4. **Auto Resubscribe:** Toggle ON
5. **Default Notification Icon:** Upload or skip
6. Click "Save"

### Step 3: Get Your App ID
1. After setup, go to **Settings** → **Keys & IDs**
2. Copy your **OneSignal App ID** (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
3. Save it!

### Step 4: Add to Vercel
1. Go to Vercel → Your project → **Settings** → **Environment Variables**
2. Add new variable:
   ```
   Name: ONESIGNAL_APP_ID
   Value: [PASTE YOUR APP ID HERE]
   ```
3. Redeploy

### ✅ Testing Push Notifications
1. Open your deployed app
2. Allow notifications when prompted
3. Register as customer
4. Admin assigns task → Staff gets notification! 🔔
5. Staff completes → Customer gets notification! 🔔

---

## 🔒 Cloudflare Turnstile Setup (Bot Protection) - 3 minutes

### Step 1: Access Turnstile
1. Go to **https://dash.cloudflare.com**
2. Sign up/login (free account)
3. In sidebar, find **Turnstile**

### Step 2: Create Site
1. Click **"Add Site"**
2. **Site name:** LaundryLink
3. **Domain:** 
   - For Vercel: `your-app.vercel.app`
   - For testing: `localhost`
4. **Widget Mode:** Choose **"Managed"** (recommended)
5. Click **"Create"**

### Step 3: Get Site Key
1. Copy the **Site Key** (starts with `0x...`)
2. Save it!

### Step 4: Add to Vercel
1. Go to Vercel → Your project → **Settings** → **Environment Variables**
2. Add new variable:
   ```
   Name: TURNSTILE_SITE_KEY
   Value: [PASTE YOUR SITE KEY HERE]
   ```
3. Redeploy

### 🧪 For Testing ONLY
Use Cloudflare's test key (always passes):
```
TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

---

## 📋 Complete Environment Variables Checklist

In Vercel, you should have these 4 variables:

✅ **SUPABASE_URL** (Required)
   - From: supabase.com → Your Project → Settings → API
   - Example: `https://xxxxxxxxxxxxx.supabase.co`

✅ **SUPABASE_ANON_KEY** (Required)
   - From: supabase.com → Your Project → Settings → API → anon public
   - Example: Long string starting with `eyJ...`

✅ **ONESIGNAL_APP_ID** (Optional but recommended)
   - From: onesignal.com → Settings → Keys & IDs
   - Example: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Leave blank if skipping notifications

✅ **TURNSTILE_SITE_KEY** (Optional)
   - From: dash.cloudflare.com → Turnstile
   - Example: `0x4AAAAAAAxxxxxxxxxxxxxxxxx`
   - Use test key for development: `1x00000000000000000000AA`

---

## 🧪 Testing Workflow

### Test 1: Registration & Login
1. Open app → Click "Create Account"
2. Fill form → Register
3. Should see success message
4. Login with same credentials
5. ✅ Should see Customer Dashboard

### Test 2: Book Service
1. As customer, go to "New Order" tab
2. Select service type
3. Enter weight and pickup time
4. Submit
5. ✅ Should see success + order in "My Orders"

### Test 3: Admin Features
1. Make yourself admin (see DEPLOY.md)
2. Login as admin
3. ✅ Should see admin dashboard with statistics
4. Go to "Staff" → Add staff member
5. Go to "Orders" → Assign order to staff

### Test 4: Push Notifications (if OneSignal configured)
1. Open app in 2 browsers:
   - Browser 1: Login as admin
   - Browser 2: Login as staff
2. In Browser 1: Assign an order to staff
3. ✅ Browser 2 should get push notification!

### Test 5: Staff Workflow
1. Login as staff member
2. ✅ See assigned task in "My Tasks"
3. Click "Mark Complete"
4. ✅ Customer gets notification (if configured)

### Test 6: PWA Install
1. On mobile: Chrome → Menu → "Install app"
2. ✅ Should add icon to home screen
3. Open from home screen
4. ✅ Should look like native app

---

## 🐛 Troubleshooting

### OneSignal not working?
- ✅ Check App ID is correct in environment variables
- ✅ Must use HTTPS (Vercel provides this automatically)
- ✅ Allow notifications when browser prompts
- ✅ Check browser console for errors (F12)
- ✅ Verify site URL matches in OneSignal settings

### Turnstile not showing?
- ✅ Check site key is correct
- ✅ For localhost testing, use test key: `1x00000000000000000000AA`
- ✅ Disable ad blockers
- ✅ Clear browser cache
- ✅ Domain in Cloudflare must match your deployment URL

### Registration failing?
- ✅ Check Supabase URL and key are correct
- ✅ Verify `supabase-schema.sql` was run completely
- ✅ Check Supabase logs: Dashboard → Logs
- ✅ Disable email confirmation: Supabase → Authentication → Providers → Email

### Notifications not sending?
- ✅ User must allow browser notifications
- ✅ OneSignal App ID must be in environment variables
- ✅ Must be on HTTPS (or localhost)
- ✅ Check OneSignal dashboard → Delivery → Failed Notifications

---

## 🎯 Quick Test Credentials Setup

After deploying, create these test users:

**Admin:**
- Email: `admin@test.com`
- Password: `admin123`
- Role: admin (set via SQL)

**Staff:**
- Email: `staff@test.com`
- Password: `staff123`
- Role: staff (via admin panel)

**Customer:**
- Email: `customer@test.com`
- Password: `customer123`
- Role: customer (auto-assigned)

---

## 📱 Testing Push Notifications Without App

Use OneSignal's test feature:
1. Go to OneSignal Dashboard
2. Click "Messages" → "New Push"
3. Select "Send to Test Device"
4. Your browser should get notification!

---

## ✅ When Everything Works

You should see:
- ✅ Login works smoothly
- ✅ Turnstile appears on login (invisible challenge)
- ✅ Registration creates customer account
- ✅ Orders can be created
- ✅ Admin can assign tasks
- ✅ Staff receives notification
- ✅ Real-time updates work
- ✅ PWA can be installed
- ✅ App works offline (limited)

---

## 🚀 Production Checklist

Before going live:
- ✅ All environment variables set
- ✅ OneSignal configured with real domain
- ✅ Turnstile configured with real domain
- ✅ Email confirmation enabled (Supabase)
- ✅ Admin account created
- ✅ Staff members added
- ✅ Test all workflows
- ✅ Install as PWA on phone
- ✅ Train staff (5 minutes!)

---

**Need help? Check console logs (F12) for detailed error messages!**
