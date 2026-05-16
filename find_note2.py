#!/usr/bin/env python3
import re
with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('var noteText=')
if idx >= 0:
    print(repr(html[idx:idx+500]))
else:
    print("not found")
