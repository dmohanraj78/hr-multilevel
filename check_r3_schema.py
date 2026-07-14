import os, requests
from dotenv import load_dotenv
load_dotenv('.env')
url = f"{os.environ.get('SUPABASE_URL')}/rest/v1/"
headers = {'apikey': os.environ.get('SUPABASE_KEY'), 'Authorization': f"Bearer {os.environ.get('SUPABASE_KEY')}"}
resp = requests.options(url + 'round_3_evaluation', headers=headers)
print('Headers:', resp.headers)
try:
    print('Body:', resp.json())
except:
    print('Body Text:', resp.text)
