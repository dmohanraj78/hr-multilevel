import urllib.request

url = "https://master-portal-kohl.vercel.app/"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        print("HTML length:", len(html))
        # Find any script source tags
        import re
        scripts = re.findall(r'src="([^"]+)"', html)
        print("Found scripts:", scripts)
except Exception as e:
    print("Error:", e)
