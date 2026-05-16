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

rep("1. Grammar — creates → create",
    'Named ownership and regular review creates accountability',
    'Named ownership and regular review create accountability')

rep("2. B3 key_issue — fragment fix",
    'Workflow integration growing but durable client integration not yet established at scale',
    'Workflow integration is growing, but durable client integration may not yet be established at scale.')

rep("3. B3 exec_diagnosis — relationship economics",
    'management visibility, and relationship-level coordination.',
    'management visibility, and relationship economics.')

rep("4. Footer note — overpromise fix",
    'producing a Flow-Level Portfolio Map, Management Scorecard, and Operating Cost Structure.',
    'which may support deeper portfolio analysis through flow-level portfolio mapping, management scorecards, and operating cost analysis.')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
