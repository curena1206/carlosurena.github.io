#!/usr/bin/env python3
with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

old = 'title: "Deploy pre-validation targeting top payment failure modes by rail"'
new = 'title: "Implement pre-validation targeting top payment failure modes by rail"'

if old in html:
    html = html.replace(old, new)
    print("  OK  [R7 Deploy → Implement]")
else:
    print("  MISS [R7 Deploy → Implement]")

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)
