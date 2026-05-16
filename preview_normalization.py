#!/usr/bin/env python3
"""
Preview all proposed language normalization changes.
Does NOT modify pfi.html.
Run from carlosurena.github.io directory:
    python3 preview_normalization.py
"""

import re

with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract PFI_SCENARIOS block only
start = html.find('const PFI_SCENARIOS = [')
end   = html.find('\n    function pfiGetScenario', start)
block = html[start:end]

# ── Proposed replacements ─────────────────────────────────────────────────────
# Each tuple: (label, old_pattern, new_text, is_regex)
RULES = [
    # cadence
    ("cadence → recurring review",
     r'\bcadence\b', 'recurring review', True),

    # leadership (standalone, not part of 'Senior Leadership' title)
    ("leadership → management (standalone)",
     r'\bleadership\b(?! pipeline)', 'management', True),

    # organizational complexity
    ("organizational complexity → operating complexity",
     'organizational complexity', 'operating complexity', False),

    # future capability/capabilities
    ("future capabilit* → emerging capabilit*",
     r'future capabilit', 'emerging capabilit', True),

    # future-state
    ("future-state → next-stage",
     'future-state', 'next-stage', False),

    # deploy → implement
    ("deploy → implement",
     r'\bDeploy\b', 'Implement', True),
    ("deploy → implement (lower)",
     r'\bdeploy\b', 'implement', True),

    # institutionalize → establish
    ("Institutionalize → Establish",
     r'\bInstitutionalize\b', 'Establish', True),
    ("institutionalize → establish (lower)",
     r'\binstitutionalize\b', 'establish', True),

    # optimization → improvement
    ("optimization → improvement",
     r'\boptimization\b', 'improvement', True),
    ("Optimization → Improvement",
     r'\bOptimization\b', 'Improvement', True),

    # ecosystem integration → workflow and client integration
    ("Ecosystem Integration → Workflow and Client Integration",
     'Ecosystem Integration', 'Workflow and Client Integration', False),
    ("ecosystem integration → workflow and client integration",
     'ecosystem integration', 'workflow and client integration', False),

    # platform → operating foundation (business maturity only)
    ("platform appears → operating foundation appears",
     'platform appears', 'operating foundation appears', False),
    ("The platform → The operating foundation",
     'The platform', 'The operating foundation', False),

    # lead industry → strengthen market position
    ("Lead the Industry → Strengthen Market Position",
     'Lead the Industry', 'Strengthen Market Position', False),
    ("Lead Industry Standards → Advance Industry Standards",
     'Lead Industry Standards in Payments Governance',
     'Advance Industry Standards in Payments Governance', False),

    # organizational dependency → concentration risk
    ("organizational dependency → concentration risk",
     'organizational dependency', 'concentration risk', False),

    # commercial expansion → portfolio expansion
    ("commercial expansion → portfolio expansion",
     'commercial expansion', 'portfolio expansion', False),

    # The priority is → Near-term priorities may include
    ("'The priority is to' → 'Near-term priorities may include'",
     'The priority is to', 'Near-term priorities may include', False),

    # fragmented → uneven
    ("fragmented → uneven",
     r'\bfragmented\b', 'uneven', True),

    # underdeveloped → developing
    ("underdeveloped → developing",
     r'\bunderdeveloped\b', 'developing', True),

    # absent → limited (where used as an absolute)
    ("absent → limited",
     r'\babsent\b', 'limited', True),

    # unquantified → not consistently visible
    ("unquantified → not consistently visible",
     r'\bunquantified\b', 'not consistently visible', True),

    # Organizational scale → Scale
    ("Organizational scale → Scale",
     'Organizational scale', 'Scale', False),

    # organizational change → management change
    ("organizational change → management change",
     'organizational change', 'management change', False),
]

print("=" * 70)
print("PROPOSED LANGUAGE NORMALIZATION — PREVIEW ONLY")
print("No changes will be made to pfi.html")
print("=" * 70)
print()

total_instances = 0

for label, pattern, replacement, is_regex in RULES:
    if is_regex:
        matches = [(m.start(), m.group()) for m in re.finditer(pattern, block)]
    else:
        matches = [(i, pattern) for i in range(len(block))
                   if block[i:i+len(pattern)] == pattern]

    if not matches:
        continue

    print(f"── {label} ({len(matches)} instance{'s' if len(matches)>1 else ''})")
    total_instances += len(matches)

    for pos, matched in matches[:6]:  # show up to 6 examples
        # Get context: line containing the match
        line_start = block.rfind('\n', 0, pos) + 1
        line_end   = block.find('\n', pos)
        if line_end == -1: line_end = len(block)
        line = block[line_start:line_end].strip()

        # Truncate long lines
        if len(line) > 100:
            # Find match position in line
            mp = line.find(matched[:20])
            if mp > 40:
                line = '...' + line[mp-20:]
            if len(line) > 100:
                line = line[:100] + '...'

        if is_regex:
            new_line = re.sub(pattern, replacement, line)
        else:
            new_line = line.replace(pattern, replacement)

        print(f"  BEFORE: {line}")
        print(f"  AFTER:  {new_line}")
        print()

    if len(matches) > 6:
        print(f"  ... and {len(matches)-6} more instances")
        print()

print("=" * 70)
print(f"TOTAL INSTANCES FOUND: {total_instances}")
print("=" * 70)
print()
print("Review above. If approved, run patch_scenarios_final.py to apply.")
