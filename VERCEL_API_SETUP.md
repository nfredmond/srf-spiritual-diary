# 🔑 Setting Up OpenAI API Key in Vercel

## ✅ API Key Configuration

Your OpenAI API key has been configured locally in `.env.local`. Now you need to add it to Vercel for production.

---

## 🚀 Add API Key to Vercel (2 minutes)

### Step 1: Go to Your Vercel Project
1. Visit: **https://vercel.com/dashboard**
2. Click on your project: **srf-spiritual-diary**

### Step 2: Add Environment Variable
1. Click **Settings** (top navigation)
2. Click **Environment Variables** (left sidebar)
3. Click **Add New** button

### Step 3: Enter Your API Key
```
Key:   OPENAI_API_KEY
Value: [Your OpenAI API key starting with sk-proj-...]

Environment: ✓ Production ✓ Preview ✓ Development
```

**Your API key is stored in:** `.env.local` file (local only, not committed to Git)

### Step 4: Save & Redeploy
1. Click **Save**
2. Go to **Deployments** tab
3. Click **⋯** (three dots) on latest deployment
4. Click **Redeploy**
5. Wait 1-2 minutes

---

## ✨ That's It!

Your image generation will now work on the live site!

### Test It:
1. Visit: https://srf-spiritual-diary.vercel.app
2. Click: **"Generate Imagery Based on this Spiritual Diary Entry"**
3. Wait 10-15 seconds
4. Enjoy your AI-generated sacred imagery! 🎨

---

## 💡 How It Works

- **Local Development:** Uses `.env.local` file
- **Production (Vercel):** Uses environment variable you set in Vercel
- **Cost:** ~$0.04 per image
- **Rate Limit:** 10 free images per day per user (with your key, unlimited)

---

## 🐛 Troubleshooting

### "Failed to generate image"
- Check that API key is added in Vercel dashboard
- Make sure you redeployed after adding the key
- Check OpenAI dashboard for credits: https://platform.openai.com/usage

### "Invalid API key"
- Double-check the key in Vercel matches exactly
- No extra spaces before/after the key
- Key should start with `sk-proj-`

### Still not working?
- Check Vercel function logs in dashboard
- Make sure the deployment finished successfully
- Try generating a fresh deployment

---

## 📊 Monitor Usage

Visit: https://platform.openai.com/usage

You can see:
- How many images generated
- Costs per day
- Remaining credits

---

## 🔐 Security

**Your API key is safe! It's:**
- ✅ Not committed to Git (in .gitignore)
- ✅ Stored securely in Vercel
- ✅ Only used server-side (in API routes)
- ✅ Never exposed to users/browsers

---

**Jai Guru! 🪷**
