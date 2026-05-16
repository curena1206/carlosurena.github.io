#!/usr/bin/env python3
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

rep("1. B2 organization → franchise",
    'may not yet be operating consistently across the organization.',
    'may not yet be operating consistently across the franchise.')

rep("2. B3 platform → foundation",
    'Operational stability creates the platform for sharper portfolio management.',
    'Operational stability creates the foundation for sharper portfolio management.')

rep("3. B3 dynamic optimization",
    'dynamic optimization remains an opportunity.',
    'dynamic routing refinement remains an opportunity.')

rep("4. B4 optimization → improvement",
    'rather than optimization of existing programs alone.',
    'rather than improvement of existing programs alone.')

rep("5. B5 leadership transitions",
    'supports performance continuity across leadership transitions.',
    'supports performance continuity across management transitions.')

rep("6a. B5 title — Ecosystem Integration",
    '"Deepen Client Ecosystem Integration"',
    '"Deepen Client Workflow Integration"')

rep("6b. B5 exec item — ecosystem integration",
    '"Deepen client ecosystem integration across priority relationships"',
    '"Deepen workflow integration across priority relationships"')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
