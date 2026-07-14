import urllib.request

urls = {
    "Master Portal": "https://master-portal-kohl.vercel.app",
    "Recruiter Portal": "https://recruiter-portal-one.vercel.app",
    "Evaluator Portal": "https://evaluator-portal-mu.vercel.app",
    "Executive Portal": "https://executive-portal-nine.vercel.app"
}

for name, url in urls.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            code = resp.getcode()
            print(f"{name} ({url}): SUCCESS (Status code: {code})")
    except Exception as e:
        print(f"{name} ({url}): FAILED - {e}")
