# Deployment Guide for Vercel

This guide will help you deploy the Rent Management Application to Vercel.

## Prerequisites

- Vercel account
- Google Cloud Console account (for OAuth)
- Supabase database (already configured)

## Step 1: Configure Environment Variables in Vercel

Navigate to your Vercel project settings and add the following environment variables:

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL="your-supabase-database-url"
DIRECT_URL="your-supabase-direct-url"

# Supabase API Keys
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random"
NEXTAUTH_URL="https://your-production-url.vercel.app"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Important Notes:**

- Update `NEXTAUTH_URL` with your actual Vercel production URL
- Consider generating a new `NEXTAUTH_SECRET` for production using: `openssl rand -base64 32`

## Step 2: Configure Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Select your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:

   ```
   https://rent-rftg3b72s-robotics1025s-projects.vercel.app/api/auth/callback/google
   ```

5. Click **Save**

## Step 3: Deploy to Vercel

### Option A: Deploy via Git (Recommended)

1. Push your code to GitHub:

   ```bash
   git add .
   git commit -m "fix: Configure NextAuth for production deployment"
   git push origin main
   ```

2. Vercel will automatically detect the push and start a new deployment

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI (if not already installed):

   ```bash
   npm i -g vercel
   ```

2. Deploy:

   ```bash
   vercel --prod
   ```

## Step 4: Verify Deployment

After deployment completes:

1. **Check Build Logs**: Review the deployment logs in Vercel dashboard for any errors
2. **Test Authentication**:
   - Visit your production URL
   - Try logging in with credentials
   - Try logging in with Google OAuth
3. **Verify Database Connection**: Check that data is being fetched correctly from Supabase

## Troubleshooting

### Build Fails with "Missing environment variables"

- Ensure all required environment variables are set in Vercel project settings
- Check that variable names match exactly (case-sensitive)

### Google OAuth Returns Error

- Verify the redirect URI is correctly configured in Google Cloud Console
- Ensure `NEXTAUTH_URL` matches your production URL exactly
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

### Database Connection Issues

- Verify `DATABASE_URL` is using the Supabase pooler URL
- Check Supabase dashboard for connection limits
- Ensure database is accessible from Vercel's IP ranges

### Session/Authentication Not Working

- Verify `NEXTAUTH_SECRET` is set and is a strong random string
- Check browser console for any CORS or cookie errors
- Ensure `NEXTAUTH_URL` uses `https://` (not `http://`)

## Post-Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] Google OAuth redirect URIs updated
- [ ] Build completes successfully
- [ ] Can log in with credentials
- [ ] Can log in with Google OAuth
- [ ] Dashboard loads correctly
- [ ] Database queries work
- [ ] No console errors in browser

## Security Recommendations

1. **Rotate Secrets**: Generate a new `NEXTAUTH_SECRET` for production
2. **Environment Separation**: Use different OAuth credentials for development and production
3. **Monitor Logs**: Regularly check Vercel logs for any authentication errors
4. **Database Security**: Ensure Supabase RLS (Row Level Security) policies are properly configured
