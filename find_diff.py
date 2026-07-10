import urllib.request
import json

url_r1 = 'https://mujqmdmzloizqhglayxe.supabase.co/rest/v1/round_1_evaluation?select=id&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
url_raw = 'https://mujqmdmzloizqhglayxe.supabase.co/rest/v1/raw_submissions?select=id,full_name,email&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'

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
        
    r1_ids = {c['id'] for c in r1_data}
    raw_ids = {c['id'] for c in raw_data}
    
    missing_ids = raw_ids - r1_ids
    print(f"Number of missing IDs: {len(missing_ids)}")
    print("Missing candidates:")
    for c in raw_data:
        if c['id'] in missing_ids:
            print(f"  ID: {c['id']}, Name: {c.get('full_name')}, Email: {c.get('email')}")
except Exception as e:
    print(f"Error: {e}")
