import os
import requests

def load_dotenv():
    env_path = '.env'
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ[key.strip()] = val.strip().strip('"').strip("'")

load_dotenv()
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# 1. Update app_status: Reject -> No
url1 = f'{SUPABASE_URL}/rest/v1/round_1_evaluation?app_status=eq.Reject'
resp1 = requests.patch(url1, headers=headers, json={'app_status': 'No'})
print('Reject -> No:', len(resp1.json()) if resp1.ok else resp1.text, 'rows updated')

# 2. Update tier: Tier 1+ -> Tier1-
# Note: + needs to be %2B in query params, space needs to be %20
url2 = f'{SUPABASE_URL}/rest/v1/round_1_evaluation?tier=eq.Tier%201%2B'
resp2 = requests.patch(url2, headers=headers, json={'tier': 'Tier1-'})
print('Tier 1+ -> Tier1-:', len(resp2.json()) if resp2.ok else resp2.text, 'rows updated')

# 3. Update tier: Tier 2+ -> Tier 2-
url3 = f'{SUPABASE_URL}/rest/v1/round_1_evaluation?tier=eq.Tier%202%2B'
resp3 = requests.patch(url3, headers=headers, json={'tier': 'Tier 2-'})
print('Tier 2+ -> Tier 2-:', len(resp3.json()) if resp3.ok else resp3.text, 'rows updated')
