# WhatsApp AI Agent - Business Dashboard

A full-stack Next.js application for managing WhatsApp conversations with an AI agent powered by OpenAI GPT-4, featuring a business dashboard for monitoring and managing customer interactions.

## Features

✨ **Core Functionality:**
- Meta WhatsApp webhook integration for receiving and sending messages
- OpenAI GPT-4 integration for intelligent customer support responses
- Supabase integration for real-time conversation and message storage
- Real-time message updates using Supabase webhooks

🔐 **Authentication & Authorization:**
- Supabase email/password authentication
- Cookie-based session management
- RLS policies for secure data access
- Service role key for secure backend operations

🎨 **User Interface:**
- Dark theme business dashboard
- Real-time conversation sidebar with latest messages
- Message thread view with chat bubbles
- Responsive layout optimized for business use
- Clean, modern design with Tailwind CSS

## Project Structure

```
whatsapp-agent/
├── app/
│   ├── api/webhook/          # WhatsApp webhook API endpoints
│   ├── auth/                 # Authentication pages (login, signup)
│   ├── dashboard/            # Main dashboard page
│   ├── components/           # React components
│   │   ├── ConversationsSidebar.tsx
│   │   └── MessageThread.tsx
│   ├── context/              # React context (AuthContext)
│   ├── lib/                  # Utility functions
│   │   ├── supabase.ts       # Supabase client initialization
│   │   ├── openai.ts         # OpenAI client initialization
│   │   ├── whatsapp.ts       # WhatsApp payload parsing & sending
│   │   └── prompt.ts         # Agent prompt loading
│   ├── types/                # TypeScript type definitions
│   ├── layout.tsx            # Root layout with AuthProvider
│   ├── page.tsx              # Root page (redirects to dashboard/auth)
│   └── globals.css           # Global styles
├── supabase/
│   └── schema.sql            # Database schema with RLS policies
├── AGENT_PROMPT.md           # System prompt for the AI agent
├── .env.local.example        # Environment variables template
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
├── next.config.ts            # Next.js configuration
└── README.md                 # This file
```

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key
- Meta/WhatsApp Business Account with API access
- A domain/webhook URL for Meta webhook verification

## Environment Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in your environment variables:**
   ```env
   # WhatsApp Configuration
   WHATSAPP_ACCESS_TOKEN=your_token_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_VERIFY_TOKEN=your_verify_token

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_key

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Database Setup

1. **Create Supabase tables:**
   - Go to your Supabase project SQL editor
   - Run the SQL from `supabase/schema.sql`
   - This creates:
     - `conversations` table with realtime enabled
     - `messages` table with realtime enabled
     - RLS policies for secure access

2. **Enable Realtime:**
   - Both tables have realtime enabled in the schema
   - Frontend will automatically subscribe to new messages

## WhatsApp Webhook Configuration

1. **Set webhook URL in Meta Dashboard:**
   - Go to your Meta App Dashboard
   - Set Webhook URL to: `https://yourdomain.com/api/webhook`
   - Verify Token: The value you set in `WHATSAPP_VERIFY_TOKEN`

2. **Subscribe to Events:**
   - Subscribe to: `messages` and `message_status` webhooks
   - The GET handler will verify the webhook
   - The POST handler will process incoming messages

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Database schema:**
   - Run `supabase/schema.sql` in your Supabase SQL editor

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Usage

### For End Users (WhatsApp)

1. Message the WhatsApp number associated with your business
2. The AI agent will automatically respond with helpful information about:
   - Returns & exchanges policies
   - Shipping information
   - Payment methods
   - Order tracking
   - And more based on the `AGENT_PROMPT.md`

### For Business Users (Dashboard)

1. **Sign Up/Sign In:**
   - Navigate to `http://localhost:3000/auth`
   - Create account or sign in with Supabase credentials

2. **View Conversations:**
   - Dashboard shows all conversations in the sidebar
   - Click any conversation to view the message thread
   - Messages update in real-time

3. **Monitor Interactions:**
   - See all customer/AI message exchanges
   - Track latest customer interactions
   - Real-time notifications of new messages

## API Endpoints

### POST `/api/webhook`
Receives incoming WhatsApp messages from Meta's webhook

**Request Body:**
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "1234567890",
          "text": { "body": "Customer's message" }
        }]
      }
    }]
  }]
}
```

**Processing:**
1. Parses the Meta payload
2. Gets/creates conversation for the phone number
3. Stores user message in database
4. Sends message to OpenAI GPT-4 with system prompt
5. Stores AI response in database
6. Sends response back via WhatsApp

### GET `/api/webhook`
Webhook verification endpoint for Meta

**Query Parameters:**
- `hub.mode`: "subscribe"
- `hub.verify_token`: Your verification token
- `hub.challenge`: Challenge string to echo

**Response:** Echo the challenge string if verification succeeds

## Customizing the Agent

Edit `AGENT_PROMPT.md` to customize the AI agent's behavior:

- Update policies, business information
- Change response tone and personality
- Add new guidelines for customer interactions
- The prompt is loaded at runtime for each request

## Authentication & Security

### Backend Security
- Uses `SUPABASE_SERVICE_ROLE_KEY` for secure database writes
- Service role bypasses RLS for the webhook API
- All API operations logged to console for Vercel debugging

### Frontend Security
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side operations
- RLS policies restrict data access by authenticated user
- Authenticated users can only read conversations and messages
- Session stored in cookies automatically by Supabase

### RLS Policies
- Service role has full access to all tables
- Authenticated users can read conversations and messages
- No authenticated user can modify data
- Data isolation per user account

## Real-time Features

The dashboard uses Supabase Realtime subscriptions:

1. **Conversation Updates:**
   - New conversations appear automatically in sidebar
   - Updated timestamps refresh in real-time

2. **Message Updates:**
   - New messages appear instantly in the thread
   - Both user and assistant messages update in real-time

## Deployment

### To Vercel

1. **Connect your GitHub repository**
2. **Set environment variables in Vercel project settings:**
   - Add all variables from `.env.local.example`
3. **Deploy:**
   - Push to main branch
   - Vercel automatically builds and deploys

### To Other Platforms

- Build: `npm run build`
- Start: `npm start`
- Ensure all environment variables are set
- Update webhook URL in Meta Dashboard to your production domain

## Logging

### Webhook Logging
The webhook API includes detailed console logs for debugging:

```
GET /api/webhook - Webhook verification request
POST /api/webhook - Incoming message
Message received from {phoneNumber}: {message}
Calling OpenAI GPT-4...
AI response generated: {response}
WhatsApp message sent successfully
Webhook processing completed successfully
```

In development, logs appear in terminal. In Vercel, check **Logs** tab.

## Troubleshooting

### Messages not being received
- Verify webhook URL in Meta Dashboard
- Check logs in Vercel for errors
- Verify `WHATSAPP_VERIFY_TOKEN` matches Meta settings
- Ensure phone number is correctly configured

### AI responses not working
- Verify `OPENAI_API_KEY` is valid
- Check OpenAI API usage and limits
- Ensure `AGENT_PROMPT.md` exists in project root
- Check logs for OpenAI errors

### Database errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase is running and accessible
- Verify schema.sql has been executed
- Check RLS policies are enabled

### Realtime not updating
- Verify realtime is enabled in Supabase
- Check browser console for subscription errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct

## Dependencies

- **Next.js 16.1** - React framework
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Supabase JS 2.38** - Backend & realtime
- **OpenAI 4.52** - LLM API
- **Axios 1.6** - HTTP client

## License

This project is provided as-is for educational and business purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review environment variable configuration
3. Check logs in Vercel or terminal
4. Review error messages in browser console


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
