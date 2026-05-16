#!/usr/bin/env python3
"""
Apply 12 approved system-level edits to pfi.html.
Run from carlosurena.github.io directory:
    python3 patch_system_edits.py
"""

with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

log = []

def rep(label, old, new):
    global html
    if old in html:
        html = html.replace(old, new)
        log.append(f"  OK  [{label}]")
    else:
        log.append(f"  MISS [{label}]")

# ── 1. Strategic takeaways — remove "The priority is to..." pattern ───────────

rep("B1 strategic_takeaway",
    'The priority is to stabilize governance, operating discipline, and management visibility before expanding commercial activity.',
    'Near-term focus is stabilizing governance, operating discipline, and management visibility before expanding commercial activity.')

rep("B2 strategic_takeaway",
    'The priority is to tighten governance, establish recurring management visibility, and connect economics more consistently across products and relationships.',
    'Near-term focus shifts toward tightening governance, establishing recurring visibility, and connecting economics more consistently across products and relationships.')

rep("B3 strategic_takeaway",
    'The priority is to move from baseline control toward more consistent monetization, client-level visibility, and strategic portfolio steering.',
    'The shift moves from baseline control toward more consistent monetization, client-level visibility, and strategic portfolio steering.')

rep("B4 strategic_takeaway",
    'The priority is to sustain current discipline while preparing the franchise for the next stage of infrastructure, client, and competitive change.',
    'Sustaining current discipline while preparing for the next stage of infrastructure, client, and competitive change becomes increasingly important.')

rep("B5 strategic_takeaway",
    'The priority is to preserve institutional discipline while continuing to build emerging operating capability, resilience, and client integration.',
    'Preserving institutional discipline while continuing to build resilience and emerging capability becomes central at this stage.')

# ── 2. "Convert X into Y" pattern — Band 3 ───────────────────────────────────

rep("B3 benchmark — convert → build on",
    'convert operational discipline into sustained commercial momentum',
    'build on operating discipline to support sustained commercial momentum')

rep("B3 immediate_focus — convert → build on",
    'convert existing stability into more consistent and disciplined portfolio performance',
    'build on existing stability to support more consistent portfolio performance')

# ── 3. Over-diagnosis — Band 2 structural_issue 1 ────────────────────────────

rep("B2 structural_issue 1 — insufficiently governed",
    'Pricing override behavior appears insufficiently governed across the portfolio.',
    'Pricing override behavior may lack consistent governance across the portfolio.')

# ── 4. Over-certainty — Band 5 key_issues ────────────────────────────────────

rep("B5 key_issue — requires → may require",
    'Market leadership positioning requires active investment in differentiation',
    'Market leadership positioning may require active investment in differentiation')

# ── 5. Management visibility density — Band 1 (2 replacements) ───────────────

# exec_diagnosis — "reporting discipline" (Carlos's correction)
rep("B1 exec_diagnosis — management visibility → reporting discipline",
    'governance, pricing discipline, management visibility, and portfolio management.',
    'governance, pricing discipline, reporting discipline, and portfolio management.')

# Priority 2 Why — "operating visibility" (Carlos's correction)
rep("B1 P2 Why — management visibility → operating visibility",
    'sustained improvement and management visibility.',
    'sustained improvement and operating visibility.')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("System-level edit results:")
for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
