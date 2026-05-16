#!/usr/bin/env python3
import re
with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

for term in ['Trading/FX', 'Network Management', 'balance linkage rate']:
    for m in re.finditer(re.escape(term), html):
        pos = m.start()
        print(f"\n=== '{term}' at {pos} ===")
        print(repr(html[max(0,pos-60):pos+120]))
