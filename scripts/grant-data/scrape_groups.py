"""Collect 2025 grant results per programme group (ГОП) from univision.kz group pages.
Usage: python -I scrape_groups.py <groups.json> <out.json> <raw_dir>
"""
import json, re, sys, time, urllib.request, html, os

groups_path, out_path, raw_dir = sys.argv[1:4]
groups = json.load(open(groups_path, encoding="utf-8"))
os.makedirs(raw_dir, exist_ok=True)

def get(url, cache):
    if os.path.exists(cache):
        return open(cache, encoding="utf-8").read()
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research script)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        txt = r.read().decode("utf-8", "replace")
    open(cache, "w", encoding="utf-8").write(txt)
    time.sleep(0.6)
    return txt

def clean(s):
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()

def block(page, key):
    m = re.search(r'id="collapsequota_25_%s"(.*?)</table>' % key, page, re.S)
    if not m:
        return None
    body = m.group(1)
    head = re.search(r'aria-controls="collapsequota_25_%s">(.*?)</button>' % key, page, re.S)
    summ = re.search(r"Минимальный балл - (\d+), получили грант - (\d+)", body)
    rows = []
    for tr in re.findall(r"<tr>(.*?)</tr>", body, re.S):
        tds = re.findall(r"<td>(.*?)</td>", re.sub(r"<!--.*?-->", "", tr, flags=re.S), re.S)
        if len(tds) < 3:
            continue
        a = re.search(r'href="/univ/([^/"]+)/?"', tds[0])
        if not a:
            continue
        try:
            rows.append({"univ": a.group(1), "name": clean(tds[0]), "min": int(clean(tds[1])), "grants": int(clean(tds[2]))})
        except ValueError:
            pass
    return {
        "label": clean(head.group(1)) if head else "",
        "min": int(summ.group(1)) if summ else None,
        "grants": int(summ.group(2)) if summ else None,
        "rows": rows,
    }

out = []
for code_name, href in groups:
    code = code_name.split(" ")[0]
    url = "https://univision.kz" + href
    try:
        page = get(url, os.path.join(raw_dir, code + ".html"))
    except Exception as e:
        print("FAIL", code, e)
        continue
    subj = re.search(r"Предметы на ЕНТ</span>\s*(.*?)</div>", page, re.S)
    area = re.search(r"Область образования</span>\s*(.*?)</div>", page, re.S)
    cnt = re.search(r'id="countGrants".*?<tbody>(.*?)</tbody>', page, re.S)
    counts = {}
    if cnt:
        for tr in re.findall(r"<tr>(.*?)</tr>", cnt.group(1), re.S):
            tds = [clean(x) for x in re.findall(r"<td>(.*?)</td>", tr, re.S)]
            if len(tds) >= 2:
                counts[tds[0]] = tds[1]
    entry = {
        "code": code,
        "name_ru": code_name[len(code) + 1:],
        "subjects_ru": clean(subj.group(1)) if subj else "",
        "area_ru": clean(area.group(1)) if area else "",
        "grants2025": counts,
        "general": block(page, 0),
        "rural": None,
        "source": url,
    }
    # find the rural block among the quota blocks by label
    for k in range(0, 9):
        b = block(page, k)
        if b and "Сельская" in b["label"]:
            entry["rural"] = b
        if b and "Общий" in b["label"]:
            entry["general"] = b
    out.append(entry)
    print(code, entry["subjects_ru"], (entry["general"] or {}).get("min"), len((entry["general"] or {}).get("rows", [])))

json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("saved", len(out))
