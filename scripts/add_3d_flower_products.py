"""
Script to add 3D Flower products to the D'Aisle inventory database.
Downloads images from S3 and uploads to Supabase storage, then creates product records.
"""
import os
import sys
import secrets
import requests

SUPABASE_URL = "https://yknooquxjgxocgepjzsg.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm9vcXV4amd4b2NnZXBqenNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTEzMDAzNSwiZXhwIjoyMDkwNzA2MDM1fQ.gGW8UiQ43i1ZcW2QBiZQX9H1KZDDvshq9XQAZr5T904"

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

S3_BASE = "https://utilize-app-prod-files.s3.amazonaws.com/notion-apps/6666d47ece423d9e1f9a0088"

PRODUCTS = [
    {"item_code": "FL001", "image_file": "ed64101d-1e43-4876-bdce-b407dd149c88.jpeg"},
    {"item_code": "FL002", "image_file": "831a6096-d9f8-4272-9c26-de8e028df0d6.jpeg"},
    {"item_code": "FL003", "image_file": "70b6e287-38bf-43a0-924c-2f69231612fc.jpeg"},
    {"item_code": "FL004", "image_file": "6e4471ce-4efe-42b3-8c92-7d154c1546fa.jpeg"},
    {"item_code": "FL005", "image_file": None},
    {"item_code": "FL006", "image_file": "12f7e34d-c764-482d-9591-16964b31d17a.jpeg"},
    {"item_code": "FL007", "image_file": "2bd766f2-2f03-4af3-9657-c7ff6a58ba7a.jpeg"},
    {"item_code": "FL008", "image_file": "cabfb31d-32c4-4754-9e92-3e2701d3f93f.jpeg"},
    {"item_code": "FL009", "image_file": "4235aa54-e8f9-45ae-a74b-783d778ad078.jpeg"},
    {"item_code": "FL010", "image_file": "2533261e-51d7-464c-ad03-4e1b35a9aa52.jpeg"},
    {"item_code": "FL011", "image_file": "b0ba6a75-cd51-47be-bb48-26aa0c74dcbe.jpeg"},
    {"item_code": "FL012", "image_file": "2c933e42-3044-439e-8396-437821ca6011.jpeg"},
    {"item_code": "FLR001", "image_file": "546caede-43e8-40d9-bbe1-4988c9a5b220.jpeg"},
    {"item_code": "FLR002", "image_file": "871ea2a5-0d80-49d6-b130-70d395f1bd48.jpeg"},
    {"item_code": "FLR003", "image_file": "029ce4c2-f136-4b77-9385-22a085334d95.jpeg"},
    {"item_code": "FLR004", "image_file": "64b65418-ddb5-4faf-9d51-955a77afab65.jpeg"},
    {"item_code": "FLR005", "image_file": "da39f7a5-4075-49a9-b9c1-5865a5136535.jpeg"},
    {"item_code": "FLR006", "image_file": "aeb2bbdf-a3a6-4e25-887d-f3dc4b140266.jpeg"},
]


def get_3d_flower_category_id():
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/categories",
        headers=HEADERS,
        params={"name": "eq.3D Flower", "select": "id,name"},
    )
    resp.raise_for_status()
    rows = resp.json()
    if not rows:
        print("ERROR: '3D Flower' category not found in database.")
        print("Available categories:")
        all_cats = requests.get(
            f"{SUPABASE_URL}/rest/v1/categories",
            headers=HEADERS,
            params={"select": "id,name"},
        ).json()
        for c in all_cats:
            print(f"  - {c['name']} ({c['id']})")
        sys.exit(1)
    return rows[0]["id"]


def upload_image(image_file: str) -> str | None:
    """Download from S3 and upload to Supabase storage. Returns public URL or None."""
    url = f"{S3_BASE}/{image_file}"
    print(f"  Downloading {image_file}...")
    resp = requests.get(url, timeout=30)
    if resp.status_code != 200:
        print(f"  WARNING: Could not download {url} (status {resp.status_code}), skipping image.")
        return None

    filename = f"products/{secrets.token_hex(16)}.jpg"
    storage_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{filename}"
    upload_headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "image/jpeg",
    }
    up = requests.post(storage_url, headers=upload_headers, data=resp.content)
    if up.status_code not in (200, 201):
        print(f"  WARNING: Upload failed ({up.status_code}): {up.text}")
        return None

    public_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{filename}"
    print(f"  Uploaded -> {public_url}")
    return public_url


def product_exists(item_code: str) -> bool:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/products",
        headers=HEADERS,
        params={"item_code": f"eq.{item_code}", "select": "id"},
    )
    return bool(resp.json())


def create_product(item_code: str, category_id: str, image_url: str | None):
    payload = {
        "item_code": item_code,
        "description": "",
        "category_id": category_id,
        "image_url": image_url,
        "low_stock_threshold": 10,
        "is_phased_out": False,
    }
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/products",
        headers={**HEADERS, "Prefer": "return=representation"},
        json=payload,
    )
    if resp.status_code in (200, 201):
        print(f"  Created product {item_code}")
    else:
        print(f"  ERROR creating {item_code}: {resp.status_code} {resp.text}")


def main():
    print("Fetching '3D Flower' category ID...")
    category_id = get_3d_flower_category_id()
    print(f"Category ID: {category_id}\n")

    for p in PRODUCTS:
        item_code = p["item_code"]
        print(f"Processing {item_code}...")

        if product_exists(item_code):
            print(f"  SKIPPING: {item_code} already exists.\n")
            continue

        image_url = None
        if p["image_file"]:
            image_url = upload_image(p["image_file"])

        create_product(item_code, category_id, image_url)
        print()

    print("Done!")


if __name__ == "__main__":
    main()
