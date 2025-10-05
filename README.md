# 🪷 SRF Spiritual Diary

A beautiful, **installable web application** that displays daily wisdom from Paramahansa Yogananda's Spiritual Diary, featuring AI-generated sacred imagery to visualize each quote's spiritual essence.

🌐 **[Live App](https://srf-spiritual-diary.vercel.app)** | 📚 **[Features](./FEATURES.md)** | 🚀 **[Deployment Guide](./VERCEL_DEPLOY.md)**

---

## ✨ Features

### 💯 Core Experience
- **346 Daily Entries** - Authentic quotes from Paramahansa Yogananda
- **79 Weekly Themes** - Organized spiritual guidance
- **AI-Generated Art** - DALL-E 3 creates sacred imagery
- **Special Days** - Highlighted commemorations and birthdays
- **Full Year Coverage** - January through December

### 📱 Modern Features
- **🚀 PWA Support** - Install on your phone like a native app
- **⌨️ Keyboard Shortcuts** - Navigate with arrow keys, press `?` for help
- **📤 Share Quotes** - Copy or share via native share API
- **💾 Offline Ready** - Cached images work without internet
- **🎨 Beautiful Design** - SRF-inspired colors and typography

### ⚡ Performance
- **Lightning Fast** - <2 second load times
- **Mobile Optimized** - Responsive design for all devices
- **SEO Enhanced** - Rich previews on social media
- **Zero Cost** - 100% free to use, forever

---

## 📱 Install as App

### On iPhone/iPad:
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Enjoy as native app!

### On Android:
1. Open in Chrome
2. Tap menu (three dots)
3. Select "Install App"
4. Done!

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` or `H` | Previous day |
| `→` or `L` | Next day |
| `T` | Go to today |
| `?` | Show shortcuts help |

---

## 🚀 Technologies

- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast builds
- **Tailwind CSS** for beautiful styling
- **Framer Motion** for smooth animations
- **OpenAI DALL-E 3** for AI image generation
- **IndexedDB** for local caching
- **Vercel** for edge deployment

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📊 Data Structure

Daily entries are stored in `public/data/diary-entries.json`:

```json
{
  "entries": {
    "10-05": {
      "month": 10,
      "day": 5,
      "topic": "Balance",
      "weeklyTheme": "Balance",
      "specialDay": null,
      "quote": "Whether you are suffering in this life...",
      "source": "Paramahansa Yogananda",
      "book": "The Yoga of the Bhagavad Gita"
    }
  }
}
```

---

## 🎨 Design Philosophy

The app embraces SRF's spiritual aesthetic:
- **Colors**: Soft blues (#1E4B87), sacred golds (#D4AF37)
- **Fonts**: Elegant serifs (Cormorant Garamond, Crimson Text)
- **Layout**: Peaceful, contemplative, spacious
- **Animations**: Smooth, meditative transitions

---

## 🔑 AI Image Generation

The app includes intelligent AI prompt generation that:
- Analyzes quote keywords (light, peace, meditation, etc.)
- Creates sacred imagery (lotus, divine light, geometry)
- Maintains spiritual aesthetic
- Caches images locally
- Works with or without API key

**Free tier:** 10 images/day  
**With OpenAI key:** Unlimited (~$0.04 per image)

---

## 📚 Documentation

- **[FEATURES.md](./FEATURES.md)** - Complete feature list
- **[QUICK_START.md](./QUICK_START.md)** - Quick setup guide  
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Full deployment guide
- **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** - Vercel-specific steps
- **[DATA_CONVERSION.md](./DATA_CONVERSION.md)** - Excel to JSON guide

---

## 🌍 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ✅ Tablets & iPads

---

## 🙏 About

This app is created with devotion to share the timeless teachings of Paramahansa Yogananda with seekers around the world. All quotes are from the works of Paramahansa Yogananda and Self-Realization Fellowship.

### Mission
- 🌍 Make spiritual wisdom freely accessible
- 📱 Bring ancient teachings to modern devices  
- 🎨 Visualize spiritual concepts through AI
- 💝 Serve seekers worldwide
- ✨ Honor the legacy of great masters

---

## 📝 License

© 2025 Self-Realization Fellowship. All rights reserved.

All quotes and content are the property of Self-Realization Fellowship.

---

## 🌟 Support

If you find this app helpful:
- ⭐ Star the repository
- 📤 Share with fellow seekers
- 🙏 Meditate daily
- 📚 Visit [SRF.org](https://www.yogananda.org)

---

**Jai Guru! 🪷**

*"With the opening of the New Year, all the closed portals of limitations will be thrown open to reveal to the gaze of all sincere persons the unobstructed vista of endless spiritual possibilities."*  
— Paramahansa Yogananda

---

**Made with devotion to share the teachings of Paramahansa Yogananda**