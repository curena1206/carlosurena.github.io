#!/usr/bin/env python3
import re
with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'var noteText=.{0,300}y\+=noteH\+5;', html, re.DOTALL)
if m:
    print(repr(m.group()))
else:
    print("noteText block not found")
    # try partial
    m2 = re.search(r'var noteText=.{0,200}', html)
    if m2: print("Partial:", repr(m2.group()))
