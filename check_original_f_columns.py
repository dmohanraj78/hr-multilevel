import openpyxl

file_ref = r"c:\Users\Dhanush\Music\aviatorsclaude\Copy of AI_Builder_Intern_v9.xlsx"

try:
    wb = openpyxl.load_workbook(file_ref, data_only=True)
    sheet = wb['Analysis']
    print("F_college and F_University in template:")
    for r in range(6, 12):
        row_cells = list(sheet.iter_rows(min_row=r, max_row=r))[0]
        vals = [cell.value for cell in row_cells]
        print(f"  Row {r}: Name='{vals[1]}', Col18 (College)='{vals[17]}', Col19 (F_college)='{vals[18]}', Col20 (F_University)='{vals[19]}', Col21 (Location)='{vals[20]}'")
except Exception as e:
    print("Error:", e)
