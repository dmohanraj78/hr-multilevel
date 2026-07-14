"""Data-quality guard for round_1_evaluation.

Enforces three invariants (safe to run any number of times; also runs daily
in the GitHub Action before the morning report):
  1. No duplicate candidates — one evaluation per person (matched by email,
     phone, or GitHub URL). Keeps the highest-scored row; deletes the rest AND
     marks the deleted rows' raw_submissions as Analysis_status='Completed' so
     the n8n scorer can never re-evaluate them (this was the bug that made
     duplicates reappear).
  2. Tiers are always full form: 'T1' -> 'Tier 1', 'T2+' -> 'Tier 2+', etc.
  3. app_status is never NULL — defaults to 'Pending'.
"""
import os
import re
import sys
import requests

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mujqmdmzloizqhglayxe.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc")
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

TIER_FULL = {
    "T1": "Tier 1", "T1+": "Tier 1+",
    "T2": "Tier 2", "T2+": "Tier 2+",
    "T3": "Tier 3", "T4": "Tier 4",
}


def fetch_all(table, select):
    rows, offset = [], 0
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/{table}?select={select}&limit=1000&offset={offset}",
            headers=HEADERS,
        )
        r.raise_for_status()
        page = r.json()
        rows += page
        if len(page) < 1000:
            return rows
        offset += 1000


def norm_phone(p):
    if not p:
        return ""
    p = re.sub(r"[^0-9]", "", str(p))
    if p.startswith("91") and len(p) > 10:
        p = p[2:]
    if p.startswith("0") and len(p) > 10:
        p = p[1:]
    return p[-10:] if len(p) >= 10 else ""


def norm_github(g):
    if not g:
        return ""
    g = str(g).lower().strip().rstrip("/")
    g = re.sub(r"https?://(www\.)?github\.com/", "", g)
    g = g.split("?")[0].rstrip("/")
    return g if len(g) > 3 else ""


def norm_email(e):
    return str(e).strip().lower() if e else ""


def get_raw(row):
    raw = row.get("raw_submissions") or {}
    if isinstance(raw, list):
        raw = raw[0] if raw else {}
    return raw


def main():
    print("Fetching round_1_evaluation + raw_submissions...")
    rows = fetch_all("round_1_evaluation", "id,tier,total,app_status,raw_submissions(id,full_name,email,phone,github_url)")
    print(f"round_1_evaluation rows: {len(rows)}")

    # ---- 1. Tiers to full form -------------------------------------------
    tier_fixes = 0
    for row in rows:
        tier = (row.get("tier") or "").strip()
        if tier in TIER_FULL:
            r = requests.patch(
                f"{SUPABASE_URL}/rest/v1/round_1_evaluation?id=eq.{row['id']}",
                headers=HEADERS, json={"tier": TIER_FULL[tier]},
            )
            if r.status_code in (200, 204):
                tier_fixes += 1
            else:
                print(f"  tier fix FAILED for id {row['id']}: {r.text}")
    print(f"Tier values normalised to full form: {tier_fixes}")

    # ---- 2. app_status never NULL ----------------------------------------
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/round_1_evaluation?app_status=is.null",
        headers=HEADERS, json={"app_status": "Pending"},
    )
    print(f"NULL app_status -> Pending: HTTP {r.status_code}")

    # ---- 3. Deduplicate ---------------------------------------------------
    # Union rows that share an email, phone, or GitHub URL.
    key_to_group = {}
    groups = []  # list of lists of row dicts
    for row in rows:
        raw = get_raw(row)
        keys = [k for k in (
            ("e:" + norm_email(raw.get("email"))) if norm_email(raw.get("email")) else None,
            ("p:" + norm_phone(raw.get("phone"))) if norm_phone(raw.get("phone")) else None,
            ("g:" + norm_github(raw.get("github_url"))) if norm_github(raw.get("github_url")) else None,
        ) if k]
        group = None
        for k in keys:
            if k in key_to_group:
                group = key_to_group[k]
                break
        if group is None:
            group = []
            groups.append(group)
        group.append(row)
        for k in keys:
            key_to_group[k] = group

    dup_groups = [g for g in groups if len(g) > 1]
    print(f"Duplicate groups found: {len(dup_groups)}")

    deleted, raw_marked = 0, 0
    for group in dup_groups:
        # keep the highest score; tie-break on the oldest (lowest id)
        group.sort(key=lambda x: (-(float(x.get("total") or 0)), x["id"]))
        keep = group[0]
        losers = group[1:]
        print(f"  keeping id {keep['id']} (total {keep.get('total')}, {get_raw(keep).get('full_name')}), removing {[g['id'] for g in losers]}")
        for loser in losers:
            r = requests.delete(
                f"{SUPABASE_URL}/rest/v1/round_1_evaluation?id=eq.{loser['id']}",
                headers=HEADERS,
            )
            if r.status_code in (200, 204):
                deleted += 1
                # CRITICAL: mark the raw submission handled so the scorer
                # never re-evaluates it and recreates the duplicate
                r2 = requests.patch(
                    f"{SUPABASE_URL}/rest/v1/raw_submissions?id=eq.{loser['id']}",
                    headers=HEADERS, json={"Analysis_status": "Completed"},
                )
                if r2.status_code in (200, 204):
                    raw_marked += 1
                else:
                    print(f"    raw mark FAILED for id {loser['id']}: {r2.text}")
            else:
                print(f"    delete FAILED for id {loser['id']}: {r.text}")

    print(f"Duplicate evaluations deleted: {deleted} (raw rows marked Completed: {raw_marked})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
