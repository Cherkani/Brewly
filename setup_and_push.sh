#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo '✅ Environment variables loaded'
else
    echo '❌ .env file not found'
    exit 1
fi

# Check if token is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ] || [ "$SUPABASE_ACCESS_TOKEN" = "your_access_token_here" ]; then
    echo '❌ SUPABASE_ACCESS_TOKEN not set. Get it from: https://app.supabase.com/account/tokens'
    exit 1
fi

echo '🔗 Linking project...'
supabase link --project-ref qlvhqgtjqfdfpjordits

echo '🚀 Pushing migrations...'
supabase db push

echo '✅ Done! Test with: node test_signup.js'
