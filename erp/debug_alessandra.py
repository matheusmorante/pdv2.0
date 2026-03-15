import requests
import json

url = "https://wzpdfmihnwcrgkyagwkd.supabase.co/rest/v1/orders"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY"
}
params = {
    "order": "id.desc",
    "limit": 50
}

response = requests.get(url, headers=headers, params=params)
if response.status_code == 200:
    data = response.json()
    alessandra = [o for o in data if "Alessandra" in json.dumps(o.get("order_data", ""))]
    with open("alessandra_debug.json", "w") as f:
        json.dump(alessandra, f, indent=2)
    print(f"Found {len(alessandra)} matches.")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
