import urllib.request
import json

url_r1 = 'https://mujqmdmzloizqhglayxe.supabase.co/rest/v1/round_1_evaluation?select=id,app_status&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
url_raw = 'https://mujqmdmzloizqhglayxe.supabase.co/rest/v1/raw_submissions?select=id&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'

headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
}

try:
    req_r1 = urllib.request.Request(url_r1, headers=headers)
    with urllib.request.urlopen(req_r1) as resp:
        r1_data = json.loads(resp.read().decode())
        
    req_raw = urllib.request.Request(url_raw, headers=headers)
    with urllib.request.urlopen(req_raw) as resp:
        raw_data = json.loads(resp.read().decode())
        
    print(f"Total rows in raw_submissions: {len(raw_data)}")
    print(f"Total rows in round_1_evaluation: {len(r1_data)}")
    
    # Let's see if there are duplicates flagged in round_1_evaluation
    duplicates = [c for c in r1_data if c.get('app_status') == 'Duplicate']
    print(f"Duplicates count in round_1_evaluation: {len(duplicates)}")
except Exception as e:
    print(f"Error: {e}")
