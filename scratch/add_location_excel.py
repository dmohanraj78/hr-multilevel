import sys
import re

filepath = r"c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\OverallFunnelDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

location_tab_code = """    const addLocationTablesTab = () => {
      const existing = workbook.getWorksheet('Location Tables');
      if (existing) workbook.removeWorksheet(existing.id);
      const sheet = workbook.addWorksheet('Location Tables');

      const TIERS = ['Tier 1', 'Tier 1-', 'Tier 2', 'Tier 2-', 'Tier 3', 'Tier 4', 'Other', 'total'];
      const TIER_HEADERS = ['Tier 1', 'Tier 1-', 'Tier 2', 'Tier 2-', 'Tier 3', 'Tier 4', 'Other', 'Grand Total'];

      let currentRow = 1;

      const renderTable = (title, pivotData, rowLabel) => {
        sheet.getRow(currentRow).font = { bold: true, size: 12, color: { argb: 'FF9B1C1C' } };
        sheet.getCell(`A${currentRow}`).value = title;
        currentRow += 2;

        const headerRow = sheet.getRow(currentRow);
        headerRow.font = { bold: true };
        headerRow.getCell(1).value = rowLabel;
        TIER_HEADERS.forEach((t, i) => {
          headerRow.getCell(i + 2).value = t;
        });
        currentRow++;

        pivotData.data.forEach(([name, counts]) => {
          const row = sheet.getRow(currentRow);
          row.getCell(1).value = name;
          TIERS.forEach((t, i) => {
            row.getCell(i + 2).value = counts[t] > 0 ? counts[t] : (t === 'total' ? 0 : '-');
          });
          currentRow++;
        });

        const totalRow = sheet.getRow(currentRow);
        totalRow.font = { bold: true };
        totalRow.getCell(1).value = 'Grand Total';
        TIERS.forEach((t, i) => {
          totalRow.getCell(i + 2).value = pivotData.totals[t];
        });
        
        currentRow += 3;
      };

      sheet.columns = [
        { width: 30 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 15 }
      ];

      renderTable('STATE WISE TABLE (ROUND 1 YES)', stateTierPivotR1, 'State');
      renderTable('STATE WISE TABLE (ROUND 2 YES)', stateTierPivotR2, 'State');
      renderTable('CITY WISE TABLE (ROUND 2 YES)', cityTierPivotR2, 'City');
    };

    addLocationTablesTab();
"""

target = "// Trigger browser download"
if target in content and "addLocationTablesTab()" not in content:
    content = content.replace(target, location_tab_code + "\n    " + target)
    print("Injected addLocationTablesTab")
else:
    print("Could not find target or already injected")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
