# Deployment Checklist - GameLens x UoB Football

## Pre-Deployment Setup

### 1. Supabase Configuration
- [ ] Create new Supabase project
- [ ] Copy project URL and API keys
- [ ] Set up database connection
- [ ] Configure authentication settings
- [ ] Set up Row Level Security (RLS)

### 2. Vercel Configuration
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Set up project settings
- [ ] Configure environment variables
- [ ] Set up custom domain (optional)

### 3. Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (production URL)

### 4. GitHub Secrets
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

## Deployment Process

### 1. Database Setup
- [ ] Run migrations: `npm run migrate`
- [ ] Seed initial data: `npm run seed:production`
- [ ] Verify database structure
- [ ] Test RLS policies

### 2. Application Build
- [ ] Run linting: `npm run lint`
- [ ] Type checking: `npm run typecheck`
- [ ] Run tests: `npm run test:run`
- [ ] Build application: `npm run build`

### 3. Deployment
- [ ] Push to main branch
- [ ] Monitor GitHub Actions workflow
- [ ] Verify Vercel deployment
- [ ] Test production URL

## Post-Deployment Verification

### 1. Application Testing
- [ ] Login functionality works
- [ ] Navigation menu displays
- [ ] Dashboard loads correctly
- [ ] All pages accessible
- [ ] Mobile responsiveness

### 2. Database Testing
- [ ] Can create teams
- [ ] Can add players
- [ ] Can record attendance
- [ ] Can enter stats
- [ ] RLS policies working

### 3. Admin Setup
- [ ] First admin can sign up
- [ ] Admin has full system access
- [ ] Can invite other coaches
- [ ] Can manage teams and players

### 4. Performance Testing
- [ ] Page load times acceptable
- [ ] API response times good
- [ ] Database queries optimized
- [ ] No memory leaks

## Security Verification

### 1. Authentication
- [ ] Login/logout works
- [ ] Session management correct
- [ ] Password reset functional
- [ ] Magic link authentication

### 2. Authorization
- [ ] RLS policies enforced
- [ ] Users can only access their data
- [ ] Admin privileges working
- [ ] Coach permissions correct

### 3. Data Protection
- [ ] Sensitive data encrypted
- [ ] API endpoints secured
- [ ] No data leakage
- [ ] Proper error handling

## Monitoring Setup

### 1. Vercel Analytics
- [ ] Analytics enabled
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] Real-time metrics available

### 2. Supabase Monitoring
- [ ] Database metrics visible
- [ ] API usage tracked
- [ ] Connection monitoring active
- [ ] Query performance monitored

## Maintenance Tasks

### 1. Regular Monitoring
- [ ] Check application uptime
- [ ] Monitor database performance
- [ ] Review error logs
- [ ] Check user feedback

### 2. Updates
- [ ] Update dependencies monthly
- [ ] Review security patches
- [ ] Test new features
- [ ] Backup database regularly

## Rollback Plan

### 1. Emergency Procedures
- [ ] Vercel rollback process documented
- [ ] Database backup strategy
- [ ] Environment variable backup
- [ ] Contact information for support

### 2. Recovery Steps
- [ ] Restore from backup
- [ ] Redeploy previous version
- [ ] Verify functionality
- [ ] Notify users of issues

## Success Criteria

- [ ] Application deployed successfully
- [ ] All tests passing
- [ ] Database properly configured
- [ ] Admin user created
- [ ] Production URL accessible
- [ ] Performance metrics acceptable
- [ ] Security measures in place
- [ ] Monitoring active
- [ ] Documentation complete

## Production URL
Once deployed, the application will be available at:
`https://your-project-name.vercel.app`

## Support Contacts
- Technical Lead: [Your Name]
- Database Admin: [Database Admin]
- DevOps: [DevOps Contact]
- Emergency Contact: [Emergency Contact]
