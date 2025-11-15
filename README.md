# 🪷 SRF Spiritual Diary **v2.2** ✨

A **comprehensive spiritual companion app** featuring daily wisdom from Paramahansa Yogananda, with advanced search, personal notes, meditation timer, achievements, analytics, and AI-generated sacred imagery.

🌐 **[Live App](https://srf-spiritual-diary.vercel.app)** | 📚 **[What's New](./MAJOR_UPDATE.md)** | 🚀 **[Deployment Guide](./VERCEL_DEPLOY.md)**

---

## 🚀 NEW in v2.2 - FEATURE EXPLOSION!

### 🏆 **Gamification & Progress**
- **Achievement System** - Unlock 18 badges across 5 categories (streak, favorites, notes, days, special)
- **Progress Tracking** - Visual representation of your spiritual journey
- **Milestone Celebrations** - Recognition for dedication and consistency

### 📊 **Advanced Analytics & Organization**
- **Advanced Filters** - Filter by book source, weekly theme, special days, or date range
- **Quote Collections** - Create custom collections beyond favorites with tags
- **Quote Comparison** - Compare two quotes side-by-side to find connections and common themes
- **Enhanced Stats Dashboard** - Deep insights into your reading patterns and progress

### 📤 **Sharing & Community**
- **Enhanced Share Options** - Direct Twitter, Facebook, WhatsApp, and Email integration
- **Widget/Embed** - Embed quotes on your website with 3 beautiful styles (minimal, card, full)
- **Daily Reminders** - PWA notifications to remind you of your daily reading
- **Beautiful Quote Cards** - 5 premium templates for social sharing

### 🖨️ **Print & Export**
- **Print Mode** - Beautiful print layouts (single day, week, or month)
- **Export/Import** - Backup and restore your favorites, notes, and complete data
- **Cross-Device Sync** - Move your spiritual journey between devices

### 📈 **Enhanced Analytics**
- **Calendar View** - Visual overview with favorites and notes indicators
- **Reading History** - Track your last 50 viewed quotes
- **Top Themes** - See your most favorited spiritual topics
- **7-Day Activity** - Weekly visualization of your practice

---

## 🎉 v2.0 Features

### 🔍 **Advanced Search & Discovery**
- **Full-Text Search** - Find quotes instantly across all 346 entries (Press `/`)
- **Theme Search** - Browse by spiritual topics
- **Random Quote** - Discover serendipitous wisdom (Press `R`)
- **Popular Themes** - Quick access to common spiritual themes

### ❤️ **Personal Journey Tools**
- **Favorites System** - Bookmark meaningful quotes (Press `F`)
- **Personal Notes** - Write reflections for each day's wisdom
- **Reading Streak** - Track your daily spiritual practice with flame badges
- **Journey Stats** - See your current streak, longest streak, and total days

### 🎨 **Enhanced Reading Experience**
- **3 Beautiful Themes** - Light, Dark, and Sepia modes
- **Font Size Controls** - Choose from 4 sizes (S/M/L/XL)
- **Quote Card Generator** - Create beautiful shareable images
- **Skeleton Loaders** - Professional loading states

### 🧘 **Meditation & Practice**
- **Meditation Timer** - Customizable 5-30 minute sessions (Press `M`)
- **Visual Progress** - Animated circular timer
- **Completion Chime** - Peaceful audio notification
- **Inspirational Quotes** - Guidance during meditation

### 📱 **Mobile Excellence**
- **Swipe Gestures** - Natural navigation (swipe left/right)
- **Touch Optimized** - Large, accessible buttons
- **PWA Support** - Install as native app
- **Offline First** - All features work without internet

### ⌨️ **Power User Features**
- 8 keyboard shortcuts for instant access
- Lightning-fast navigation
- Zero friction browsing
- Professional tooltips throughout

---

## ✨ Core Features

### 💯 Spiritual Content
- **346 Daily Entries** - Authentic quotes from Paramahansa Yogananda
- **79 Weekly Themes** - Organized spiritual guidance
- **AI-Generated Art** - DALL-E 3 + Google Gemini create sacred imagery
- **Special Days** - Commemorations and birthdays highlighted
- **Full Year Coverage** - Complete annual cycle

### ⚡ Technical Excellence
- **Lightning Fast** - <2 second load times
- **Mobile Optimized** - Responsive design for all devices
- **Type Safe** - Full TypeScript coverage
- **Accessible** - WCAG compliant, keyboard navigation
- **Zero Cost** - 100% free to use, forever

---

## 📱 Install as App

### On iPhone/iPad:
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Enjoy as native app with daily reminders!

### On Android:
1. Open in Chrome
2. Tap menu (three dots)
3. Select "Install App"
4. Enable notifications for daily wisdom!

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` or `H` | Previous day |
| `→` or `L` | Next day |
| `T` | Go to today |
| `R` | Random quote |
| `/` | Search quotes |
| `F` | View favorites |
| `M` | Meditation timer |
| `?` | Show shortcuts help |

**Plus:** Swipe left/right on mobile to navigate!

---

## 🚀 Technologies

- **React 18** with TypeScript for type safety
- **Vite 7** for lightning-fast builds
- **Tailwind CSS 3** for beautiful styling
- **Framer Motion 12** for smooth animations
- **OpenAI DALL-E 3** + **Google Gemini** for AI image generation
- **IndexedDB** for local caching and storage
- **localStorage** for favorites, notes, and preferences
- **Web Audio API** for meditation timer
- **Canvas API** for quote card generation
- **Vercel Edge** for global deployment

---

## 📦 v2.2 Bundle Size

- **Main Bundle**: 501KB (149KB gzipped)
- **CSS**: 31KB (6KB gzipped)
- **346 Daily Entries** included
- **18 Achievement Badges** system
- **8 New Features** integrated
- **Zero Dependencies** on external services

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