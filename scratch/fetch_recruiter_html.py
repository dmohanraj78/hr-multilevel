import urllib.request
import re

url = "https://recruiter-portal-one.vercel.app"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        scripts = re.findall(r'src="([^"]+)"', html)
        print("Recruiter Portal script assets:", scripts)
except Exception as e:
    print("Error:", e)
