import urllib.request
import json

url_raw = 'https://mujqmdmzloizqhglayxe.supabase.co/rest/v1/raw_submissions?select=id,ug_university&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'

headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
}

try:
    req_raw = urllib.request.Request(url_raw, headers=headers)
    with urllib.request.urlopen(req_raw) as resp:
        raw_data = json.loads(resp.read().decode())
        
    colleges = {}
    for c in raw_data:
        col = c.get('ug_university')
        if col:
            colleges[col] = colleges.get(col, 0) + 1
            
    print(f"Total unique ug_university names typed by users: {len(colleges)}")
    sorted_colleges = sorted(colleges.items(), key=lambda x: x[1], reverse=True)
    for col, count in sorted_colleges[:100]:
        print(f"  {col}: {count}")
except Exception as e:
    print(f"Error: {e}")
