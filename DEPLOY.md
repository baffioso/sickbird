# Deploying Hospital Finder to Vercel

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier is fine)
- Git repository initialized and pushed to GitHub/GitLab/Bitbucket

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit - Hospital Finder app"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel**

   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Import the `sickbird` repository

3. **Configure Build Settings** (Vercel should auto-detect these)

   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (~1-2 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

   - Follow the prompts to link or create a new project
   - Vercel will auto-detect the Vite configuration

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment

### Environment Variables (Optional)

If you want to secure the API key, you can move it to environment variables:

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_ORS_API_KEY` = `eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJlZDg1OWMyOTQ1MzQyOTA4NmZiOTcwMDIxYWIxYTVhIiwiaCI6Im11cm11cjY0In0=`
3. Update `src/services/routing.ts`:
   ```typescript
   const API_KEY = import.meta.env.VITE_ORS_API_KEY || "fallback-key";
   ```
4. Redeploy

### Custom Domain (Optional)

- In Vercel Dashboard → Your Project → Settings → Domains
- Add your custom domain and follow DNS configuration instructions

## Automatic Deployments

Once connected, every push to your `main` branch will automatically trigger a new deployment.

## Local Preview of Production Build

To test the production build locally before deploying:

```bash
npm run build
npm run preview
```

## Troubleshooting

**Build fails?**

- Check that all dependencies are in `package.json`
- Make sure Node.js version is compatible (v18+ recommended)

**App works locally but not on Vercel?**

- Check browser console for errors
- Ensure environment variables are set if needed
- Verify API keys are valid

**Routes not working?**

- The `vercel.json` file handles SPA routing, ensure it's committed
