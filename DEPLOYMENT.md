# 🚀 Deployment Guide

## Prerequisites

Before deploying, make sure you have:
- Git configured with your identity
- A GitHub account
- A Vercel account (free tier)
- An OpenAI API key (optional, for AI image generation)

## Step 1: Configure Git Identity

If you haven't set up Git yet, run these commands:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 2: Create Initial Commit

```bash
cd srf-spiritual-diary
git commit -m "Initial commit: SRF Spiritual Diary - Complete implementation with AI image generation"
```

## Step 3: Create GitHub Repository

### Option A: Using GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `srf-spiritual-diary`
3. Description: "Daily wisdom from Paramahansa Yogananda with AI-generated sacred imagery"
4. Choose Public or Private
5. Don't initialize with README (we already have one)
6. Click "Create repository"

7. Connect your local repo to GitHub:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/srf-spiritual-diary.git
git push -u origin main
```

### Option B: Using GitHub CLI (if installed)

```bash
gh repo create srf-spiritual-diary --public --source=. --remote=origin --push
```

## Step 4: Deploy to Vercel

### Option A: Using Vercel Web Interface (Recommended)

1. Go to https://vercel.com
2. Sign up or log in
3. Click "Add New Project"
4. Import your GitHub repository `srf-spiritual-diary`
5. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Add Environment Variables (Settings → Environment Variables):
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
   - Environment: Production

7. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

When prompted:
- Set up and deploy? `Y`
- Which scope? (select your account)
- Link to existing project? `N`
- Project name: `srf-spiritual-diary`
- In which directory? `./`
- Want to modify settings? `N`

## Step 5: Configure Environment Variables (Vercel Dashboard)

1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add:
   - `OPENAI_API_KEY`: Your OpenAI API key
4. Redeploy the project for changes to take effect

## Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 🔑 Getting API Keys

### OpenAI DALL-E 3
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create new secret key
5. Copy and save it securely (you won't see it again)

**Pricing**: ~$0.04 per 1024x1024 image
**Free Tier**: $5 in free credits for new accounts

### Google Imagen (Optional, Coming Soon)
1. Go to https://console.cloud.google.com/
2. Enable Vertex AI API
3. Create service account and download credentials

## 📊 Monitor Your Deployment

### Vercel Analytics (Free)
- Real-time visitor data
- Page views and performance metrics
- Automatically enabled

### API Usage
- Monitor OpenAI API usage at https://platform.openai.com/usage
- Set up billing alerts to avoid unexpected charges

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Errors
- Verify environment variables are set correctly
- Check API key is valid and has available credits
- Review function logs in Vercel dashboard

### Images Not Generating
- Check browser console for errors
- Verify API endpoint is accessible
- Ensure rate limiting isn't blocking requests

## 🔄 Updating the App

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will automatically deploy the new version!

## 🙏 Success!

Once deployed, your app will be live at:
- `https://your-project.vercel.app`
- Or your custom domain if configured

Share the spiritual wisdom of Paramahansa Yogananda with the world!

**Jai Guru! 🪷**

