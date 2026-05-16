#!/usr/bin/env python3
"""
Final visible-leak cleanup — 8 targeted changes across pfi.html and consulting.html.
Run from carlosurena.github.io directory:
    python3 patch_final_cleanup.py
"""

import os

log = []

def patch(filepath, label, old, new):
    if not os.path.exists(filepath):
        log.append(f"  FILE NOT FOUND  [{label}]")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    n = html.count(old)
    if n == 0:
        log.append(f"  MISS  [{label}]")
    else:
        html = html.replace(old, new)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        log.append(f"  OK  [{label}] ({n}x)")

PFI = "pfi.html"
CON = "consulting.html"

# 1. R9 metric
patch(PFI, "R9 metric — correspondent",
    'metric: "Cost per payment by rail, correspondent and network fee trends"',
    'metric: "Cost per payment by rail, external network and provider fee trends"')

# 2. Old rules engine diagnoses
patch(PFI, "Rules diagnosis — FX/cross-border flow",
    '"FX-related payment activity appears present but cross-border flow management and spread discipline may not be fully operationalized. This pattern may be associated with inconsistent FX monetization across the portfolio."',
    '"Payment flow revenue activity appears present, though pricing discipline and economics management may not yet be consistently applied across flows."')

patch(PFI, "Rules diagnosis — Cross-border FX corridor",
    '"Cross-border FX activity is present but spread management and corridor economics may not be consistently applied. This pattern tends to become more visible as cross-border volume grows."',
    '"International payment activity appears present, though pricing and revenue capture discipline may not yet be consistently integrated."')

# 3. R1 metric — corridor
patch(PFI, "R1 metric — corridor",
    'title: "Design and implement segmented pricing by client value and corridor"',
    'title: "Design and implement segmented pricing by client value and payment flow"')

# 4. consulting.html — FX Spread
patch(CON, "FX Spread → Payment Spread",
    '+ FX Spread',
    '+ Payment Spread')

# 5. consulting.html — Network / Correspondent Fee
patch(CON, "Network / Correspondent Fee → Intermediary Fee",
    '- Network / Correspondent Fee',
    '- Network / Intermediary Fee')

# 6. consulting.html — institutions → franchises
patch(CON, "institutions → franchises",
    'The institutions that manage this well are usually the ones with the clearest portfolio visibility.',
    'The franchises that manage this well are usually the ones with the clearest portfolio visibility.')

# 7. consulting.html — leadership → management
patch(CON, "leadership → management (consulting.html)",
    'but leadership needs a clearer portfolio-level view.',
    'but management needs a clearer portfolio-level view.')

print("Final cleanup results:")
for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
