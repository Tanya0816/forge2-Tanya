# Deployment Guide - PulseDesk

This document describes how to deploy PulseDesk to production.

## Architecture

- **Frontend**: React 19 + Vite deployed on Vercel
- **Backend**: Node.js + Express + SQLite deployed on Railway

## Deployment Prerequisites

- Vercel account (free tier)
- Railway account (free tier)
- GitHub repository with the code

## Backend Deployment (Railway)

1. Push your code to GitHub

2. Go to [railway.app](https://railway.app) and create a new project

3. Click "Deploy from GitHub repo" and select your repository

4. Railway will automatically detect the Node.js project and use the `railway.json` configuration

5. Configure environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `JWT_SECRET`: Generate a strong random string (use: `openssl rand -base64 32`)

6. Railway will:
   - Install dependencies
   - Run database migrations (`npm run migrate`)
   - Seed the database (`npm run seed`)
   - Start the server (`npm start`)

7. Once deployed, Railway will provide a URL like:
   `https://pulsedesk-backend-production.up.railway.app`

8. Important: Railway provides persistent storage for the SQLite database via volume mounts configured in `railway.json`

## Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) and log in

2. Click "Add New" → "Project"

3. Import your GitHub repository

4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`

5. Add environment variable:
   - `VITE_API_URL`: Your Railway backend URL (e.g., `https://pulsedesk-backend-production.up.railway.app`)

6. Click "Deploy"

7. Vercel will build and deploy your frontend, providing a URL like:
   `https://pulsedesk.vercel.app`

## Post-Deployment Steps

1. Update CORS settings (if needed):
   - The backend already allows all origins with `cors()`
   - For production, you may want to restrict to your Vercel domain

2. Test the deployed application:
   - Access the frontend URL
   - Try logging in with seeded credentials:
     - Admin: `admin@acme.com` / `password123`
     - Agent: `agent1@acme.com` / `password123`
     - Customer: `customer1@acme.com` / `password123`

3. Monitor Railway logs for any errors

4. Set up Railway's automatic deployments from your main branch

## Environment Variables Reference

### Backend (Railway)
```
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate-strong-secret>
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend-app.up.railway.app
```

## Domain Configuration (Optional)

### Custom Domain for Railway
1. Go to Railway project settings
2. Click "Domains"
3. Add your custom domain (e.g., `api.pulsedesk.com`)
4. Update DNS records as instructed

### Custom Domain for Vercel
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain (e.g., `pulsedesk.com`)
4. Update DNS records as instructed

## Scaling Considerations

- **SQLite Limitations**: Railway's SQLite volume is good for development and small-scale production. For larger scale, consider migrating to PostgreSQL (Railway supports it natively)
- **Backend Scaling**: Railway automatically scales based on traffic
- **Frontend**: Vercel provides global CDN with automatic scaling
- **Database Migrations**: Ensure you test migrations locally before deploying

## Monitoring

- **Railway**: View logs, metrics, and deployment history in the Railway dashboard
- **Vercel**: View analytics, build logs, and deployment history in the Vercel dashboard

## Troubleshooting

### Backend Issues
- Check Railway logs for errors
- Verify environment variables are set correctly
- Ensure JWT_SECRET is configured

### Frontend Issues
- Check Vercel build logs
- Verify VITE_API_URL points to correct backend
- Check browser console for API errors

### Database Issues
- Railway provides persistent storage, but verify migrations ran successfully
- Check that the seed script populated initial data
- You can access the Railway shell to inspect the database

## Cost Estimates (Free Tiers)

- **Railway**: Free tier includes:
  - 512MB RAM
  - 1GB persistent storage
  - 500 hours execution time/month

- **Vercel**: Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - 6,000 minutes execution time/month

Both free tiers are suitable for development and small production use cases.