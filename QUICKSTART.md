# WhatsApp AI Agent - Quick Start Guide

## 🚀 What's Been Built

A complete full-stack Next.js application with:

✅ **Backend**
- WhatsApp webhook API route (`/api/webhook`) for receiving and sending messages
- OpenAI GPT-4 integration for intelligent responses
- Supabase integration for real-time message storage
- Detailed console logging for debugging

✅ **Frontend**
- Authentication system (Login/Signup pages)
- Real-time dashboard with conversation sidebar
- Message thread view with chat bubbles
- Dark theme UI with Tailwind CSS

✅ **Database**
- Supabase schema with conversations and messages tables
- Row-level security (RLS) policies
- Real-time subscriptions enabled

✅ **Configuration**
- Agent prompt file (AGENT_PROMPT.md)
- Environment variables template (.env.local.example)

## 📋 Quick Setup Checklist

### 1. **Copy Environment Variables**
```bash
cp .env.local.example .env.local
```
⚠️ The .env.local.example file contains placeholder values. Keep them as-is for now, or replace with your actual credentials.

### 2. **Database Setup**
Go to your Supabase project and:
1. Open SQL Editor
2. Copy-paste all content from `supabase/schema.sql`
3. Click "Run" to execute
4. This creates tables and RLS policies for you

### 3. **Configure Meta Webhook** (Optional)
When ready to test with actual WhatsApp:
1. Go to Meta App Dashboard
2. Set Webhook URL to: `https://yourdomain.com/api/webhook`
3. Set Verify Token to: The value in `WHATSAPP_VERIFY_TOKEN`
4. Subscribe to `messages` webhook

### 4. **Run Development Server**
```bash
npm run dev
```
App runs at: http://localhost:3000

## 📁 File Structure Overview

```
app/
├── api/webhook/route.ts              ← WhatsApp webhook handler
├── auth/
│   ├── page.tsx                      ← Login page
│   └── signup/page.tsx               ← Sign up page
├── dashboard/page.tsx                ← Main dashboard
├── components/
│   ├── ConversationsSidebar.tsx      ← Left sidebar
│   └── MessageThread.tsx             ← Message view
├── context/AuthContext.tsx           ← Auth state management
├── lib/
│   ├── supabase.ts                   ← Supabase client
│   ├── openai.ts                     ← OpenAI client
│   ├── whatsapp.ts                   ← WhatsApp utilities
│   └── prompt.ts                     ← Load agent prompt
└── types/index.ts                    ← TypeScript types

supabase/
└── schema.sql                        ← Database schema

AGENT_PROMPT.md                       ← AI behavior definition
.env.local.example                    ← Environment template
```

## 🔑 Environment Variables Explained

```
# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN         - Meta's access token for sending messages
WHATSAPP_PHONE_NUMBER_ID      - Your WhatsApp Business phone number ID
WHATSAPP_VERIFY_TOKEN         - Token for webhook verification (you define this)

# OpenAI
OPENAI_API_KEY                - Your OpenAI API key for GPT-4

# Supabase (Public - safe to expose)
NEXT_PUBLIC_SUPABASE_URL      - Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY - Public anon key for frontend

# Supabase (Secret - server only)
SUPABASE_SERVICE_ROLE_KEY     - Service role key for backend (secure)
```

## 🌊 Data Flow

### WhatsApp Message Flow
```
User sends WhatsApp message
    ↓
Meta sends webhook to /api/webhook (POST)
    ↓
Extract phone number & message text
    ↓
Get/create conversation in Supabase
    ↓
Store user message in database
    ↓
Call OpenAI GPT-4 with system prompt
    ↓
Store AI response in database
    ↓
Send response back via WhatsApp API
```

### Dashboard Flow
```
User logs in → Authenticates with Supabase
    ↓
Dashboard loads conversations (real-time subscription)
    ↓
Click conversation → Load message history
    ↓
New messages → Appear in real-time via websocket
```

## 🔐 Security Features

**Backend:**
- Uses `SUPABASE_SERVICE_ROLE_KEY` (secret) for webhook operations
- Service role bypasses RLS to ensure messages are stored safely
- Detailed logging for debugging in production

**Frontend:**
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public) for client operations
- RLS policies restrict data access by user
- Session automatically managed in cookies

**Database:**
- RLS enabled on all tables
- Service role has full access
- Authenticated users can only read (not modify)

## 🧪 Testing Locally

### Test Authentication
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create account with any email/password
4. You'll be redirected to dashboard

### Test Dashboard (without WhatsApp)
1. Dashboard loads but shows "No conversations yet"
2. This is expected - conversations come from WhatsApp messages
3. Once webhook is configured and messages arrive, they'll appear here

### Test Webhook (when ready)
Use curl or Postman to test:

```bash
# Test webhook verification (GET)
curl "http://localhost:3000/api/webhook?hub.mode=subscribe&hub.verify_token=PIZZA123&hub.challenge=test123"

# Test incoming message (POST)
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "1234567890",
            "text": { "body": "Hello AI!" }
          }]
        }
      }]
    }]
  }'
```

## 📊 Customization Guide

### Customize AI Behavior
Edit `AGENT_PROMPT.md`:
- Change business policies
- Update response tone
- Add new guidelines
- Changes apply immediately on next message

### Customize UI
- Colors: Edit Tailwind CSS classes in components
- Layout: Modify component structure in pages
- Styling: Update `app/globals.css`

### Add Database Fields
1. Edit `supabase/schema.sql`
2. Add new columns to tables
3. Re-run in Supabase SQL editor
4. Update TypeScript types in `app/types/index.ts`

## 🚢 Deployment Steps

### Deploy to Vercel
1. Push code to GitHub
2. Go to vercel.com and connect repo
3. Set environment variables in Vercel dashboard (all from .env.local)
4. Vercel auto-deploys on push

### Update Meta Webhook URL
1. Go to Meta App Dashboard
2. Change webhook URL to: `https://your-vercel-url.vercel.app/api/webhook`
3. Keep verify token the same

## 📝 Important Files

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Database setup - run this first in Supabase |
| `AGENT_PROMPT.md` | AI behavior - edit to customize responses |
| `.env.local` | Environment config - add your credentials here |
| `app/api/webhook/route.ts` | WhatsApp webhook handler - receives messages |
| `app/dashboard/page.tsx` | Main UI - where users view conversations |

## ✅ Verification Checklist

Before deploying to production:

- [ ] `.env.local` has all required variables filled in
- [ ] `supabase/schema.sql` has been run in your Supabase project
- [ ] Supabase RLS policies are enabled (should be automatic from schema)
- [ ] OpenAI API key is valid and has credits
- [ ] WhatsApp credentials are correct
- [ ] `npm run dev` starts without errors
- [ ] Can login and see dashboard at http://localhost:3000/dashboard
- [ ] Dashboard has no TypeScript errors (`npx tsc --noEmit`)

## 🐛 Common Issues & Solutions

### "Cannot find module" errors
- Run `npm install` again
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`

### Database connection fails
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (not anon key)
- Check Supabase project URL is correct
- Verify schema.sql has been executed

### Webhook not receiving messages
- Verify `WHATSAPP_VERIFY_TOKEN` matches Meta Dashboard setting
- Check webhook URL is publicly accessible (not localhost)
- Review logs in Meta App Dashboard

### Messages not showing in dashboard
- Verify realtime is enabled in Supabase (check in schema)
- Check browser console for JavaScript errors
- Verify you're logged in

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Meta WhatsApp API**: https://developers.facebook.com/docs/whatsapp

## 🎯 Next Steps

1. ✅ Fill in `.env.local` with your credentials
2. ✅ Run `npm run dev`
3. ✅ Test login/signup
4. ✅ Run `supabase/schema.sql` in your Supabase project
5. ✅ Configure Meta webhook (when ready)
6. ✅ Test with actual WhatsApp messages
7. ✅ Deploy to Vercel for production

---

**Ready to get started? Run `npm run dev` and visit http://localhost:3000!**
