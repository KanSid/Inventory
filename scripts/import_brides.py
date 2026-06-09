import csv
import re
import unicodedata
import json
from datetime import datetime

CSV_PATH = r"C:\Users\Sreelakshmi S\OneDrive\Desktop\nf\Store ad7be75d2792477986ce2d8dc9383def.csv"


def clean_unicode(s: str) -> str:
    """Strip invisible/directional unicode chars."""
    return "".join(c for c in s if unicodedata.category(c) not in ("Cf",))


def normalize_phone(raw: str) -> str | None:
    raw = clean_unicode(raw).strip()
    if not raw or raw in (".", "-", "N/A", "n/a"):
        return None

    # If already starts with +, clean internal spaces/parens/dashes
    if raw.startswith("+"):
        digits = re.sub(r"[^\d]", "", raw)
        return "+" + digits

    # Strip all non-digit chars
    digits = re.sub(r"[^\d]", "", raw)

    if not digits:
        return None

    if len(digits) == 10:
        return "+91" + digits
    else:
        return "+" + digits


def parse_date(raw: str) -> str | None:
    raw = raw.strip()
    if not raw:
        return None
    # Try DD/MM/YYYY
    try:
        dt = datetime.strptime(raw, "%d/%m/%Y")
        return dt.strftime("%Y-%m-%d")
    except ValueError:
        pass
    # Try "Month DD, YYYY"
    for fmt in ("%B %d, %Y", "%b %d, %Y"):
        try:
            dt = datetime.strptime(raw, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            pass
    return None


def escape_sql(s: str) -> str:
    return s.replace("'", "''")


brides = []

with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
    reader = csv.reader(f)
    headers = next(reader)
    # Headers: 5K Paid on, Phone, Bride, DDesigner, Wedding Date, ...
    for row in reader:
        if len(row) < 5:
            continue
        name_raw = clean_unicode(row[2]).strip()
        phone_raw = row[1].strip()
        wedding_raw = row[4].strip()

        if not name_raw:
            continue

        phone = normalize_phone(phone_raw)
        wedding_date = parse_date(wedding_raw)

        brides.append({
            "name": name_raw,
            "phone": phone,
            "wedding_date": wedding_date,
        })

# Build SQL
lines = []
for b in brides:
    name = escape_sql(b["name"])
    phone = f"'{escape_sql(b['phone'])}'" if b["phone"] else "NULL"
    wedding = f"'{b['wedding_date']}'" if b["wedding_date"] else "NULL"
    lines.append(f"  ('{name}', {phone}, NULL, {wedding})")

sql = "INSERT INTO brides (name, phone, email, wedding_date) VALUES\n"
sql += ",\n".join(lines)
sql += "\nON CONFLICT DO NOTHING;"

with open(r"D:\Kannan\coding\d_aisle_inventory\scripts\brides_insert.sql", "w", encoding="utf-8") as f:
    f.write(sql)

print(f"Generated {len(brides)} brides")
print("Phone samples:")
for b in brides[:10]:
    print(f"  {b['name']!r:40s} {b['phone']!r}")
