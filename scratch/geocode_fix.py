"""Phase 1b: correct the cache — fix Austin regex bug, retry unresolved with a
first-token fallback, and backfill City from the candidate's own city token
where Nominatim only gave a district/state. Updates geocode_cache.json in place."""
import requests, json, time, re, os

UA = {"User-Agent": "AviatorsFunnel-LocationBackfill/1.0 (dmohanraj@mondee.com)"}
CACHE = os.path.join(os.path.dirname(__file__), "geocode_cache.json")
cache = json.load(open(CACHE))

STATES = {s.lower() for s in [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
    "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
    "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
    "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
    "Puducherry","Chandigarh","India","Tamilnadu","AndhraPradesh","Telengana","Gujrat","Uttarpradesh"]}

# manual fixes for messy/typo strings Nominatim can't parse -> clean city query
MANUAL = {
    "Benglaluru": "Bengaluru",
    "Chalapathi Institute of Technology (Guntur ,Andhra Pradesh)": "Guntur",
    "ChennaiI, Tamilnadu": "Chennai",
    "Chilakalurupet": "Chilakaluripet",
    "faridabaad": "Faridabad",
    "Greater Noida, Uttarpradesh": "Greater Noida",
    "Indore, Indoa": "Indore",
    "Jagitiyal": "Jagtial",
    "Kurnool, AndhraPradesh": "Kurnool",
    "Shamshabad, Telengana, India": "Shamshabad",
    "Surat ,Gujrat": "Surat",
    "vijayawada , Andhra pradhesh,  India": "Vijayawada",
    "Austin": "Austin, Texas",   # fix the regex-mangled Belgium result
}

def geocode(q, cc="in"):
    for params in ({"q": q, "countrycodes": cc}, {"q": q}):
        try:
            r = requests.get("https://nominatim.openstreetmap.org/search",
                params={**params, "format":"json","addressdetails":1,"limit":1},
                headers=UA, timeout=20)
            time.sleep(1.1)
            j = r.json()
        except Exception:
            time.sleep(2); continue
        if j:
            a = j[0].get("address", {})
            country = a.get("country") or ""
            state = a.get("state") or a.get("state_district") or ""
            city = (a.get("city") or a.get("town") or a.get("village") or a.get("municipality")
                    or a.get("suburb") or "")
            return city, state, country
    return None

def first_token(loc):
    # candidate's own primary place token, title-cased
    t = re.split(r'[,(]', loc)[0].strip()
    t = re.sub(r'\s+', ' ', t)
    return t.title()

# 1) Manual re-geocode of unresolved / mangled
for orig, clean in MANUAL.items():
    if orig not in cache:
        continue
    cc = "us" if "texas" in clean.lower() else "in"
    res = geocode(clean, cc)
    if res:
        city, state, country = res
        if not city and first_token(orig).lower() not in STATES:
            city = first_token(clean)
        cache[orig] = {"City": city, "State": state, "Country": country}
        print(f"FIXED {orig!r:55} -> {city}, {state}, {country}")
    else:
        print(f"STILL UNRESOLVED {orig!r}")

# 2) Backfill City from candidate token where geocoder gave state+country but no city,
#    and the typed place is a city (not a bare state/country/district-only string)
backfilled = 0
for loc, v in cache.items():
    if v.get("unresolved"):
        continue
    if not v.get("City") and v.get("Country") and v.get("State"):
        tok = first_token(loc)
        if tok.lower() in STATES or tok.lower() in {"east godavari"}:
            continue  # genuinely a state/large-region -> leave city blank
        v["City"] = tok
        backfilled += 1

json.dump(cache, open(CACHE, "w"), indent=1, ensure_ascii=False)

# report
unres = [l for l,v in cache.items() if v.get("unresolved")]
nocity = [l for l,v in cache.items() if not v.get("City") and not v.get("unresolved")]
print(f"\nbackfilled city from token: {backfilled}")
print(f"still unresolved: {unres}")
print(f"remaining no-city (state/country only): {len(nocity)}")
for l in nocity: print("   ", repr(l), "->", cache[l]["State"], cache[l]["Country"])
EOF
