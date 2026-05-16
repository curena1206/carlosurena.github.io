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

rep("B4 phase — Build Future Capability",
    '"Build Future Capability"',
    '"Build Emerging Capability"')

rep("B5 P3 title — Lead Industry Standards",
    '"Lead Industry Standards in Payments Governance"',
    '"Advance Industry Standards in Payments Governance"')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

for l in log: print(l)
