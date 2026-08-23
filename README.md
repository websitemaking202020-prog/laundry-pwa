# LaundryLink - Smart Laundry Management PWA

A Progressive Web App (PWA) that modernizes laundry business operations by replacing manual WhatsApp communication with automated booking, task management, and real-time notifications.

## 🎯 Features

### For Customers
- **Easy Booking**: Book laundry services with just a few taps
- **Service Options**: Wash & Fold, Wash & Iron, Dry Clean, Iron Only
- **Order Tracking**: Real-time status updates on your orders
- **Push Notifications**: Get notified when your laundry is ready
- **Order History**: View all your past orders

### For Staff
- **Task Management**: View assigned laundry tasks
- **Status Updates**: Mark orders as complete
- **Customer Info**: Access customer contact details
- **Push Notifications**: Get notified of new task assignments

### For Admins
- **Dashboard Overview**: Track all orders, staff, and customers
- **Staff Management**: Add and manage staff members
- **Task Assignment**: Assign orders to available staff
- **Customer Management**: View all registered customers
- **Real-time Statistics**: Monitor business performance

## 🚀 Technology Stack

- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks)
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **Push Notifications**: OneSignal
- **Security**: Cloudflare Turnstile (bot protection)
- **PWA Features**: Service Worker, Web Manifest, Offline Support

## 📋 Setup Instructions

### 1. Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run the `supabase-schema.sql` file
4. Go to **Authentication > Providers** and enable Email provider
5. Copy your project URL and anon key from **Settings > API**
6. Update `js/config.js` with your Supabase credentials

### 2. OneSignal Setup

1. Create a free account at [onesignal.com](https://onesignal.com)
2. Create a new Web Push app
3. Follow the setup wizard for Web Push
4. Copy your App ID
5. Update `js/config.js` with your OneSignal App ID

### 3. Cloudflare Turnstile Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Turnstile section
3. Create a new site
4. Choose "Managed" mode
5. Copy your Site Key
6. Update `js/config.js` with your Turnstile Site Key

### 4. Create Supabase Edge Functions (Optional but Recommended)

For production use, create these Edge Functions:

#### `create-staff-user` function:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { name, email, phone, password } = await req.json()
  
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Create auth user
  const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) throw authError

  // Create profile
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert([{
      id: user.user.id,
      name,
      email,
      phone,
      role: 'staff'
    }])

  if (profileError) throw profileError

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### `send-notification` function:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { userId, title, message } = await req.json()
  
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Deno.env.get('ONESIGNAL_REST_API_KEY')}`
    },
    body: JSON.stringify({
      app_id: Deno.env.get('ONESIGNAL_APP_ID'),
      include_external_user_ids: [userId],
      headings: { en: title },
      contents: { en: message }
    })
  })

  return new Response(JSON.stringify(await response.json()), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 5. Create Initial Admin User

1. Register a new account through the app
2. Find your user ID in Supabase Dashboard > Authentication > Users
3. Run this SQL in Supabase SQL Editor:

```sql
update profiles
set role = 'admin'
where id = 'YOUR-USER-UUID-HERE';
```

### 6. Deploy

#### Option 1: Local Testing
```bash
# Use any local server, for example:
npx serve .
# or
python -m http.server 8000
```

#### Option 2: Deploy to Netlify/Vercel
1. Push code to GitHub
2. Connect repository to Netlify or Vercel
3. Deploy (no build step needed)

#### Option 3: Deploy to GitHub Pages
```bash
# Push to gh-pages branch
git add .
git commit -m "Initial commit"
git push origin main
# Enable GitHub Pages in repository settings
```

## 🎨 Customization

### Branding
- Update colors in `css/styles.css` (CSS variables in `:root`)
- Replace logo SVG in `index.html`
- Create and add icons to `img/` folder (192x192 and 512x512 PNG)

### Service Pricing
- Modify pricing in `js/config.js` under `SERVICE_PRICING`

### Service Types
- Add/remove services in `js/config.js` and update the select dropdown in `index.html`

## 📱 Installing as PWA

### On Android
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home screen"

### On iOS
1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

### On Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Click "Install"

## 🔒 Security Features

- **Cloudflare Turnstile**: Bot protection on login
- **Row Level Security**: Database-level access control
- **Secure Authentication**: Email/password with Supabase Auth
- **HTTPS Required**: Service workers require secure context

## 🐛 Troubleshooting

### Push Notifications Not Working
- Ensure HTTPS is enabled (required for service workers)
- Check OneSignal configuration
- Verify browser permissions are granted

### Real-time Updates Not Working
- Check Supabase real-time is enabled (Project Settings > API)
- Verify network connection
- Check browser console for errors

### Turnstile Not Loading
- Verify site key is correct
- Check domain is whitelisted in Cloudflare
- Test without AdBlockers

## 📄 License

MIT License - feel free to use this for your business!

## 🤝 Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ for modern laundry businesses
