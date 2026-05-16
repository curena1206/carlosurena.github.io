#!/usr/bin/env python3
"""
Final surgical patch — all remaining issues across 5 bands.
Run from carlosurena.github.io directory:
    python3 patch_final_scenarios.py
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

# ═══════════════════════════════════════════════════════
# BAND 1 — FOUNDATIONAL GAPS
# ═══════════════════════════════════════════════════════

rep("B1 P1 Why — cadenced review → regular review",
    'Named ownership and cadenced review creates accountability that routine operations may not sustain.',
    'Named ownership and regular review creates accountability that routine operations may not sustain.')

rep("B1 P2 Why — management cadence → rhythm",
    'Establishes the recurring management cadence needed for sustained improvement and management visibility.',
    'Establishes a recurring management rhythm needed for sustained improvement and management visibility.')

rep("B1 exec — KPI ownership and cadence",
    '"Launch Exception Reduction Program with repair KPI ownership and cadence"',
    '"Launch Exception Reduction Program with repair KPI ownership and regular review"')

rep("B1 exec — authority tiers and cadence",
    '"Establish Pricing Council with documented authority tiers and cadence"',
    '"Establish Pricing Council with documented authority tiers and regular review"')

rep("B1 exec — visible to leadership",
    '"Publish portfolio scorecard and make franchise KPIs visible to leadership"',
    '"Publish portfolio scorecard and make franchise KPIs visible across management teams"')

rep("B1 strategic_takeaway — scaling → expanding",
    'before scaling commercial activity.',
    'before expanding commercial activity.')

# ═══════════════════════════════════════════════════════
# BAND 2 — DEVELOPING FRANCHISE
# ═══════════════════════════════════════════════════════

rep("B2 pillar.governance — Management cadence",
    'governance: "Management cadence appears irregular. Pricing authority and KPI review lack consistent enforcement."',
    'governance: "Management routines appear irregular. Pricing authority and KPI review lack consistent enforcement."')

rep("B2 structural_issue 2 — review cadence appears reactive",
    '"Portfolio review cadence appears reactive, limiting management visibility into recurring performance patterns."',
    '"Portfolio review appears reactive, limiting management visibility into recurring performance patterns."')

# ═══════════════════════════════════════════════════════
# BAND 3 — OPERATIONALLY STABLE
# ═══════════════════════════════════════════════════════

rep("B3 pillar.governance — Management cadence is regular",
    'governance: "Governance structures are established. Management cadence is regular, though pricing enforcement consistency may vary."',
    'governance: "Governance structures are established. Management routines are regular, though pricing enforcement consistency may vary."')

rep("B3 exec_diagnosis — relationship-level management discipline",
    'The next management challenge is converting stability into more consistent pricing discipline and management visibility, and relationship-level management discipline.',
    'The next management challenge is converting stability into more consistent pricing discipline, management visibility, and relationship-level coordination.')

# ═══════════════════════════════════════════════════════
# BAND 4 — STRATEGICALLY ALIGNED
# ═══════════════════════════════════════════════════════

rep("B4 pillar.governance — Management cadence",
    'governance: "Governance is mature. Management cadence, KPI discipline, and pricing authority are consistently enforced."',
    'governance: "Governance is mature. Management routines, KPI discipline, and pricing authority are consistently enforced."')

rep("B4 exec_diagnosis — remediation → stabilization",
    'The management focus shifts from remediation to durability:',
    'The management focus shifts from stabilization to durability:')

# ═══════════════════════════════════════════════════════
# BAND 5 — ENTERPRISE-GRADE
# ═══════════════════════════════════════════════════════

# Capital-O Organizational missed by global replacement
rep("B5 key_issue — Organizational complexity (capital O)",
    'Organizational complexity may create decision latency and coordination overhead',
    'Operating complexity may create decision latency and coordination overhead')

rep("B5 pillar.governance — Operating cadence",
    'governance: "Governance is highly developed. Operating cadence, KPI discipline, and pricing authority are consistently embedded."',
    'governance: "Governance is highly developed. Operating routines, KPI discipline, and pricing authority are consistently embedded."')

rep("B5 P1 KPI — leadership pipeline",
    'kpi: "Succession depth, knowledge retention, leadership pipeline"',
    'kpi: "Succession depth, knowledge retention, management pipeline"')

rep("B5 exec phase — Lead the Industry → Strengthen Market Position",
    '"Lead the Industry"',
    '"Strengthen Market Position"')

rep("B5 strategic_takeaway — future operating capability",
    'future operating capability',
    'emerging operating capability')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Final scenario patch results:")
for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
print("\nRun audit_pdf_text.py to verify, then push.")
