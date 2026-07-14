import ExcelJS from 'exceljs';

async function run() {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('public/template.xlsx');
    const sheet = workbook.getWorksheet('Analysis');
    
    console.log("Original column count:", sheet.columnCount);
    const r6 = sheet.getRow(6);
    console.log("Original Row 6 Headers:");
    for (let col = 1; col <= 52; col++) {
      const val = r6.getCell(col).value;
      if (val) {
        console.log(`${col}: ${val}`);
      }
    }
    
    // Delete column 37 (R1 Interview Priority)
    sheet.spliceColumns(37, 1);
    
    // Delete column 46 (which was Column 47: Tier)
    sheet.spliceColumns(46, 1);
    
    console.log("\nRow 6 Headers after splicing:");
    for (let col = 1; col <= 52; col++) {
      const val = r6.getCell(col).value;
      if (val) {
        console.log(`${col}: ${val}`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
