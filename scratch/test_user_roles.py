import os
import requests
from dotenv import load_dotenv

load_dotenv('.env')
url = f"{os.environ.get('SUPABASE_URL')}/rest/v1/user_roles?limit=5"
headers = {
    'apikey': os.environ.get('SUPABASE_KEY'),
    'Authorization': f"Bearer {os.environ.get('SUPABASE_KEY')}"
}

resp = requests.get(url, headers=headers)
print("Status code:", resp.status_code)
if resp.ok:
    print("Data:", resp.json())
else:
    print("Error:", resp.text)
