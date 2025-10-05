const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('../SRF Spiritual Diary.xlsx');
const sheet1 = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1'], { cellDates: true });

// Create diary data structure
const diaryData = {};
const weeklyThemes = {};
let currentWeekTheme = null;
let weekStartDate = null;

sheet1.forEach((row, index) => {
  if (row.Date) {
    const date = new Date(row.Date);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const key = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Detect weekly theme changes (when topic changes after ~7 days)
    if (!currentWeekTheme || row.Topic !== currentWeekTheme) {
      if (currentWeekTheme && weekStartDate) {
        // Save the previous week's theme
        const prevKey = `${Object.keys(diaryData).length}`;
        weeklyThemes[`week${prevKey}`] = {
          startDate: weekStartDate,
          endDate: Object.keys(diaryData)[Object.keys(diaryData).length - 1],
          theme: currentWeekTheme
        };
      }
      currentWeekTheme = row.Topic;
      weekStartDate = key;
    }
    
    // Detect special days (usually noted in the quote or a special field)
    let specialDay = null;
    if (row.Quote && row.Quote.includes('Birthday of')) {
      const match = row.Quote.match(/Birthday of ([^-]+)/);
      if (match) specialDay = match[0];
    }
    // Check if there's a SpecialDay column in your Excel
    if (row.SpecialDay) {
      specialDay = row.SpecialDay;
    }
    
    diaryData[key] = {
      month,
      day,
      topic: row.Topic || '',
      weeklyTheme: currentWeekTheme,
      specialDay: specialDay,
      quote: row.Quote || '',
      source: row.Source || 'Paramahansa Yogananda',
      book: row.Book || row.Reference || '' // Check for Book or Reference column
    };
  }
});

// Write to JSON file
const output = {
  entries: diaryData,
  weeklyThemes: weeklyThemes
};

fs.writeFileSync(
  '../public/data/diary-entries.json',
  JSON.stringify(output, null, 2)
);

console.log(`✓ Created diary-entries.json with ${Object.keys(diaryData).length} entries`);
console.log(`✓ Identified ${Object.keys(weeklyThemes).length} weekly themes`);

