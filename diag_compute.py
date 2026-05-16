#!/usr/bin/env python3
import re
with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Show computeSignals function
start = html.find('function computeSignals(')
end   = html.find('\n    function renderObservations', start)
if start >= 0 and end >= 0:
    print("=== computeSignals ===")
    print(html[start:end])
else:
    print("computeSignals not found")
    # Try partial
    idx = html.find('computeSignals')
    if idx >= 0:
        print("Found at:", idx)
        print(repr(html[idx:idx+200]))
