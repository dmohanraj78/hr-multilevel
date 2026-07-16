import urllib.request
import json
import collections

url_raw = 'https://mujqmdmzloizqhglayxe.supabase.co/rest/v1/candidates?limit=10&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'

headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
}

try:
    req_raw = urllib.request.Request(url_raw, headers=headers)
    with urllib.request.urlopen(req_raw) as resp:
        raw_data = json.loads(resp.read().decode())
    if raw_data:
        keys = set()
        locations = set()
        for d in raw_data:
            keys.update(d.keys())
            if 'round_1_evaluation' in d:
                r1 = d['round_1_evaluation']
                if isinstance(r1, list): r1 = r1[0] if r1 else {}
                keys.update([f"r1.{k}" for k in r1.keys()])
            if 'location' in d: locations.add(str(d['location']))
            elif 'Location' in d: locations.add(str(d['Location']))
            
        print("Schema keys:")
        for k in sorted(keys):
            print(f"  {k}")
        print("\nLocations found:", locations)
    else:
        print("No data found")
except Exception as e:
    print(f"Error: {e}")
