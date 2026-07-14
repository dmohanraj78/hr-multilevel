import urllib.request
import re
import time

url = "https://master-portal-kohl.vercel.app"
target_string = "Applications Reviewed"

print("Starting to monitor Vercel deployment for updates...")

while True:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
            # Find the main js bundle
            # Usually <script type="module" crossorigin src="/assets/index-XXXX.js"></script>
            match = re.search(r'src="(/assets/index-.*?\.js)"', html)
            if match:
                js_url = url + match.group(1)
                js_req = urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(js_req) as js_response:
                    js_content = js_response.read().decode('utf-8')
                    if target_string in js_content:
                        print("SUCCESS: Vercel deployment has been updated!")
                        break
                    else:
                        print(f"Update not yet live (checked JS bundle {js_url})")
            else:
                print("Could not find JS bundle in HTML")
    except Exception as e:
        print("Error checking:", e)
    
    time.sleep(10)
