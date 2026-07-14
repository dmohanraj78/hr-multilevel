import urllib.request
import re
import time

url = "https://master-portal-kohl.vercel.app/"
old_script = "/assets/index-DFoXRnZD.js"

print("Monitoring Vercel deployment. Checking every 5 seconds...")
for i in range(20):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache'})
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8')
            scripts = re.findall(r'src="([^"]+)"', html)
            if scripts:
                current_script = scripts[0]
                if current_script != old_script:
                    print(f"DEPLOYED! New asset detected: {current_script}")
                    break
                else:
                    print(f"Attempt {i+1}: Still serving old asset {old_script}")
            else:
                print("No scripts found in HTML.")
    except Exception as e:
        print("Error:", e)
    time.sleep(5)
else:
    print("Timeout: New deployment not detected yet.")
