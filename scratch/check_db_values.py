import urllib.request
import json
from collections import Counter

apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'

headers = {
    'apikey': apikey,
    'Authorization': f'Bearer {apikey}'
}

def fetch_table(table_name, select_cols):
    url = f'https://mujqmdmzloizqhglayxe.supabase.co/rest/v1/{table_name}?select={select_cols}'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

try:
    r1 = fetch_table('round_1_evaluation', 'app_status')
    r1_vals = Counter([c.get('app_status') for c in r1])
    print("Unique app_status in round_1_evaluation:")
    for val, count in r1_vals.items():
        print(f"  {val}: {count}")

    r2 = fetch_table('round_2_evaluation', 'moved_to_round_3')
    r2_vals = Counter([c.get('moved_to_round_3') for c in r2])
    print("\nUnique moved_to_round_3 in round_2_evaluation:")
    for val, count in r2_vals.items():
        print(f"  {val}: {count}")

    r3 = fetch_table('round_3_evaluation', 'verdict')
    r3_vals = Counter([c.get('verdict') for c in r3])
    print("\nUnique verdict in round_3_evaluation:")
    for val, count in r3_vals.items():
        print(f"  {val}: {count}")

except Exception as e:
    print(f"Error: {e}")
