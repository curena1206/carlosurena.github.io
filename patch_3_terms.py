#!/usr/bin/env python3
with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

log = []

def rep(label, old, new):
    global html
    if old in html:
        html = html.replace(old, new, 1)
        log.append(f"  OK  [{label}]")
    else:
        log.append(f"  MISS [{label}]")

# 1. R5 recommendation — Trading/FX owner
rep("1. R5 owner — Trading/FX",
    'owner: "Product + Trading/FX + Sales"',
    'owner: "Product + Pricing + Sales"')

# 2. R9 recommendation — Network Management owner
rep("2. R9 owner — Network Management",
    'owner: "Network Management + Product + Finance"',
    'owner: "Portfolio Management + Product + Finance"')

# 3. Band 2 static priority 4 KPI — balance linkage rate
rep("3. Band 2 P4 KPI — balance linkage rate",
    'kpi: "Treasury contribution per deal, balance linkage rate"',
    'kpi: "Treasury contribution per deal, balance contribution rate"')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
