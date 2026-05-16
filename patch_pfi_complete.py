#!/usr/bin/env python3
"""
Complete pfi.html patch pass — all in one.
Run from carlosurena.github.io directory:
    python3 patch_pfi_complete.py
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

# ═══════════════════════════════════════════════════════════
# PART 1 — PAGE COPY CHANGES (9 changes)
# ═══════════════════════════════════════════════════════════

rep("1. Hero para — organizational capability",
    'It is visibility into where management discipline, organizational capability, and portfolio alignment may not be evolving consistently.',
    'It is visibility into where management discipline, operating capability, and portfolio alignment may not be evolving evenly across the franchise.')

rep("2. Hero para — framework/leadership/materially",
    'The framework highlights where leadership attention, validation, or strategic review may be required before structural pressure becomes materially embedded across the portfolio.',
    'The assessment helps identify where management attention, validation, or strategic review may be warranted before structural pressure becomes embedded across the franchise.')

rep("3. How it works step 2 — leadership visibility",
    'Identify where management capability, leadership visibility, and portfolio discipline may be evolving unevenly',
    'Identify where management visibility, operating discipline, and portfolio alignment may be evolving unevenly')

rep("4. What you'll get — executive operating interpretation",
    'Executive operating interpretation with maturity classification',
    'Executive assessment with maturity interpretation')

rep("5. Results intro",
    'It is management visibility into where operating maturity, governance discipline, and portfolio alignment may require attention first.',
    'The assessment helps establish visibility into where operating maturity, governance discipline, and portfolio alignment may warrant attention.')

rep("6. CTA card — stacked abstractions",
    'Payment franchises rarely evolve evenly across pricing discipline, governance maturity, organizational scalability, treasury integration, and growth capability.',
    'Payment franchises rarely evolve evenly across pricing, governance, operating discipline, treasury integration, and growth capability.')

rep("7. CTA body — consulting language",
    'The next step is validating where execution friction, management fragmentation, or portfolio misalignment may warrant deeper executive review.',
    'The next step is validating where operating friction, management visibility gaps, or portfolio misalignment may warrant deeper review.')

rep("8. CTA button",
    '>Review the operating framework<',
    '>Explore the diagnostic<')

rep("9. Footer",
    'Built from real operating conditions inside payments franchises',
    'Informed by operating experience across global payments franchises')

# ═══════════════════════════════════════════════════════════
# PART 2 — PDF EXPORT FUNCTION (hardcoded text)
# ═══════════════════════════════════════════════════════════

# Scale labels — align with PFI_SCENARIOS maturity bands
rep("PDF scale — Structural Failure → Foundational Gaps",
    'label:"Structural Failure"',
    'label:"Foundational Gaps"')

rep("PDF scale — Fragile Franchise → Developing Franchise",
    'label:"Fragile Franchise"',
    'label:"Developing Franchise"')

rep("PDF scale — Best-in-Class → Enterprise-Grade",
    'label:"Best-in-Class"',
    'label:"Enterprise-Grade"')

# Bottom note — replace old output names
rep("PDF bottom note",
    'var noteText="Payments Franchise Index (PFI) Diagnostic Engagement \u2014 This model expands into a structured review using your actual transaction data, pricing records, and corridor economics \u2014 producing a Corridor Profitability Map, Portfolio Scorecard, and Infrastructure Cost Stack.";',
    'var noteText="This assessment can serve as the starting point for a deeper portfolio review using your actual transaction data, pricing records, and operating data \u2014 producing a Flow-Level Portfolio Map, Management Scorecard, and Operating Cost Structure.";')

# ═══════════════════════════════════════════════════════════
# PART 3 — PFI_SCENARIOS AUDIT (all 5 bands)
# ═══════════════════════════════════════════════════════════

# ── Cross-band fixes ────────────────────────────────────────

# "Pillar KPIs" in priority KPIs (appears in bands 1 and 2)
rep("SCENARIOS — Pillar KPIs (band 1)",
    '"kpi": "Pillar KPIs trending, actions opened and closed per cycle"',
    '"kpi": "Portfolio KPIs trending, actions opened and closed per cycle"')

rep("SCENARIOS — Pillar KPIs (band 2, same text)",
    'kpi: "Pillar KPIs trending, actions opened and closed per cycle"',
    'kpi: "Portfolio KPIs trending, actions opened and closed per cycle"')

# "roadmap prioritization" in band 1 priority 5
rep("SCENARIOS — roadmap prioritization",
    'why: "Provides the cost anchor needed for pricing governance and roadmap prioritization."',
    'why: "Provides the cost anchor needed for pricing governance and investment prioritization."')

# ── BAND 1: FOUNDATIONAL GAPS ───────────────────────────────

# key_issues — "discounting without structured oversight" → more natural
rep("Band 1 — key_issue pricing governance",
    '"Pricing governance appears fragmented \u2014 discounting without structured oversight"',
    '"Pricing governance appears fragmented \u2014 override behavior without consistent review"')

# key_issues — "metrics undefined or inconsistently reviewed" — fine, leave
# immediate_focus — "rather than strengthening the franchise" — fine
# strategic_takeaway — good, leave

# priority 3 WHY — "creates an auditable pricing record" — keep
# priority 2 WHY — "Pillar KPIs" — already fixed above

# ── BAND 2: DEVELOPING FRANCHISE ────────────────────────────

# key_issues — "no structured review cadence in place" — keep (accurate)
# strategic_takeaway — "connect economics more consistently" — keep

# priority 1 WHY — "reduces cumulative inconsistency" — keep
# priority 2 KPI — "Pillar KPIs" — already fixed above

# execution — "Launch flow-level pricing and cost visibility framework" — fine

# ── BAND 3: OPERATIONALLY STABLE ────────────────────────────

# exec_diagnosis — "relationship-level management discipline" — good
# strategic_takeaway — "consistent monetization" — acceptable in context

# priority 5 — "Formalize Growth Playbook" — "A repeatable expansion playbook" — fine
rep("Band 3 — playbook language",
    'why: "A repeatable expansion playbook reduces execution risk and improves commercial predictability."',
    'why: "A defined expansion approach reduces execution risk and improves commercial predictability."')

# ── BAND 4: STRATEGICALLY ALIGNED ───────────────────────────

# exec_diagnosis — "from remediation to durability" — keep (strong)
# strategic_takeaway — good

# ── BAND 5: ENTERPRISE-GRADE ────────────────────────────────

# exec_diagnosis — good, no changes needed
# strategic_takeaway — good

# ── Recommendations library — quick pass ────────────────────

# R2 metric — "margin leakage by deal" — in recommendations, not shown in PDF
# R5 metric — "spread leakage by corridor" — in recommendations
# R10 why — "Directs leakage reduction effort" — in recommendations
# These are internal scoring logic, not rendered in PDF output — leave

# ── Rules engine — quick pass ────────────────────────────────
# Rule diagnoses are shown on the web page but NOT in the PDF export
# The PDF uses PFI_SCENARIOS structural_issues, not rules engine diagnoses
# Rules are fine as-is

# ═══════════════════════════════════════════════════════════
# FINAL SEMANTIC PASS — search flagged terms
# ═══════════════════════════════════════════════════════════

import re

flagged = ['framework', 'leadership', 'organizational', 'materially', 'consistently', 'fragmentation']
print("Final semantic check (visible text only):\n")
for phrase in flagged:
    # Find in HTML but exclude CSS and JS logic sections
    matches = [(m.start(), html[max(0,m.start()-50):m.end()+60]) for m in re.finditer(r'\b' + re.escape(phrase) + r'\b', html, re.IGNORECASE)]
    if matches:
        # Filter to likely visible content (crude but effective)
        visible = [(pos, ctx) for pos, ctx in matches
                   if not any(tag in html[max(0,pos-500):pos] and html[max(0,pos-500):pos].count(tag) > html[max(0,pos-500):pos].count(close)
                              for tag, close in [('<style','</style')])]
        if visible:
            print(f"  '{phrase}' ({len(visible)}x):")
            for _, ctx in visible[:2]:
                print(f"    ...{ctx.strip()[:80]}...")

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("\nPatch results:")
for l in log:
    print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
print("\nDone. Push when ready.")
