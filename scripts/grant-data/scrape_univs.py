"""Collect university metadata + 2025 grant results from univision.kz.
Usage: python -I scrape_univs.py <slugs.json> <out.json> <raw_dir>
"""
import json, re, sys, time, urllib.request, html, os

slugs_path, out_path, raw_dir = sys.argv[1:4]
slugs = json.load(open(slugs_path))
os.makedirs(raw_dir, exist_ok=True)


def get(url, cache):
    if os.path.exists(cache):
        return open(cache, "rb").read()
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research script)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        b = r.read()
    open(cache, "wb").write(b)
    time.sleep(0.6)
    return b


def dec(b):
    try:
        return b.decode("utf-8")
    except UnicodeDecodeError:
        return b.decode("cp1251", "replace")


def clean(s):
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


out = []
for slug in slugs:
    uid = slug.split("-")[0]
    try:
        main = dec(get(f"https://univision.kz/univ/{slug}/", os.path.join(raw_dir, f"{uid}.html")))
        ball = dec(get(f"https://univision.kz/univ/{slug}/ball", os.path.join(raw_dir, f"{uid}_ball.html")))
    except Exception as e:
        print("FAIL", slug, e)
        continue
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", main, re.S)
    areas = re.findall(r'href="/univ/area/([a-z0-9-]+)\.html"[^>]*>(.*?)</a>', main)
    code = re.search(r"Код вуза\s*-\s*(\d+)", main)
    cat = re.findall(r'href="/univ/category/([a-z0-9-]+)\.html"[^>]*>(.*?)</a>', main)
    typ = re.findall(r'href="/univ/type/([a-z0-9-]+)\.html"[^>]*>(.*?)</a>', main)
    site = re.search(r'<i class="ai-external-link[^"]*"></i>\s*<a[^>]*href="([^"]+)"', main)
    # feature flags shown on the page (dormitory, military department) — keep raw labels
    feats = [clean(x) for x in re.findall(r'<li class="d-flex\s+pt-2 pb-2 border-bottom">(.*?)</li>', main, re.S)]
    quotas = {}
    for m in re.finditer(r'aria-controls="collapse_quota_quota_25_(\d+)">(.*?)</button>.*?<tbody>(.*?)</tbody>', ball, re.S):
        label = clean(m.group(2))
        rows = []
        for tr in re.findall(r"<tr>(.*?)</tr>", m.group(3), re.S):
            tds = re.findall(r"<td>(.*?)</td>", re.sub(r"<!--.*?-->", "", tr, flags=re.S), re.S)
            if len(tds) < 3:
                continue
            g = re.search(r'href="/edu-program/group/([^"]+)\.html"', tds[0])
            name = clean(tds[0])
            cm = re.match(r"(B[A-Z]?\d{3})\s+(.*)", name)
            try:
                rows.append({"code": cm.group(1) if cm else name, "name": cm.group(2) if cm else name, "href": g.group(1) if g else "", "min": int(clean(tds[1])), "grants": int(clean(tds[2]))})
            except ValueError:
                pass
        quotas[m.group(1)] = {"label": label, "rows": rows}
    out.append({
        "id": uid,
        "slug": slug,
        "name_ru": clean(h1.group(1)) if h1 else slug,
        "areas": [[a, clean(t)] for a, t in areas],
        "code": code.group(1) if code else None,
        "category": [[a, clean(t)] for a, t in cat],
        "type": [[a, clean(t)] for a, t in typ],
        "site": site.group(1) if site else None,
        "features": feats[:12],
        "quotas": quotas,
        "source": f"https://univision.kz/univ/{slug}/ball",
    })
    print(uid, len(quotas))

json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("saved", len(out))
