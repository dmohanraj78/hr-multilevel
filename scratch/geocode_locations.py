"""Phase 1: resolve every unique location string to (City, State, Country)
via Nominatim, and cache to geocode_cache.json for review. NO DB writes here."""
import requests, collections, json, time, re, os

SR = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc"
H = {"apikey": SR, "Authorization": f"Bearer {SR}"}
B = "https://mujqmdmzloizqhglayxe.supabase.co/rest/v1"
UA = {"User-Agent": "AviatorsFunnel-LocationBackfill/1.0 (dmohanraj@mondee.com)"}
CACHE_PATH = os.path.join(os.path.dirname(__file__), "geocode_cache.json")

def fa(t, s):
    out, off = [], 0
    while True:
        r = requests.get(f"{B}/{t}?select={s}&limit=1000&offset={off}", headers=H).json()
        out += r
        if len(r) < 1000: break
        off += 1000
    return out

# US cities present in the data (explicit, so India bias doesn't misplace them)
US_HINT = {"austin", "buffalo"}
# strings that are only a country
COUNTRY_ONLY = {"india"}
# unresolvable / meaningless — leave blank, reported at the end
SKIP = {"others", "vkb"}

def clean_query(loc):
    s = loc.strip()
    s = re.sub(r'\b\d{5,6}\b', '', s)          # strip pincodes
    s = re.sub(r',?\s*(ind|IN)\b\.?$', ', India', s, flags=re.I)  # IN/IND -> India
    s = re.sub(r'\s+', ' ', s).strip().strip(',').strip()
    return s

def extract(addr):
    country = addr.get("country") or ""
    state = addr.get("state") or addr.get("state_district") or ""
    city = (addr.get("city") or addr.get("town") or addr.get("village")
            or addr.get("municipality") or addr.get("suburb") or addr.get("county") or "")
    # county often = "<X> district"; keep only if nothing better and strip 'district'
    if city and city.lower().endswith(" district"):
        city = city[:-9].strip()
    return city, state, country

def geocode(loc):
    key = loc.lower().strip()
    if key in COUNTRY_ONLY:
        return "", "", "India"
    if key in SKIP:
        return None
    hint = "us" if key in US_HINT else "in"
    q = clean_query(loc)
    for params in (
        {"q": q, "countrycodes": hint},
        {"q": q},  # fallback: no country restriction
    ):
        try:
            r = requests.get("https://nominatim.openstreetmap.org/search",
                params={**params, "format": "json", "addressdetails": 1, "limit": 1},
                headers=UA, timeout=20)
            time.sleep(1.1)
            j = r.json()
        except Exception as e:
            print("  ERR", loc, e); time.sleep(2); continue
        if j:
            return extract(j[0].get("address", {}))
    return None

def main():
    r1 = fa("round_1_evaluation", "id,location")
    raw = {x["id"]: (x.get("location") or "") for x in fa("raw_submissions", "id,location")}
    def loc_of(x):
        l = (x.get("location") or "").strip()
        return l if l else (raw.get(x["id"], "") or "").strip()

    uniq = sorted(set(loc_of(x) for x in r1 if loc_of(x)), key=str.lower)
    print(f"{len(r1)} rows, {len(uniq)} unique locations to geocode")

    cache = {}
    if os.path.exists(CACHE_PATH):
        cache = json.load(open(CACHE_PATH))
        print(f"resuming — {len(cache)} already cached")

    unresolved = []
    for i, loc in enumerate(uniq, 1):
        if loc in cache:
            continue
        res = geocode(loc)
        if res is None:
            unresolved.append(loc)
            cache[loc] = {"City": "", "State": "", "Country": "", "unresolved": True}
        else:
            city, state, country = res
            cache[loc] = {"City": city, "State": state, "Country": country}
        if i % 20 == 0:
            json.dump(cache, open(CACHE_PATH, "w"), indent=1, ensure_ascii=False)
            print(f"  {i}/{len(uniq)} done")
    json.dump(cache, open(CACHE_PATH, "w"), indent=1, ensure_ascii=False)

    # summary
    no_city = [l for l, v in cache.items() if not v.get("City") and not v.get("unresolved")]
    unres = [l for l, v in cache.items() if v.get("unresolved")]
    print(f"\nDONE. cached {len(cache)} unique locations")
    print(f"resolved with a city: {len(cache) - len(no_city) - len(unres)}")
    print(f"state/country only (no city): {len(no_city)} -> {no_city}")
    print(f"UNRESOLVED (left blank): {len(unres)} -> {unres}")

if __name__ == "__main__":
    main()
