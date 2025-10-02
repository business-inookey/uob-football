# Deployment Guide - GameLens x UoB Football

This guide covers deploying the GameLens x UoB Football Team Management System to production using Vercel and Supabase.

## Prerequisites

- Vercel account
- Supabase project
- GitHub repository
- Node.js 20+

## 1. Supabase Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and API keys

### Environment Variables
Set these in your Supabase project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 2. Vercel Setup

### Install Vercel CLI
```bash
npm i -g vercel
```

### Deploy to Vercel
```bash
vercel --prod
```

### Environment Variables in Vercel
Add these environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3. GitHub Actions Setup

### Required Secrets
Add these secrets to your GitHub repository:

**Vercel Secrets:**
- `VERCEL_TOKEN` - Get from Vercel dashboard
- `VERCEL_ORG_ID` - Get from Vercel dashboard
- `VERCEL_PROJECT_ID` - Get from Vercel dashboard

**Supabase Secrets:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Workflow
The GitHub Actions workflow will:
1. Run linting and type checking
2. Execute all tests
3. Build the application
4. Run database migrations
5. Seed production data
6. Deploy to Vercel

## 4. Database Setup

### Run Migrations
```bash
npm run migrate
```

### Seed Production Data
```bash
npm run seed:production
```

### Predeploy Setup
```bash
npm run predeploy
```

## 5. First Admin Setup

After deployment:
1. The system creates an admin user invitation
2. First user to sign up will have admin privileges
3. Admin can then invite other coaches and manage teams

## 6. Production Checklist

- [ ] Supabase project created and configured
- [ ] Environment variables set in Vercel
- [ ] GitHub secrets configured
- [ ] Database migrations run
- [ ] Production data seeded
- [ ] Admin user created
- [ ] Domain configured (if custom)
- [ ] SSL certificate active
- [ ] Monitoring set up

## 7. Monitoring

### Vercel Analytics
- Built-in performance monitoring
- Real-time user analytics
- Error tracking

### Supabase Monitoring
- Database performance metrics
- API usage statistics
- Real-time connection monitoring

## 8. Maintenance

### Regular Tasks
- Monitor database performance
- Update dependencies monthly
- Review security logs
- Backup database weekly

### Updates
- Push to main branch triggers automatic deployment
- Database migrations run automatically
- Tests must pass before deployment

## 9. Troubleshooting

### Common Issues
1. **Build Failures**: Check environment variables
2. **Database Errors**: Verify Supabase connection
3. **Authentication Issues**: Check RLS policies
4. **Performance Issues**: Monitor Vercel analytics

### Support
- Check Vercel deployment logs
- Review Supabase dashboard
- Monitor GitHub Actions workflow

## 10. Security

### Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy: restricted

### Caching
- API routes: no-store
- Static assets: 1 year cache
- Dynamic content: no cache

## Production URL
Once deployed, your application will be available at:
`https://your-project-name.vercel.app`

## Admin Access
First admin can sign up and will automatically receive admin privileges to manage the system.
