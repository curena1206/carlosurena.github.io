#!/usr/bin/env python3
"""
Complete fix pass:
  Part A — Remaining language fixes (PFI_SCENARIOS + question model)
  Part B — Maturity modifier wiring into computeSignals
  Part C — 3-tier priority selection
Run from carlosurena.github.io directory:
    python3 patch_fix_all.py
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

# ═══════════════════════════════════════════════════════════════════
# PART A — Language fixes (PFI_SCENARIOS + question model)
# Signal rule language already clean from patch_priority_tiers.py
# ═══════════════════════════════════════════════════════════════════

rep("A1. Scenario B4 — HR + Senior Leadership",
    '"HR + Senior Leadership"',
    '"HR + Senior Management"')

rep("A2. Scenario B5 — Senior Leadership + HR",
    '"Senior Leadership + HR"',
    '"Senior Management + HR"')

rep("A3. Scenario B5 — Senior Leadership + Compliance",
    '"Senior Leadership + Compliance"',
    '"Senior Management + Compliance"')

rep("A4. Band 4 exec — market entry plan",
    '"Deploy expanded flow strategy with market entry plan"',
    '"Implement expanded flow strategy with defined approach"')

rep("A5. MR4 question title — correspondent",
    '"Cross-border and correspondent flow management"',
    '"Cross-border and international payment flow management"')

rep("A6. MR4 description — correspondent flows",
    "Where cross-border or correspondent flows are in scope, how consistently are major flows managed across pricing, partner strategy, service model, and economic visibility? Select 'Not applicable' if these flows are not in scope.",
    "Where cross-border or international payment flows are in scope, how consistently are major flows managed across pricing, partner strategy, service model, and economic visibility? Select 'Not applicable' if these flows are not in scope.")

rep("A7. MR4 not applicable sub",
    '"Cross-border or correspondent flows are not part of this portfolio"',
    '"Cross-border or international payment flows are not part of this portfolio"')

rep("A8. MR1 — institution's → franchise's",
    "the institution's strategic client, product, and monetization priorities?",
    "the franchise's strategic client, product, and monetization priorities?")

rep("A9. Instruction note — corridor strategy",
    "MR4 (cross-border corridor strategy) includes a 'Not applicable' option if cross-border is outside your portfolio scope.",
    "MR4 (international payment flows) includes a 'Not applicable' option if cross-border flows are outside your portfolio scope.")

# ═══════════════════════════════════════════════════════════════════
# PART B — Wire maturity modifier into computeSignals
# Uses exact strings from diagnostic output
# ═══════════════════════════════════════════════════════════════════

# B1. Add overall parameter to signature
rep("B1. computeSignals — add overall param",
    'function computeSignals(answers, pillarScores) {',
    'function computeSignals(answers, pillarScores, overall) {')

# B2. Add maturity modifier to scoring formula
rep("B2. computeSignals — add maturity modifier",
    '      var scored = fired.map(function(rule){\n'
    '        return {score:(5-weakestScore)*rule.impact_weight*recMult(rule.category), rule:rule};\n'
    '      }).sort(function(a,b){return b.score-a.score;});',
    '      function maturityMod(s){return s<=25?1.30:s<=50?1.15:s<=70?1.00:s<=85?0.60:0.40;}\n'
    '      var scored = fired.map(function(rule){\n'
    '        return {score:(5-weakestScore)*rule.impact_weight*recMult(rule.category)*maturityMod(overall||0), rule:rule};\n'
    '      }).sort(function(a,b){return b.score-a.score;});')

# B3. Pass overall from computeAndShow
rep("B3. computeAndShow — pass overall to computeSignals",
    'const signals = computeSignals(state.answers, pillarScores);',
    'const signals = computeSignals(state.answers, pillarScores, overall);')

# ═══════════════════════════════════════════════════════════════════
# PART C — 3-tier priority selection
# Replaces original 1-tier with: >70=high, >50=mid, else=low
# ═══════════════════════════════════════════════════════════════════

rep("C1. Priority selection — 1-tier → 3-tier",
    '        if (r.priority && !seenPri[r.priority.title]) {\n'
    '          var p={}; for(var k in r.priority)p[k]=r.priority[k]; p._score=sr.score;\n'
    '          signals.recommended_priorities.push(p);\n'
    '          seenPri[r.priority.title]=true;\n'
    '        }',
    '        var activePri=overall>70&&r.priority_high?r.priority_high:overall>50&&r.priority_mid?r.priority_mid:r.priority_low||r.priority;\n'
    '        if (activePri && !seenPri[activePri.title]) {\n'
    '          var p={}; for(var k in activePri)p[k]=activePri[k]; p._score=sr.score;\n'
    '          signals.recommended_priorities.push(p);\n'
    '          seenPri[activePri.title]=true;\n'
    '        }')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Fix results:")
for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
print("\nIf all OK, push and test all 3 scenarios.")
