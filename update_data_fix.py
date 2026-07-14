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

# Fix tier spacing: Tier1- -> Tier 1-
url = f'{SUPABASE_URL}/rest/v1/round_1_evaluation?tier=eq.Tier1-'
resp = requests.patch(url, headers=headers, json={'tier': 'Tier 1-'})
print('Tier1- -> Tier 1-:', len(resp.json()) if resp.ok else resp.text, 'rows updated')
