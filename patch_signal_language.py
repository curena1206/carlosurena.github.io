#!/usr/bin/env python3
"""
Signal language normalization — 12 approved changes.
Run from carlosurena.github.io directory:
    python3 patch_signal_language.py
"""

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

# ── PRICING / FX RULE ─────────────────────────────────────────────────────────

rep("1. FX pattern_flag",
    'pattern_flag:"FX-related revenue may not be consistently captured across cross-border payment flows."',
    'pattern_flag:"Revenue opportunities within payment flows may not be consistently visible across client and transaction activity."')

rep("2. FX priority title",
    'title:"Develop FX Pricing and Spread Management Discipline"',
    'title:"Develop Pricing Visibility and Revenue Capture Discipline"')

rep("3. FX priority KPI",
    'kpi:"FX capture rate, spread variance by corridor, corridor-level contribution"',
    'kpi:"Revenue capture rate, pricing realization across payment flows, contribution visibility"')

rep("4. FX priority why",
    'why:"Cross-border flows are among the more recoverable margin opportunities in commercial payments."',
    'why:"Revenue capture gaps across payment flows are often among the more recoverable margin opportunities in a commercial payments portfolio."')

rep("5. FX advisory description",
    'description:"Cross-border corridor economics and FX spread management analysis."',
    'description:"Payment flow economics and pricing visibility analysis."')

# ── RAIL / CROSS-BORDER RULE ──────────────────────────────────────────────────

rep("6. Cross-border pattern_flag",
    'pattern_flag:"Cross-border and correspondent flows may not be consistently managed for economics and service quality."',
    'pattern_flag:"Payment flows may not yet be managed consistently across economics, servicing structure, and client experience."')

rep("7. Cross-border priority title",
    'title:"Establish Cross-Border Flow Management with Economic Visibility"',
    'title:"Establish Payment Flow Visibility and Management Discipline"')

rep("8. Cross-border priority KPI",
    'kpi:"Corridor economics, partner cost trends, service performance by flow"',
    'kpi:"Flow economics, servicing structure, client experience consistency by flow"')

rep("9. Cross-border advisory description",
    'description:"Corridor-level economic visibility and correspondent partner review."',
    'description:"Flow-level economic visibility and servicing structure review."')

# ── TREASURY ──────────────────────────────────────────────────────────────────

rep("10. Treasury coordination pattern_flag",
    'pattern_flag:"Treasury and payments coordination may be operating with limited structural integration."',
    'pattern_flag:"Treasury contribution and payment activity may not yet be consistently integrated into broader portfolio economics."')

# ── COST VISIBILITY ───────────────────────────────────────────────────────────

rep("11. Cost advisory description — correspondent",
    'description:"End-to-end cost visibility model including correspondent and network costs."',
    'description:"End-to-end cost visibility model including internal processing and external network costs."')

# ── RAIL ECONOMICS ────────────────────────────────────────────────────────────

rep("12. Rail economics advisory description — corridor",
    'description:"Rail and corridor-level cost attribution and pricing floor analysis."',
    'description:"Rail and flow-level cost attribution and pricing floor analysis."')

# ── WRITE ─────────────────────────────────────────────────────────────────────

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Signal language normalization results:")
for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
