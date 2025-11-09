# Environment Variables Template

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=Brewly
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics
# NEXT_PUBLIC_GA_TRACKING_ID=
```

## Getting Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings > API
4. Copy the `URL` and `anon/public` key

