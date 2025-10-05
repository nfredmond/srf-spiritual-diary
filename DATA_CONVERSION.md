# 📊 Converting Your Excel Data to JSON

The app currently has sample data. To use your actual SRF Spiritual Diary data, follow these steps:

## Method 1: Using the Conversion Script (Recommended)

### Step 1: Install Dependencies

```bash
cd scripts
npm install xlsx
```

### Step 2: Place Your Excel File

Copy `SRF Spiritual Diary.xlsx` to the project root directory:
```
srf-spiritual-diary/
  ├── SRF Spiritual Diary.xlsx  ← Place file here
  ├── scripts/
  │   └── convert-excel-to-json.js
  └── public/
      └── data/
          └── diary-entries.json
```

### Step 3: Verify Excel Structure

Make sure your Excel file has these columns:
- **Date**: Date for each entry
- **Topic**: Daily topic (e.g., "Faith", "Love", "Peace")
- **Quote**: The spiritual quote or passage
- **Source**: Usually "Paramahansa Yogananda"
- **Book** or **Reference**: Source book (optional)
- **SpecialDay**: Special observances (optional, e.g., "Birthday of Sri Gyanamata")

### Step 4: Run the Conversion

```bash
cd scripts
node convert-excel-to-json.js
```

This will create `public/data/diary-entries.json` with all your entries.

### Step 5: Verify the Output

Check that `public/data/diary-entries.json` was created and has entries like:

```json
{
  "entries": {
    "01-01": {
      "month": 1,
      "day": 1,
      "topic": "New Beginnings",
      "quote": "...",
      "source": "Paramahansa Yogananda"
    }
  }
}
```

## Method 2: Manual JSON Creation

If you prefer to create the JSON manually or have a different data format:

### Step 1: Create JSON Structure

Create or edit `public/data/diary-entries.json`:

```json
{
  "entries": {
    "MM-DD": {
      "month": number,
      "day": number,
      "topic": "string",
      "weeklyTheme": "string (optional)",
      "specialDay": "string (optional)",
      "quote": "string",
      "source": "string",
      "book": "string (optional)"
    }
  },
  "weeklyThemes": {
    "week1": {
      "startDate": "MM-DD",
      "endDate": "MM-DD",
      "theme": "string"
    }
  }
}
```

### Step 2: Add Your Entries

For each day of the year, add an entry with the format MM-DD (e.g., "01-01" for January 1).

## Modifying the Conversion Script

If your Excel has different column names, edit `scripts/convert-excel-to-json.js`:

```javascript
// Line 62-70: Adjust these field mappings
diaryData[key] = {
  month,
  day,
  topic: row.YourTopicColumn || '',
  quote: row.YourQuoteColumn || '',
  source: row.YourSourceColumn || 'Paramahansa Yogananda',
  book: row.YourBookColumn || ''
};
```

## Testing Your Data

After conversion:

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Check different dates**:
   - Use the date picker to navigate
   - Verify quotes display correctly
   - Check that special days are highlighted

3. **Look for missing entries**:
   - Navigate through the year
   - Any missing dates will show an error message

## Data Quality Checklist

- [ ] All 365 days have entries (366 for leap year)
- [ ] Feb 29 is included if applicable
- [ ] Quotes are properly formatted (no extra spaces/newlines)
- [ ] Source attributions are consistent
- [ ] Special days are marked correctly
- [ ] Weekly themes are identified (optional)

## Troubleshooting

### "No entry found for [date]"
- Check that the date key is formatted as MM-DD with leading zeros
- Verify the entry exists in diary-entries.json

### Quotes with strange characters
- Excel encoding issues - try saving Excel as CSV UTF-8, then re-import

### Script errors
- Make sure xlsx package is installed: `npm install xlsx`
- Check that Excel file path is correct
- Verify Excel sheet is named "Sheet1" or update script line 20

## 🎉 Ready to Deploy!

Once your data is converted and verified:

```bash
npm run build    # Test the production build
npm run preview  # Preview the built app
```

Then follow the DEPLOYMENT.md guide to push to GitHub and deploy to Vercel!

**Jai Guru! 🪷**

