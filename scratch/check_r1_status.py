import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

res = supabase.table("round_1_evaluation").select("app_status").execute()
data = res.data

status_counts = {}
for r in data:
    status = r.get("app_status")
    status_counts[status] = status_counts.get(status, 0) + 1

print("Round 1 app_status counts:")
for k, v in status_counts.items():
    print(f"  {k}: {v}")
