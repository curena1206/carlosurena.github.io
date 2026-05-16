#!/usr/bin/env python3
"""
Apply Carlos's exact band 1 (FOUNDATIONAL GAPS) replacements.
Run from carlosurena.github.io directory:
    python3 patch_band1.py
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

# ── benchmark_insight ─────────────────────────────────────────────────────────
rep("benchmark_insight",
    'benchmark_insight: "The franchise shows signs of fragmentation across governance, pricing discipline, and management visibility. Stabilization efforts typically focus on operating structure before commercial initiatives gain traction."',
    'benchmark_insight: "The franchise shows uneven maturity across governance, pricing discipline, and management visibility. Early efforts often focus on strengthening operating discipline before broader commercial initiatives gain traction."')

# ── pillar_commentary ─────────────────────────────────────────────────────────
rep("pillar revenue_arch",
    'revenue_arch: "Pricing discipline and management visibility appear largely absent across major payment flows."',
    'revenue_arch: "Pricing discipline and management visibility appear limited across major payment flows."')

rep("pillar margin_cost",
    'margin_cost: "Operational costs appear elevated and management visibility appears limited across major payment structures."',
    'margin_cost: "Operational costs may be elevated while management visibility across major payment structures appears limited."')

rep("pillar multi_rail",
    'multi_rail: "Rail strategy appears underdeveloped. Routing is static and data quality may be contributing to exception pressure."',
    'multi_rail: "Rail strategy appears underdeveloped. Routing remains relatively static and data quality may be contributing to exception pressure."')

rep("pillar balance_liquidity",
    'balance_liquidity: "Treasury integration appears absent. Balance contribution and rate-cycle sensitivity appear unquantified."',
    'balance_liquidity: "Treasury integration appears limited. Balance contribution and rate-cycle sensitivity may not yet be consistently visible."')

rep("pillar governance",
    'governance: "Governance discipline appears fragmented across pricing, management cadence, and portfolio oversight."',
    'governance: "Governance discipline appears uneven across pricing, management routines, and portfolio oversight."')

# ── exec_diagnosis ────────────────────────────────────────────────────────────
rep("exec_diagnosis",
    'exec_diagnosis: "The portfolio appears unevenly developed across governance, pricing discipline, management visibility, and portfolio management. The immediate management priority is stabilization: establish ownership, reporting discipline, and pricing controls before pursuing broader commercial expansion."',
    'exec_diagnosis: "The portfolio appears unevenly developed across governance, pricing discipline, management visibility, and portfolio management. Initial priorities may include strengthening ownership, reporting discipline, and pricing controls before pursuing broader commercial expansion."')

# ── structural_issues ─────────────────────────────────────────────────────────
rep("structural_issue 1",
    '"Exception and repair activity appears elevated enough to warrant direct management attention and named ownership."',
    '"Exception and repair activity may warrant additional management visibility and named ownership."')

rep("structural_issue 2",
    '"Portfolio management cadence appears underdeveloped, limiting management\'s ability to identify and act on recurring performance patterns."',
    '"Portfolio management routines may benefit from greater structure and recurring review."')

rep("structural_issue 3",
    '"Pricing governance appears inconsistently applied, which may allow inconsistent deal-level decisions to accumulate across the portfolio."',
    '"Pricing governance appears inconsistently applied, which may allow deal-level decisions to accumulate unevenly across the franchise."')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
