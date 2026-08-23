# 🔧 TROUBLESHOOTING: Create Account Not Working

## Most Common Issue: Email Confirmation is Enabled

By default, Supabase requires users to confirm their email before they can log in. This is why registration seems to "not work" - it actually works, but you need to check your email!

---

## ✅ QUICK FIX: Disable Email Confirmation (For Testing)

### Step 1: Go to Supabase Dashboard
1. Go to https://supabase.com
2. Select your `laundry-pwa` project
3. Click **Authentication** (left sidebar)
4. Click **Providers**

### Step 2: Configure Email Settings
1. Find **Email** provider
2. Click to expand it
3. Scroll down to **"Confirm email"**
4. **Toggle it OFF** ⬅️ THIS IS THE KEY!
5. Click **Save**

### Step 3: Test Again
1. Go back to your app
2. Try creating an account again
3. ✅ Should work immediately now!

---

## 📧 If You Want to Keep Email Confirmation ON

If you keep email confirmation enabled:
1. Register creates the account
2. User gets email from Supabase
3. User clicks confirmation link
4. Then user can log in

**For testing, it's easier to turn it OFF!**

---

## 🐛 Other Possible Issues

### Issue 1: Environment Variables Not Set
**Check in Vercel:**
1. Vercel Dashboard → Your project
2. Settings → Environment Variables
3. Verify these exist:
   - ✅ `SUPABASE_URL`
   - ✅ `SUPABASE_ANON_KEY`

**If missing:** Add them and redeploy

### Issue 2: SQL Schema Not Run Completely
**Check in Supabase:**
1. Go to **Database** → **Tables**
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `orders`

**If missing:** Go to SQL Editor and re-run `supabase-schema.sql`

### Issue 3: RLS Policies Blocking Insert
**Check in Supabase:**
1. Go to **Database** → **Tables** → **profiles**
2. Click **RLS** tab
3. You should see policies like:
   - "Users can insert their own profile"
   - "Public profiles are viewable by everyone"

**If missing:** Re-run the schema SQL file

### Issue 4: Wrong Supabase Keys
**Verify:**
1. Supabase → Settings → API
2. Copy the **anon public** key (NOT service_role!)
3. Make sure it matches what's in Vercel environment variables

---

## 🧪 How to Test if Supabase is Connected

### Open Browser Console (F12)
When you click "Create Account", you should see in console:
```
Starting registration... {name: "...", email: "...", phone: "..."}
Signup response: {data: {...}, error: null}
Profile creation: {profileError: null}
```

**If you see errors in console:**
- Post the error message
- Check the specific issue above

---

## 💡 Quick Test: Try This User

Try registering with:
- Name: `Test User`
- Email: `test@test.com`
- Phone: `1234567890`
- Password: `test123`

**Then check Supabase:**
1. Authentication → Users
2. You should see `test@test.com` in the list

**If you see it:** Registration IS working! Email confirmation is just blocking login.

---

## 🚨 Emergency: Bypass Everything for Testing

If nothing works, temporarily create a user directly in Supabase:

### Step 1: Create Auth User
1. Supabase → Authentication → Users
2. Click "Add user" → "Create new user"
3. Email: `admin@test.com`
4. Password: `admin123`
5. Click "Create user"

### Step 2: Add Profile
1. Go to SQL Editor
2. Run this (replace the UUID with the one from step 1):
```sql
insert into profiles (id, name, email, phone, role)
values (
    'PASTE-USER-UUID-FROM-AUTH-USERS',
    'Admin User',
    'admin@test.com',
    '1234567890',
    'admin'
);
```

### Step 3: Login
Now try logging in with `admin@test.com` / `admin123`

---

## 📞 Still Not Working?

Tell me:
1. **What error message do you see?** (if any)
2. **What shows in browser console?** (press F12, look for red errors)
3. **Can you see the user in Supabase Authentication → Users?**
4. **Is email confirmation ON or OFF in Supabase?**

I'll help you fix it! 🔧
