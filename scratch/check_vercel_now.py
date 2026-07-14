import urllib.request
import re

url = "https://master-portal-kohl.vercel.app"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        match = re.search(r'src="(/assets/index-.*?\.js)"', html)
        if match:
            js_url = url + match.group(1)
            js_req = urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(js_req) as js_response:
                js_content = js_response.read().decode('utf-8')
                if 'Applications Reviewed' in js_content:
                    print('UPDATED')
                else:
                    print('NOT UPDATED YET')
        else:
            print('No JS bundle found')
except Exception as e:
    print('Error:', e)
