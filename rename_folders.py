import os
import shutil

renames = {
    "erp-admin": "erp",
    "erp-store": "ecommerce",
    "erp-automation": "automation",
    "erp-api": "api"
}

for old, new in renames.items():
    if os.path.exists(old):
        try:
            os.rename(old, new)
            print(f"Renamed {old} to {new}")
        except Exception as e:
            print(f"Error renaming {old}: {e}")
    else:
        print(f"{old} does not exist")
