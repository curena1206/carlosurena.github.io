#!/usr/bin/env python3
"""
Surgical language normalization — approved replacements only.
Run from carlosurena.github.io directory:
    python3 patch_normalize_surgical.py
"""

with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

log = []

def rep(label, old, new, expected=None):
    global html
    count = html.count(old)
    if count == 0:
        log.append(f"  MISS [{label}]")
    else:
        html = html.replace(old, new)
        log.append(f"  OK  [{label}] ({count}x)")

# ── GLOBAL — safe surgical replacements ──────────────────────────────────────

rep("organizational complexity → operating complexity",
    'organizational complexity', 'operating complexity')

rep("organizational change → management change",
    'organizational change', 'management change')

rep("Organizational scale → Scale",
    'Organizational scale', 'Scale')

rep("organizational dependency → concentration risk",
    'organizational dependency', 'concentration risk')

rep("future capability → emerging capability",
    'future capability', 'emerging capability')

rep("future capabilities → emerging capabilities",
    'future capabilities', 'emerging capabilities')

rep("future-state → next-stage",
    'future-state', 'next-stage')

rep("Institutionalize → Establish",
    'Institutionalize', 'Establish')

rep("institutionalize → establish",
    'institutionalize', 'establish')

rep("commercial expansion → portfolio expansion",
    'commercial expansion', 'portfolio expansion')

# ── BAND 1 — FOUNDATIONAL GAPS ───────────────────────────────────────────────

rep("B1 key_issue 1 — meaningful/portfolio pressure",
    'Exception and repair volume may be creating meaningful operational and portfolio pressure',
    'Exception and repair volume may be creating measurable operational pressure across the franchise.')

rep("B1 key_issue 2 — fragmented → inconsistent",
    'Pricing governance appears fragmented \u2014 override behavior without consistent review',
    'Pricing governance appears inconsistent \u2014 override behavior lacks structured review.')

rep("B1 key_issue 3 — absent → limited",
    'Portfolio management rhythm appears absent \u2014 metrics undefined or inconsistently reviewed',
    'Portfolio management rhythm appears limited \u2014 metrics may not be consistently defined or reviewed.')

# ── BAND 2 — DEVELOPING FRANCHISE ────────────────────────────────────────────

rep("B2 benchmark — institutionalized → embedded",
    'current practices become institutionalized before structural improvement occurs.',
    'current practices may become embedded before structural improvement occurs.')

rep("B2 P2 title — Cadence → Process",
    '"Launch Portfolio Performance Review Cadence"',
    '"Launch Portfolio Performance Review Process"')

# ── BAND 3 — OPERATIONALLY STABLE ────────────────────────────────────────────

rep("B3 benchmark — platform → operating foundation",
    'The platform appears stable',
    'The operating foundation appears stable')

rep("B3 immediate_focus — commercial optimization → improvement",
    'commercial optimization',
    'commercial improvement')

# ── BAND 4 — STRATEGICALLY ALIGNED ───────────────────────────────────────────

rep("B4 P2 title — Institutionalize already covered above",
    # Handled by global Institutionalize → Establish above
    'SKIP_THIS_ONE_ALREADY_HANDLED', 'SKIP')

# ── WRITE ─────────────────────────────────────────────────────────────────────

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Surgical normalization results:")
for l in log:
    if 'SKIP' not in l:
        print(l)
real = [l for l in log if 'SKIP' not in l]
ok   = sum(1 for l in real if l.startswith("  OK"))
miss = sum(1 for l in real if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
