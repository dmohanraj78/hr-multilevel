"""Phase 2: write City/State/Country to round_1_evaluation for all 737 rows.
ONLY those three columns are patched. Pass --apply to write; default is dry-run."""
import requests, json, sys, os, collections

SR = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc"
H = {"apikey": SR, "Authorization": f"Bearer {SR}", "Content-Type": "application/json"}
B = "https://mujqmdmzloizqhglayxe.supabase.co/rest/v1"
APPLY = "--apply" in sys.argv
cache = json.load(open(os.path.join(os.path.dirname(__file__), "geocode_cache.json")))

def fa(t, s):
    out, off = [], 0
    while True:
        r = requests.get(f"{B}/{t}?select={s}&limit=1000&offset={off}", headers=H).json()
        out += r
        if len(r) < 1000: break
        off += 1000
    return out

r1 = fa("round_1_evaluation", "id,location,City,State,Country")
raw = {x["id"]: (x.get("location") or "") for x in fa("raw_submissions", "id,location")}
def loc_of(x):
    l = (x.get("location") or "").strip()
    return l if l else (raw.get(x["id"], "") or "").strip()

missing_cache = [x["id"] for x in r1 if loc_of(x) and loc_of(x) not in cache]
print(f"rows: {len(r1)}")
print(f"rows whose location is NOT in cache (would be skipped): {len(missing_cache)} {missing_cache[:10]}")

plan = []       # (id, City, State, Country)
blank_rows = [] # ids we cannot resolve
for x in r1:
    loc = loc_of(x)
    v = cache.get(loc)
    if not v or (not v.get("City") and not v.get("State") and not v.get("Country")):
        blank_rows.append(x["id"]); continue
    plan.append((x["id"], v.get("City",""), v.get("State",""), v.get("Country","")))

print(f"rows to fill: {len(plan)}")
print(f"rows left blank (unresolvable location): {len(blank_rows)} {blank_rows}")
cc = collections.Counter(p[3] for p in plan)
print(f"country distribution: {dict(cc)}")
print("sample (id -> City | State | Country):")
for p in plan[:12]:
    print(f"   {p[0]:5} -> {p[1]} | {p[2]} | {p[3]}")

if not APPLY:
    print("\nDRY RUN — pass --apply to write. Only City/State/Country will be patched.")
    sys.exit(0)

print("\nAPPLYING...")
ok = 0
for i, (cid, city, state, country) in enumerate(plan, 1):
    r = requests.patch(f"{B}/round_1_evaluation?id=eq.{cid}", headers=H,
                       json={"City": city, "State": state, "Country": country})
    if r.status_code in (200, 204):
        ok += 1
    else:
        print(f"  FAIL id={cid}: {r.status_code} {r.text[:120]}")
    if i % 100 == 0:
        print(f"  {i}/{len(plan)} patched")
print(f"done: {ok}/{len(plan)} rows updated")
