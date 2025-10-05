const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file from parent directory
const excelPath = path.join(__dirname, '..', '..', 'SRF Spiritual Diary.xlsx');
console.log('Reading Excel file from:', excelPath);

try {
  const workbook = XLSX.readFile(excelPath);
  
  // Get the first sheet name
  const sheetName = workbook.SheetNames[0];
  console.log('Reading sheet:', sheetName);
  
  const sheet1 = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { 
    cellDates: true,
    raw: false 
  });
  
  console.log(`Found ${sheet1.length} rows in Excel`);
  
  // Create diary data structure
  const diaryData = {};
  const weeklyThemes = {};
  let currentWeekTheme = null;
  let weekStartDate = null;
  let weekCounter = 1;
  
  sheet1.forEach((row, index) => {
    // Try to find the date column (might be 'Date', 'date', or similar)
    const dateValue = row.Date || row.date || row.DATE || Object.values(row)[0];
    
    if (dateValue) {
      let date;
      
      // Try to parse the date
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else {
        // Excel numeric date
        date = XLSX.SSF.parse_date_code(dateValue);
        date = new Date(date.y, date.m - 1, date.d);
      }
      
      if (!isNaN(date.getTime())) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const key = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Get topic (try different column names)
        const topic = row.Topic || row.topic || row.TOPIC || row.Subject || '';
        
        // Detect weekly theme changes
        if (!currentWeekTheme || (topic && topic !== currentWeekTheme)) {
          if (currentWeekTheme && weekStartDate) {
            weeklyThemes[`week${weekCounter}`] = {
              startDate: weekStartDate,
              endDate: Object.keys(diaryData)[Object.keys(diaryData).length - 1] || key,
              theme: currentWeekTheme
            };
            weekCounter++;
          }
          currentWeekTheme = topic;
          weekStartDate = key;
        }
        
        // Detect special days
        let specialDay = null;
        const quote = row.Quote || row.quote || row.QUOTE || row.Text || '';
        
        if (quote && (quote.includes('Birthday of') || quote.includes('birthday of'))) {
          const match = quote.match(/[Bb]irthday of ([^-,.\n]+)/);
          if (match) specialDay = match[0];
        }
        
        if (row.SpecialDay || row['Special Day'] || row.specialday) {
          specialDay = row.SpecialDay || row['Special Day'] || row.specialday;
        }
        
        diaryData[key] = {
          month,
          day,
          topic: topic,
          weeklyTheme: currentWeekTheme,
          specialDay: specialDay,
          quote: quote,
          source: row.Source || row.source || row.Author || 'Paramahansa Yogananda',
          book: row.Book || row.book || row.Reference || row.reference || ''
        };
      }
    }
  });
  
  // Save the last weekly theme
  if (currentWeekTheme && weekStartDate) {
    const lastKey = Object.keys(diaryData)[Object.keys(diaryData).length - 1];
    weeklyThemes[`week${weekCounter}`] = {
      startDate: weekStartDate,
      endDate: lastKey,
      theme: currentWeekTheme
    };
  }
  
  // Write to JSON file
  const output = {
    entries: diaryData,
    weeklyThemes: weeklyThemes
  };
  
  const outputPath = path.join(__dirname, '..', 'public', 'data', 'diary-entries.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(output, null, 2)
  );
  
  console.log(`\n✓ Successfully created diary-entries.json with ${Object.keys(diaryData).length} entries`);
  console.log(`✓ Identified ${Object.keys(weeklyThemes).length} weekly themes`);
  console.log(`✓ Output written to: ${outputPath}`);
  
  // Show first and last entries
  const keys = Object.keys(diaryData);
  console.log(`\nFirst entry: ${keys[0]} - ${diaryData[keys[0]].topic}`);
  console.log(`Last entry: ${keys[keys.length - 1]} - ${diaryData[keys[keys.length - 1]].topic}`);
  
} catch (error) {
  console.error('Error converting Excel to JSON:', error.message);
  console.error('\nPlease check:');
  console.error('1. The Excel file exists at:', excelPath);
  console.error('2. The Excel file has the correct column names (Date, Topic, Quote, etc.)');
  console.error('3. The sheet name is correct');
  process.exit(1);
}
