# GameLens x UoB Football - Deployment

## Quick Start

### 1. Prerequisites
- Node.js 20+
- Vercel account
- Supabase project
- GitHub repository

### 2. Environment Setup
```bash
# Copy environment template
cp .env.local.example .env.local

# Fill in your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Local Testing
```bash
# Install dependencies
npm install

# Run local deployment preparation
npm run deploy:local

# Start development server
npm run dev
```

### 4. Deploy to Production
```bash
# Push to main branch (triggers GitHub Actions)
git add .
git commit -m "feat: deploy to production"
git push origin main
```

## Deployment Architecture

```
GitHub Repository
       ↓
GitHub Actions (CI/CD)
       ↓
Vercel (Hosting)
       ↓
Supabase (Database)
```

## Key Features

### ✅ **Automated CI/CD**
- Linting and type checking
- Comprehensive test suite
- Automatic database migrations
- Production data seeding
- Vercel deployment

### ✅ **Security**
- Row Level Security (RLS) policies
- Secure API endpoints
- Environment variable protection
- HTTPS enforcement

### ✅ **Performance**
- Optimized caching headers
- Static asset optimization
- Database query optimization
- CDN distribution

### ✅ **Monitoring**
- Vercel Analytics
- Supabase monitoring
- Error tracking
- Performance metrics

## Scripts

| Script | Description |
|--------|-------------|
| `npm run deploy:local` | Prepare for deployment locally |
| `npm run predeploy` | Run migrations and seed data |
| `npm run seed:production` | Seed production database |
| `npm run migrate` | Run database migrations |

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Optional
- `NEXT_PUBLIC_APP_URL` - Production app URL
- `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` - Vercel analytics ID

## GitHub Secrets

Add these to your GitHub repository secrets:

### Vercel
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Database Schema

The application uses the following key tables:
- `profiles` - User profiles and roles
- `teams` - Football teams
- `players` - Player information
- `attendance` - Daily attendance tracking
- `player_stats` - Player statistics
- `games` - Match information

## Admin Setup

After deployment:
1. First user to sign up becomes admin
2. Admin can invite other coaches
3. Admin manages teams and players
4. Full system access granted

## Monitoring

### Vercel Dashboard
- Deployment status
- Performance metrics
- Error logs
- Analytics data

### Supabase Dashboard
- Database performance
- API usage
- Real-time connections
- Query analytics

## Troubleshooting

### Common Issues
1. **Build Failures**: Check environment variables
2. **Database Errors**: Verify Supabase connection
3. **Authentication Issues**: Check RLS policies
4. **Performance Issues**: Monitor Vercel analytics

### Support
- Check deployment logs in Vercel
- Review GitHub Actions workflow
- Monitor Supabase dashboard
- Check application error logs

## Production URL
Once deployed: `https://your-project-name.vercel.app`

## Documentation
- [Deployment Guide](./DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
