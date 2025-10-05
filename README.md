# 🪷 SRF Spiritual Diary

A beautiful web application that displays daily wisdom from Paramahansa Yogananda's Spiritual Diary, featuring AI-generated sacred imagery to visualize each quote's spiritual essence.

## ✨ Features

- **Daily Spiritual Wisdom**: 365+ entries from Paramahansa Yogananda
- **Beautiful UI**: Serene design inspired by SRF's aesthetic
- **AI-Generated Art**: Create custom sacred imagery using DALL-E 3 or Google Imagen
- **Date Navigation**: Easy calendar picker to explore any day
- **Weekly Themes**: Discover the weekly spiritual themes
- **Special Days**: Highlighted commemorations of important spiritual events
- **Offline Capability**: Images are cached locally for instant access
- **Mobile-Friendly**: Responsive design works beautifully on all devices

## 🚀 Technologies

- **React 18** with TypeScript
- **Vite** for lightning-fast builds
- **Tailwind CSS** for beautiful styling
- **Framer Motion** for smooth animations
- **OpenAI DALL-E 3** for AI image generation
- **IndexedDB** for local caching
- **Vercel** for deployment

## 🛠️ Development

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

## 📝 Data Format

The diary entries are stored in `public/data/diary-entries.json` with the following structure:

```json
{
  "entries": {
    "01-01": {
      "month": 1,
      "day": 1,
      "topic": "New Beginnings",
      "weeklyTheme": "Divine Renewal",
      "specialDay": null,
      "quote": "...",
      "source": "Paramahansa Yogananda",
      "book": "..."
    }
  }
}
```

## 🎨 Design Philosophy

The app embraces SRF's spiritual aesthetic with:
- Soft blues and sacred golds
- Elegant serif fonts for quotes
- Peaceful, contemplative layout
- Smooth, meditative animations

## 🙏 About

This app is created with devotion to share the timeless teachings of Paramahansa Yogananda with the world. All quotes are from the works of Paramahansa Yogananda and Self-Realization Fellowship.

**Jai Guru! 🪷**

---

*"With the opening of the New Year, all the closed portals of limitations will be thrown open to reveal to the gaze of all sincere persons the unobstructed vista of endless spiritual possibilities."*
— Paramahansa Yogananda

