#!/usr/bin/env python3
with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

OLD = ('var noteText="This assessment can serve as the starting point for a deeper portfolio review '
       'using your actual transaction data, pricing records, and operating data \u2014 which may support '
       'deeper portfolio analysis through flow-level portfolio mapping, management scorecards, and operating '
       'cost analysis.";setFont("normal",7.5,GDARK);var noteLines=doc.splitTextToSize(noteText,CW-8);'
       'var noteH=noteLines.length*3.5+10;fillRect(ML,y,CW,noteH,[244,246,248],2);'
       'fillRect(ML,y,2.5,noteH,GOLD);setFont("normal",7.5,GDARK);'
       'doc.text(noteLines,ML+5,y+6);y+=noteH+5;')

NEW = ('var _apaths=(signals.advisory_paths||[]).slice(0,4);\n'
       '      if(_apaths.length>0){\n'
       '        y=sectionHead("AREAS WHERE DEEPER REVIEW MAY BE WARRANTED",y);\n'
       '        _apaths.forEach(function(ap){\n'
       '          var apTxt=ap.label+" \u2014 "+ap.description;\n'
       '          var apL=doc.splitTextToSize(apTxt,CW-5);\n'
       '          doc.setFillColor.apply(doc,GOLD);doc.circle(ML+1.5,y+3-2.0,1.2,"F");\n'
       '          setFont("normal",7.5,GDARK);doc.text(apL,ML+4.5,y+3);\n'
       '          y+=apL.length*3.4+2;\n'
       '        });\n'
       '        y+=4;\n'
       '      }else{\n'
       '        var noteText="This assessment can serve as the starting point for a deeper portfolio review '
       'using your actual transaction data, pricing records, and operating data \u2014 which may support '
       'deeper portfolio analysis through flow-level portfolio mapping, management scorecards, and operating '
       'cost analysis.";\n'
       '        setFont("normal",7.5,GDARK);var noteLines=doc.splitTextToSize(noteText,CW-8);\n'
       '        var noteH=noteLines.length*3.5+10;fillRect(ML,y,CW,noteH,[244,246,248],2);\n'
       '        fillRect(ML,y,2.5,noteH,GOLD);setFont("normal",7.5,GDARK);\n'
       '        doc.text(noteLines,ML+5,y+6);y+=noteH+5;\n'
       '      }')

if OLD in html:
    html = html.replace(OLD, NEW, 1)
    print("  OK  [I1. advisory bridge fix]")
else:
    print("  MISS — string still not matching. Check repr output:")
    idx = html.find('var noteText=')
    if idx >= 0:
        print(repr(html[idx:idx+300]))

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)
