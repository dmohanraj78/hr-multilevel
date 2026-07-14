import openpyxl

template_path = r"c:\Users\Dhanush\Music\aviatorsclaude\Copy of AI_Builder_Intern_v9.xlsx"
try:
    wb = openpyxl.load_workbook(template_path)
    sheet = wb['Analysis']
    
    hidden_rows = []
    for r in range(1, 1000):
        dim = sheet.row_dimensions.get(r)
        if dim and dim.hidden:
            hidden_rows.append(r)
            
    print(f"Template sheet name: {sheet.title}")
    print(f"Total hidden rows in template: {len(hidden_rows)}")
    if hidden_rows:
        print("First 20 hidden row numbers:")
        print(hidden_rows[:20])
        
    # Check if there is an active auto filter ref in the template
    if sheet.auto_filter.ref:
        print(f"Auto Filter Ref in template: {sheet.auto_filter.ref}")
    else:
        print("No Auto Filter Ref in template")
except Exception as e:
    print("Error:", e)
