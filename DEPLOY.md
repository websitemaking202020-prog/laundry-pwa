# 🚀 SUPER EASY DEPLOYMENT GUIDE

## ✅ What I Changed
- API keys now use environment variables
- You ONLY paste keys into Vercel (I never see them!)
- Completely secure & easy

---

## 📝 STEP 1: Setup Supabase (3 minutes)

1. Go to **https://supabase.com** → Sign up
2. Click "New Project"
   - Name: `laundry-pwa`
   - Password: (make one up, save it)
   - Region: Choose closest to you
3. Wait ~2 minutes for setup
4. Go to **SQL Editor** (left sidebar)
5. Click "New Query"
6. Open `supabase-schema.sql` from the project folder
7. Copy ALL the text → Paste into SQL Editor → Click "Run"
8. Go to **Settings → API**
9. **COPY THESE TWO** (you'll paste them in Vercel):
   - ✅ Project URL
   - ✅ anon public key

---

## 📦 STEP 2: Push to GitHub

```powershell
cd C:\Users\milan\laundry-pwa
git add .
git commit -m "Add environment variables setup"
git push -u origin main
```

(If you haven't created the repo yet, create it on github.com/new first)

---

## 🚀 STEP 3: Deploy to Vercel (2 minutes)

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click "New Project"
3. Import your `laundry-pwa` repository
4. **BEFORE clicking Deploy**, click "Environment Variables"
5. **PASTE YOUR KEYS HERE** (one at a time):

### Add these 4 environment variables:

**Variable 1:**
```
Name: SUPABASE_URL
Value: [PASTE YOUR SUPABASE PROJECT URL]
```

**Variable 2:**
```
Name: SUPABASE_ANON_KEY
Value: [PASTE YOUR SUPABASE ANON KEY]
```

**Variable 3:**
```
Name: ONESIGNAL_APP_ID
Value: skip-for-now
```

**Variable 4:**
```
Name: TURNSTILE_SITE_KEY
Value: 1x00000000000000000000AA
```

6. Click "Deploy"
7. Wait 1-2 minutes
8. **DONE!** Your app is live! 🎉

---

## 👤 STEP 4: Create Admin User (1 minute)

1. Visit your Vercel app URL (they give you one)
2. Click "Create Account" → Register
3. Go back to **Supabase Dashboard** → **Authentication** → **Users**
4. Copy your User ID (the UUID)
5. Go to **SQL Editor** → Paste this:

```sql
update profiles
set role = 'admin'
where id = 'PASTE-YOUR-USER-ID-HERE';
```

6. Click "Run"
7. Log out and log back in → You're now ADMIN! ✅

---

## 🎉 YOU'RE LIVE!

Your app is now deployed and ready to use!

### Next Steps:
- Add staff members through Admin panel
- Test booking a service
- Install as PWA on your phone
- Setup OneSignal later for push notifications (optional)

---

## 🔐 Security Notes

✅ Your API keys are SAFE
✅ Only stored in Vercel (encrypted)
✅ Never committed to GitHub
✅ I never see your keys
✅ Supabase RLS protects your data

---

## 📱 To Install as App:

**On Phone:**
- Android: Chrome → Menu → "Install app"
- iPhone: Safari → Share → "Add to Home Screen"

**On Desktop:**
- Chrome → Address bar → Install icon

---

## ⚙️ To Update Environment Variables Later:

1. Go to **Vercel Dashboard**
2. Select your project
3. Go to **Settings → Environment Variables**
4. Edit any variable
5. Redeploy (it auto-redeploys)

---

## 💡 What's the Build Process?

When Vercel deploys:
1. Reads your environment variables
2. Runs `replace-env.js`
3. Injects variables into `config.js`
4. Serves your app
5. Your keys stay secure! 🔒

---

**ALL DONE! Start deploying! 🚀**
