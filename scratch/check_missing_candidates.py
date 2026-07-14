import requests
import json

SUPABASE_URL = "https://mujqmdmzloizqhglayxe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

names = [
    "Saddi sandeep reddy",
    "DUGGAMMAGARI JAYANTH KUMAR",
    "Rithvik Guguloth",
    "Sahithi Pappula",
    "Aditya Thakur",
    "Sanika Tare",
    "sampada bari",
    "B. RINKA"
]

print("--- Querying by name from raw_submissions ---")
for name in names:
    # Get first word of the name
    first_word = name.split()[0]
    url = f"{SUPABASE_URL}/rest/v1/raw_submissions?full_name=ilike.*{first_word}*&select=*"
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        data = r.json()
        print(f"Name: {name} -> Found: {len(data)}")
        for item in data:
            print(f"  ID: {item.get('id')} | Full Name: {item.get('full_name')} | ug_university: {item.get('ug_university')} | Date: {item.get('submission_date')}")
            # Check R1 evaluation for this ID
            r1_url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation?id=eq.{item.get('id')}&select=*"
            r1_r = requests.get(r1_url, headers=headers)
            if r1_r.status_code == 200:
                r1_data = r1_r.json()
                print(f"    R1 Eval: {r1_data}")
            else:
                print(f"    Error R1: {r1_r.text}")
    else:
        print(f"Name: {name} -> Error: {r.text}")
