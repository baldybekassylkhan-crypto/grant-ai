"""Turn scraped univision.kz data into compact site data files.
Usage: python -I build_data.py <scratch_dir> <out_dir>
"""
import json, re, sys, os

S, OUT = sys.argv[1:3]
os.makedirs(OUT, exist_ok=True)
groups = {g["code"]: g for g in json.load(open(f"{S}/groups_data.json", encoding="utf-8"))}
univs = json.load(open(f"{S}/univs_data.json", encoding="utf-8"))
kk = json.load(open(f"{S}/kk_names.json", encoding="utf-8"))
gpairs = json.load(open(f"{S}/group_pairs.json", encoding="utf-8"))
bm_page = open(f"{S}/raw/BM086.html", encoding="utf-8", errors="replace").read()

PAIR_RU = {
    "Математика и Физика": "math-physics",
    "Математика и Информатика": "math-informatics",
    "Математика и География": "math-geography",
    "Биология и Химия": "biology-chemistry",
    "Биология и География": "biology-geography",
    "Иностранный язык и Всемирная история": "foreign-worldhistory",
    "География и Иностранный язык": "geography-foreign",
    "Всемирная история и Основы права": "worldhistory-law",
    "Всемирная история и География": "worldhistory-geography",
    "Казахский/Русский язык и Казахская/Русская литература": "language-literature",
    "Казахский язык и Казахская литература": "language-literature",
    "Русский язык и Русская литература": "language-literature",
    "Химия и Физика": "chemistry-physics",
    "Творческий экзамен и Творческий экзамен": "creative",
}
SUBJ_SLUG = {
    "4-matematika-i-fizika": "math-physics",
    "19-matematika-i-informatika": "math-informatics",
    "14-matematika-i-geografiya": "math-geography",
    "6-himiya-i-biologiya": "biology-chemistry",
    "1-biologiya-i-geografiya": "biology-geography",
    "11-inostrannyy-yazyk-i-vsemirnaya-istoriya": "foreign-worldhistory",
    "18-geografiya-i-inostrannyy-yazyk": "geography-foreign",
    "16-vsemirnaya-istoriya-i-chelovek-obshchestvo-pravo": "worldhistory-law",
    "3-vsemirnaya-istoriya-i-geografiya": "worldhistory-geography",
    "9-kazahskiy-yazyk-i-kazahskaya-literatura": "language-literature",
    "10-russkiy-yazyk-i-russkaya-literatura": "language-literature",
    "13-kazahskiy-russkiy-yazyk-i-kazahskaya-russkaya-literatura": "language-literature",
    "17-himiya-i-fizika": "chemistry-physics",
    "2-tvorcheskiy-ekzamen-i-tvorcheskiy-ekzamen": "creative",
}
MEDICAL = {"BM086": "biology-chemistry", "BM087": "biology-chemistry", "BM088": "biology-chemistry", "BM089": "biology-chemistry", "B083": "biology-chemistry"}

CITY = {
    "almaty": ("Алматы", "Алматы"), "nur-sultan-astana": ("Астана", "Астана"), "shymkent": ("Шымкент", "Шымкент"),
    "karaganda": ("Қарағанды", "Караганда"), "kyzylorda": ("Қызылорда", "Кызылорда"), "taraz": ("Тараз", "Тараз"),
    "semey": ("Семей", "Семей"), "uralsk": ("Орал", "Уральск"), "aktobe": ("Ақтөбе", "Актобе"), "kostanay": ("Қостанай", "Костанай"),
    "atyrau": ("Атырау", "Атырау"), "ust-kamenogorsk": ("Өскемен", "Усть-Каменогорск"), "kokshetau": ("Көкшетау", "Кокшетау"),
    "pavlodar": ("Павлодар", "Павлодар"), "turkestan": ("Түркістан", "Туркестан"), "taldykorgan": ("Талдықорған", "Талдыкорган"),
    "aktau": ("Ақтау", "Актау"), "arkalyk": ("Арқалық", "Аркалык"), "ekibastuz": ("Екібастұз", "Экибастуз"),
    "zhezkazgan": ("Жезқазған", "Жезказган"), "temirtau": ("Теміртау", "Темиртау"), "rudnyy": ("Рудный", "Рудный"),
    "petropavlovsk": ("Петропавл", "Петропавловск"), "tal": ("Талғар", "Талгар"),
}
CAT = {"national": "state", "state": "state", "private": "private", "international": "international", "stocked": "jsc"}


def pair_for(code, g):
    if code in MEDICAL:
        return MEDICAL[code]
    if g and g.get("subjects_ru") in PAIR_RU:
        return PAIR_RU[g["subjects_ru"]]
    if g:
        href = g["source"].replace("https://univision.kz", "")
        for slug in gpairs.get(href, []):
            if slug in SUBJ_SLUG:
                return SUBJ_SLUG[slug]
    return None


# group-level (national) minimums from group pages; BM086 from its own page
nat = {}
for code, g in groups.items():
    nat[code] = {
        "gen": [g["general"]["min"], g["general"]["grants"]] if g.get("general") and g["general"].get("min") is not None else None,
        "rural": [g["rural"]["min"], g["rural"]["grants"]] if g.get("rural") and g["rural"].get("min") is not None else None,
    }
for key, label in (("gen", "Общий"), ("rural", "Сельская")):
    m = re.search(r"\(2025\) %s[^<]*</button>.*?Минимальный балл - (\d+), получили грант - (\d+)" % label, bm_page, re.S)
    if m:
        nat.setdefault("BM086", {"gen": None, "rural": None})[key] = [int(m.group(1)), int(m.group(2))]

progs = {}
uni_out = []
for u in univs:
    q = u["quotas"]
    gen_rows = q.get("0", {}).get("rows", [])
    rural = next((v for v in q.values() if "Сельская" in v["label"]), {"rows": []})
    pmap = {}
    for r in gen_rows:
        pmap.setdefault(r["code"], {"c": r["code"], "g": None, "r": None})["g"] = [r["min"], r["grants"]]
        progs.setdefault(r["code"], {"ru": r["name"]})
    for r in rural["rows"]:
        pmap.setdefault(r["code"], {"c": r["code"], "g": None, "r": None})["r"] = [r["min"], r["grants"]]
        progs.setdefault(r["code"], {"ru": r["name"]})
    city_slug = next((a for a, _ in reversed(u["areas"]) if a in CITY), None)
    feats = " ".join(u.get("features", []))
    code = re.search(r"Код вуза\s*-\s*(\d+)", feats)
    kkname = kk["univs"].get(u["id"], "")
    kkcode = re.match(r"\s*(\d{3})\s*-\s*", kkname)
    kkname = re.sub(r"^\s*\d*\s*-\s*", "", kkname).replace("​", "").strip()
    cat = CAT.get(u["category"][0][0], "state") if u["category"] else "state"
    uni_out.append({
        "id": u["id"],
        "slug": u["slug"],
        "ru": u["name_ru"],
        "kk": kkname or u["name_ru"],
        "city": city_slug,
        "cat": cat,
        "type": u["type"][0][0] if u["type"] else "university",
        "national": "национальн" in u["name_ru"].lower(),
        "site": u["site"],
        "code": (code.group(1) if code else (kkcode.group(1) if kkcode else None)),
        "progs": sorted(pmap.values(), key=lambda x: x["c"]),
        "source": u["source"],
    })

prog_out = []
codes = sorted(set(progs) | {c for c in groups if nat.get(c, {}).get("gen")})
for code in codes:
    g = groups.get(code)
    rows = [(u["id"], p) for u in uni_out for p in u["progs"] if p["c"] == code]
    n = nat.get(code) or {"gen": None, "rural": None}
    if not n["gen"] and rows:
        gs = [p["g"] for _, p in rows if p["g"]]
        if gs:
            n["gen"] = [min(x[0] for x in gs), sum(x[1] for x in gs)]
    if not n["rural"] and rows:
        rs = [p["r"] for _, p in rows if p["r"]]
        if rs:
            n["rural"] = [min(x[0] for x in rs), sum(x[1] for x in rs)]
    ru = (g["name_ru"] if g else None) or progs.get(code, {}).get("ru", code)
    prog_out.append({
        "code": code,
        "ru": ru,
        "kk": kk["groups"].get(code) or ru,
        "pair": pair_for(code, g),
        "area": (g or {}).get("area_ru", ""),
        "grants2025": (g or {}).get("grants2025", {}),
        "gen": n["gen"],
        "rural": n["rural"],
        "unis": len(rows),
        "source": (g or {}).get("source") or "https://univision.kz/edu-program/group/BM086-medicina-3.html",
    })

meta = {"year": 2025, "source": "univision.kz (results of the 2025 state education grant competition)", "collected": "2026-11-14", "cities": {k: {"kk": v[0], "ru": v[1]} for k, v in CITY.items()}}
json.dump({"meta": meta, "programs": prog_out}, open(f"{OUT}/programs.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
json.dump({"meta": meta, "universities": uni_out}, open(f"{OUT}/universities.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
rep = open(f"{S}/build_report.txt", "w", encoding="utf-8")
print("programs", len(prog_out), "with pair", sum(1 for p in prog_out if p["pair"]), "with gen", sum(1 for p in prog_out if p["gen"]), file=rep)
print("no pair:", [(p["code"], p["ru"]) for p in prog_out if not p["pair"]], file=rep)
print("universities", len(uni_out), "with progs", sum(1 for u in uni_out if u["progs"]), "no city", [u["ru"] for u in uni_out if not u["city"]], file=rep)
print("no code", sum(1 for u in uni_out if not u["code"]), file=rep)
print(json.dumps(prog_out[:2], ensure_ascii=False), file=rep)
