import os, requests
from dotenv import load_dotenv
load_dotenv('.env')
url = f"{os.environ.get('SUPABASE_URL')}/rest/v1/round_3_evaluation?limit=1"
headers = {'apikey': os.environ.get('SUPABASE_KEY'), 'Authorization': f"Bearer {os.environ.get('SUPABASE_KEY')}"}
resp = requests.get(url, headers=headers)
print(resp.json())
