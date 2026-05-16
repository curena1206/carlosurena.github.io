#!/usr/bin/env python3
"""
Step 2: Dynamic personalization.
Adds signal engine, dynamic observations, merged priorities, advisory bridge.
Run from carlosurena.github.io directory:
    python3 patch_dynamic_step2.py
"""

with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

log = []

def rep(label, old, new):
    global html
    if old in html:
        html = html.replace(old, new, 1)
        log.append(f"  OK  [{label}]")
    else:
        log.append(f"  MISS [{label}]")

# ═══════════════════════════════════════════════════════════════════
# A. CSS
# ═══════════════════════════════════════════════════════════════════

rep("A1. CSS — observations + advisory",
    '    .pfi-footer-right a:hover { color: #d4a84b; }',
    '    .pfi-footer-right a:hover { color: #d4a84b; }\n'
    '    .obs-intro { font-family: Georgia, serif; font-size: 14px; color: var(--slate); margin-bottom: 12px; line-height: 1.65; }\n'
    '    .obs-bullets { list-style: none; display: grid; gap: 9px; }\n'
    '    .obs-bullets li { font-family: Georgia, serif; font-size: 14px; color: var(--navy); padding-left: 16px; position: relative; line-height: 1.65; }\n'
    '    .obs-bullets li::before { content: "\u2014"; position: absolute; left: 0; color: var(--gold); }\n'
    '    .advisory-paths { list-style: none; display: grid; gap: 10px; margin-top: 8px; }\n'
    '    .advisory-paths li { font-family: Georgia, serif; font-size: 14px; color: var(--navy); padding-left: 16px; position: relative; line-height: 1.65; }\n'
    '    .advisory-paths li::before { content: "\u2014"; position: absolute; left: 0; color: var(--gold); }\n'
    '    .advisory-paths .ap-label { font-weight: bold; }'
)

# ═══════════════════════════════════════════════════════════════════
# B. HTML — new result cards
# ═══════════════════════════════════════════════════════════════════

rep("B1. HTML — observations card (before priorities)",
    '          <div class="card">\n'
    '            <div class="card-eyebrow">90-day priorities</div>\n'
    '            <div id="prioritiesList" class="priorities-list"></div>\n'
    '          </div>',
    '          <div class="card card-full" id="observationsCard" style="display:none;">\n'
    '            <div class="card-eyebrow">Management observations</div>\n'
    '            <div id="observationsList"></div>\n'
    '          </div>\n\n'
    '          <div class="card">\n'
    '            <div class="card-eyebrow">90-day priorities</div>\n'
    '            <div id="prioritiesList" class="priorities-list"></div>\n'
    '          </div>'
)

rep("B2. HTML — advisory bridge card (before CTA)",
    '          <!-- Go deeper CTA -->',
    '          <!-- Dynamic advisory bridge -->\n'
    '          <div class="card card-full" id="advisoryCard" style="border-top:3px solid var(--gold-line);display:none;">\n'
    '            <div class="card-eyebrow">Areas where deeper review may be warranted</div>\n'
    '            <div id="advisoryBridgeContent"></div>\n'
    '          </div>\n\n'
    '          <!-- Go deeper CTA -->'
)

# ═══════════════════════════════════════════════════════════════════
# C. JavaScript — signal engine + render functions (before exportPDF)
# ═══════════════════════════════════════════════════════════════════

SIGNAL_JS = r"""
    // ── SIGNAL ENGINE ─────────────────────────────────────────────────────────
    var SIGNAL_RULES = [
      // PRICING
      {id:"pricing_governance_weak",category:"pricing",
       condition:function(a){return (a.MC6||0)<=2&&(a.GO4||0)<=2;},
       pattern_flag:"Pricing override discipline and governance appear limited across the portfolio.",
       priority:{title:"Establish Pricing Council with Override Controls",owner:"Exec Sponsor + Pricing Lead",kpi:"Override rate, approval cycle time, margin integrity trend",why:"Pricing governance is often the fastest lever for reducing cumulative margin inconsistency."},
       advisory_path:{label:"Pricing visibility review",description:"Flow-level pricing analysis and override governance design."},
       impact_weight:0.30},
      {id:"rail_economics_absent",category:"pricing",
       condition:function(a){return (a.RA3||0)<=2&&(a.MC4||0)<=2;},
       pattern_flag:"Rail-level economics may not be consistently informing pricing or investment decisions.",
       priority:{title:"Build Rail-Level Pricing and Cost Visibility",owner:"Finance + Product",kpi:"Unit cost by rail, pricing realization rate, contribution by flow",why:"Without rail-level cost anchoring, pricing governance and routing decisions may lack economic grounding."},
       advisory_path:{label:"Flow-level cost structure",description:"Rail and corridor-level cost attribution and pricing floor analysis."},
       impact_weight:0.25},
      {id:"fx_monetization_gap",category:"pricing",
       condition:function(a){return a.MR4!=null&&(a.MR4||0)<=3&&(a.RA6||0)>=2&&(a.RA6||0)<=3;},
       pattern_flag:"FX-related revenue may not be consistently captured across cross-border payment flows.",
       priority:{title:"Develop FX Pricing and Spread Management Discipline",owner:"Product + Trading/FX + Sales",kpi:"FX capture rate, spread variance by corridor, corridor-level contribution",why:"Cross-border flows are among the more recoverable margin opportunities in commercial payments."},
       advisory_path:{label:"Flow economics review",description:"Cross-border corridor economics and FX spread management analysis."},
       impact_weight:0.20},
      // EXCEPTION MANAGEMENT
      {id:"exception_crisis",category:"exceptions",
       condition:function(a){return (a.MC2||0)<=1&&(a.MC3||0)<=1;},
       pattern_flag:"Exception and repair volume appears elevated with limited cost visibility or named ownership.",
       priority:{title:"Launch Exception Reduction Program with Named Ownership",owner:"Ops + Product + Tech",kpi:"Repair rate, STP %, cost per repair, trend vs. target",why:"Exception volume is often among the more visible sources of margin pressure in commercial payments."},
       advisory_path:{label:"Exception reduction program design",description:"Root cause analysis and STP improvement program across major payment flows."},
       impact_weight:0.30},
      {id:"exception_elevated",category:"exceptions",
       condition:function(a){return (a.MC2||0)>1&&(a.MC2||0)<=3&&(a.MC3||0)>=2;},
       pattern_flag:"Exception volume may be creating operational pressure that warrants structured review.",
       priority:{title:"Build Exception Tracking and Repair Cost Ownership Model",owner:"Ops + Product",kpi:"STP % by rail, repair rate trend, cost per exception",why:"Tracking repair costs consistently creates the visibility needed to prioritize reduction effort."},
       advisory_path:null,
       impact_weight:0.20},
      // TREASURY INTEGRATION
      {id:"treasury_not_integrated",category:"treasury",
       condition:function(a){return (a.BL1||0)<=2&&(a.BL2||0)<=2;},
       pattern_flag:"Treasury and balance contribution may not be consistently reflected in relationship pricing or portfolio economics.",
       priority:{title:"Integrate Treasury Contribution into Relationship and Portfolio Economics",owner:"Finance + Relationship Management",kpi:"Treasury contribution per deal, balance linkage rate, balance-adjusted return",why:"Payments relationships that do not reflect balance value may be systematically underpriced."},
       advisory_path:{label:"Treasury contribution analysis",description:"Balance-adjusted relationship economics and pricing model review."},
       impact_weight:0.25},
      {id:"rate_sensitivity_unmanaged",category:"treasury",
       condition:function(a){return (a.BL5||0)<=2&&(a.BL1||0)>=3;},
       pattern_flag:"Balance contribution appears tracked but rate-cycle sensitivity may not be consistently evaluated.",
       priority:{title:"Build Rate Sensitivity Model Across Operating Balance Relationships",owner:"Finance + Treasury",kpi:"Rate sensitivity by segment, balance-adjusted return vs. prior cycle",why:"Franchises with strong balance contribution may face portfolio economics shifts as rate conditions evolve."},
       advisory_path:{label:"Treasury contribution analysis",description:"Rate cycle sensitivity and balance-adjusted portfolio economics review."},
       impact_weight:0.20},
      {id:"treasury_coordination_absent",category:"treasury",
       condition:function(a){return (a.BL3||0)<=2;},
       pattern_flag:"Treasury and payments coordination may be operating with limited structural integration.",
       priority:{title:"Establish Treasury-Payments Coordination for Priority Relationships",owner:"Treasury + Relationship Management",kpi:"Treasury engagement rate, joint review cadence, balance-linked deal count",why:"Coordination gaps between treasury and payments often reduce total relationship value visibility."},
       advisory_path:null,
       impact_weight:0.15},
      // RAIL MATURITY
      {id:"rtp_capability_gap",category:"rail",
       condition:function(a){return (a.MR1||0)<=2;},
       pattern_flag:"Real-time payment capability may not yet be aligned with commercial use cases or client expectations.",
       priority:{title:"Develop Real-Time Payment Strategy and Use Case Roadmap",owner:"Product + Tech + Sales",kpi:"RTP send volume, use-case adoption rate, commercial contribution",why:"Real-time capability gaps may become more visible as client expectations evolve and competitors scale."},
       advisory_path:{label:"Rail routing and cost optimization",description:"Real-time rail strategy and commercial use case development."},
       impact_weight:0.25},
      {id:"routing_and_data_weak",category:"rail",
       condition:function(a){return (a.MR3||0)<=2&&(a.MR5||0)<=2;},
       pattern_flag:"Routing discipline and data quality patterns may be contributing to operating inefficiency.",
       priority:{title:"Implement Economics-Aware Routing with Data Quality Program",owner:"Product + Tech + Ops",kpi:"Routing distribution by rail, STP rate, data quality KPIs",why:"Static routing and data quality gaps often compound exception volume and cost structure."},
       advisory_path:{label:"Rail routing and cost optimization",description:"Rail economics, routing strategy, and data quality improvement program."},
       impact_weight:0.20},
      {id:"cross_border_unmanaged",category:"rail",
       condition:function(a){return a.MR4!=null&&(a.MR4||0)<=2;},
       pattern_flag:"Cross-border and correspondent flows may not be consistently managed for economics and service quality.",
       priority:{title:"Establish Cross-Border Flow Management with Economic Visibility",owner:"Network Management + Product",kpi:"Corridor economics, partner cost trends, service performance by flow",why:"Unmanaged cross-border flows may carry elevated costs and inconsistent pricing across corridors."},
       advisory_path:{label:"Flow economics review",description:"Corridor-level economic visibility and correspondent partner review."},
       impact_weight:0.20},
      // WORKFLOW INTEGRATION
      {id:"workflow_and_attach_limited",category:"workflow",
       condition:function(a){return (a.GE3||0)<=2&&(a.GE2||0)<=2;},
       pattern_flag:"Client workflow integration and product attach depth appear limited, which may affect relationship durability.",
       priority:{title:"Build Workflow Integration Program for Priority Client Relationships",owner:"Relationship Management + Product",kpi:"Workflow integration rate, product depth per client, relationship durability",why:"Limited workflow integration may increase relationship sensitivity to pricing or service competition."},
       advisory_path:null,
       impact_weight:0.20},
      {id:"onboarding_friction",category:"workflow",
       condition:function(a){return (a.GE4||0)<=2;},
       pattern_flag:"Onboarding and activation discipline may be creating friction that affects revenue realization timing.",
       priority:{title:"Standardize Onboarding and Activation Across Major Segments",owner:"Ops + Product + Sales",kpi:"Time-to-activate, onboarding completion rate, revenue realization lag",why:"Onboarding friction delays revenue and may create early relationship risk."},
       advisory_path:null,
       impact_weight:0.15},
      // COST VISIBILITY
      {id:"unit_cost_absent",category:"cost",
       condition:function(a){return (a.MC4||0)<=1;},
       pattern_flag:"Unit cost visibility may be absent, which can limit pricing discipline and investment prioritization.",
       priority:{title:"Build Unit Cost Model by Rail and Segment",owner:"Finance + Product",kpi:"Unit cost by rail, segment price floors, contribution margin",why:"Cost anchoring is a prerequisite for consistent pricing governance and investment prioritization."},
       advisory_path:{label:"Flow-level cost structure",description:"Unit cost modeling and cost attribution across rails and segments."},
       impact_weight:0.30},
      {id:"cost_visibility_limited",category:"cost",
       condition:function(a){return (a.MC4||0)>1&&(a.MC4||0)<=2&&(a.MC5||0)<=2;},
       pattern_flag:"Cost management discipline appears limited across both internal processing and external provider costs.",
       priority:{title:"Develop Comprehensive Cost Visibility Across Rails and Providers",owner:"Finance + Network Management",kpi:"Unit cost trend, external provider cost per payment, routing cost impact",why:"Gaps in internal and external cost visibility may limit margin management options."},
       advisory_path:{label:"Flow-level cost structure",description:"End-to-end cost visibility model including correspondent and network costs."},
       impact_weight:0.20},
      // GOVERNANCE
      {id:"ownership_and_kpi_weak",category:"governance",
       condition:function(a){return (a.GO1||0)<=2&&(a.GO2||0)<=2;},
       pattern_flag:"Portfolio ownership and KPI review discipline appear limited, which may reduce management visibility into recurring patterns.",
       priority:{title:"Establish Portfolio Ownership Model with Recurring KPI Review",owner:"Senior Management + Portfolio Owner",kpi:"Ownership clarity, KPI review frequency, actions opened and closed per cycle",why:"Named ownership and recurring review create the accountability structure needed for sustained improvement."},
       advisory_path:{label:"Portfolio governance design",description:"Operating model design for portfolio ownership, KPI governance, and review cadence."},
       impact_weight:0.30},
      {id:"cross_functional_limited",category:"governance",
       condition:function(a){return (a.GO3||0)<=2;},
       pattern_flag:"Cross-functional coordination across product, finance, and operations may be operating inconsistently.",
       priority:{title:"Establish Cross-Functional Operating Review with Shared Portfolio Metrics",owner:"Portfolio Owner + Finance + Ops",kpi:"Review participation rate, actions closed per cycle, cross-functional alignment",why:"Portfolio decisions made without cross-functional input may reflect incomplete economics."},
       advisory_path:{label:"Portfolio governance design",description:"Cross-functional operating model and shared metrics framework."},
       impact_weight:0.20},
      {id:"portfolio_visibility_limited",category:"governance",
       condition:function(a){return (a.GO6||0)<=2&&(a.GO5||0)<=2;},
       pattern_flag:"Management visibility into portfolio economics appears limited across major rails and segments.",
       priority:{title:"Build Integrated Portfolio Visibility for Management Review",owner:"Finance + Product + Portfolio Owner",kpi:"Portfolio coverage, KPI accessibility, management review frequency",why:"Visibility gaps at the portfolio level may slow response to operating or pricing pressure."},
       advisory_path:{label:"Portfolio governance design",description:"Integrated portfolio reporting and management visibility design."},
       impact_weight:0.20}
    ];

    function computeSignals(answers, pillarScores) {
      var signals = {
        weakest_pillars:[], strongest_pillars:[],
        signal_flags:[], pattern_flags:[],
        recommended_priorities:[], advisory_paths:[]
      };
      var pillarIds = Object.keys(pillarScores);
      var sorted = pillarIds.map(function(id){return {id:id,score:pillarScores[id].score5};})
                            .sort(function(a,b){return a.score-b.score;});
      signals.weakest_pillars   = sorted.slice(0,3);
      signals.strongest_pillars = sorted.slice(-2);
      var fired = [], catCounts = {};
      for (var i=0; i<SIGNAL_RULES.length; i++) {
        var rule = SIGNAL_RULES[i];
        try {
          if (rule.condition(answers, pillarScores)) {
            fired.push(rule);
            catCounts[rule.category] = (catCounts[rule.category]||0)+1;
          }
        } catch(e) {}
      }
      function recMult(cat) {
        var c = catCounts[cat]||0;
        return c>=3?1.6:c>=2?1.3:1.0;
      }
      var allScores = pillarIds.map(function(id){return pillarScores[id].score5;});
      var weakestScore = Math.min.apply(null, allScores);
      var scored = fired.map(function(rule){
        return {score:(5-weakestScore)*rule.impact_weight*recMult(rule.category), rule:rule};
      }).sort(function(a,b){return b.score-a.score;});
      var seenFlags={}, seenPri={}, seenAdv={};
      for (var j=0; j<scored.length; j++) {
        var sr=scored[j], r=sr.rule;
        if (!seenFlags[r.pattern_flag]) {
          signals.pattern_flags.push(r.pattern_flag);
          seenFlags[r.pattern_flag]=true;
        }
        if (r.priority && !seenPri[r.priority.title]) {
          var p={}; for(var k in r.priority)p[k]=r.priority[k]; p._score=sr.score;
          signals.recommended_priorities.push(p);
          seenPri[r.priority.title]=true;
        }
        if (r.advisory_path && !seenAdv[r.advisory_path.label]) {
          signals.advisory_paths.push(r.advisory_path);
          seenAdv[r.advisory_path.label]=true;
        }
      }
      signals.pattern_flags           = signals.pattern_flags.slice(0,5);
      signals.recommended_priorities  = signals.recommended_priorities.slice(0,5);
      signals.advisory_paths          = signals.advisory_paths.slice(0,4);
      return signals;
    }

    function renderObservations(signals) {
      var card = document.getElementById("observationsCard");
      var el   = document.getElementById("observationsList");
      if (!el || !signals || !signals.pattern_flags || signals.pattern_flags.length === 0) {
        if (card) card.style.display = "none";
        return;
      }
      card.style.display = "";
      var h = '<p class="obs-intro">Scoring patterns suggest the following areas may warrant management attention:</p>';
      h += '<ul class="obs-bullets">';
      for (var i=0; i<signals.pattern_flags.length; i++) {
        h += '<li>' + signals.pattern_flags[i] + '</li>';
      }
      h += '</ul>';
      el.innerHTML = h;
    }

    function renderAdvisoryBridge(signals) {
      var card = document.getElementById("advisoryCard");
      var el   = document.getElementById("advisoryBridgeContent");
      if (!el || !signals || !signals.advisory_paths || signals.advisory_paths.length === 0) {
        if (card) card.style.display = "none";
        return;
      }
      card.style.display = "";
      var h = '<ul class="advisory-paths">';
      for (var i=0; i<signals.advisory_paths.length; i++) {
        var ap = signals.advisory_paths[i];
        h += '<li><span class="ap-label">' + ap.label + '</span> \u2014 ' + ap.description + '</li>';
      }
      h += '</ul>';
      el.innerHTML = h;
    }

"""

rep("C1. JS — signal engine + render functions",
    '    function exportPDF() {',
    SIGNAL_JS + '    function exportPDF() {')

# ═══════════════════════════════════════════════════════════════════
# D. Wire computeSignals into computeAndShow
# ═══════════════════════════════════════════════════════════════════

rep("D1. computeAndShow — add signal computation",
    '      const result = { pillarScores, overall, sub, rules: ruleOutput };',
    '      const signals = computeSignals(state.answers, pillarScores);\n'
    '      const result = { pillarScores, overall, sub, rules: ruleOutput, signals };')

# ═══════════════════════════════════════════════════════════════════
# E. renderResults — add observations + advisory + pass signals
# ═══════════════════════════════════════════════════════════════════

rep("E1. renderResults — wire observations, signals, advisory",
    '      renderHeatmap(result.pillarScores);\n'
    '      renderPillarNarratives(result.pillarScores, result.overall);\n'
    '      renderDiagnosis(result.overall);\n'
    '      renderPriorities(result.overall);\n'
    '      render3090(result.overall);',
    '      renderHeatmap(result.pillarScores);\n'
    '      renderPillarNarratives(result.pillarScores, result.overall);\n'
    '      renderDiagnosis(result.overall);\n'
    '      renderObservations(result.signals);\n'
    '      renderPriorities(result.overall, result.signals);\n'
    '      renderAdvisoryBridge(result.signals);\n'
    '      render3090(result.overall);')

# ═══════════════════════════════════════════════════════════════════
# F. Replace renderPriorities — add dynamic/static merge logic
# ═══════════════════════════════════════════════════════════════════

OLD_RENDER_PRI = (
    '    function renderPriorities(overall) {\n'
    '      if (!els.prioritiesList) return;\n'
    '      const sc = pfiGetScenario(overall);\n'
    '      els.prioritiesList.innerHTML = "";\n'
    '      sc.priorities.forEach((pri, idx) => {\n'
    '        const box = document.createElement("div");\n'
    '        box.className = "priority";\n'
    '        box.innerHTML = `<div class="priority-num">${idx + 1}</div><div class="priority-body"><div class="priority-title">${pri.title}</div><div class="priority-meta">Owner: ${pri.owner} \xb7 KPI: ${pri.kpi}</div><div class="priority-why">${pri.why}</div></div>`;\n'
    '        els.prioritiesList.appendChild(box);\n'
    '      });\n'
    '    }'
)

NEW_RENDER_PRI = (
    '    function renderPriorities(overall, signals) {\n'
    '      if (!els.prioritiesList) return;\n'
    '      const sc = pfiGetScenario(overall);\n'
    '      const dynP  = (signals && signals.recommended_priorities) ? signals.recommended_priorities : [];\n'
    '      const statP = sc.priorities || [];\n'
    '      const merged = []; const usedT = {};\n'
    '      dynP.forEach(p  => { if (merged.length < 5) { merged.push(p); usedT[p.title] = true; } });\n'
    '      statP.forEach(p => { if (merged.length < 5 && !usedT[p.title]) merged.push(p); });\n'
    '      els.prioritiesList.innerHTML = "";\n'
    '      merged.slice(0, 5).forEach((pri, idx) => {\n'
    '        const box = document.createElement("div");\n'
    '        box.className = "priority";\n'
    '        box.innerHTML = `<div class="priority-num">${idx + 1}</div><div class="priority-body"><div class="priority-title">${pri.title}</div><div class="priority-meta">Owner: ${pri.owner} \xb7 KPI: ${pri.kpi}</div><div class="priority-why">${pri.why}</div></div>`;\n'
    '        els.prioritiesList.appendChild(box);\n'
    '      });\n'
    '    }'
)

rep("F1. renderPriorities — dynamic/static merge", OLD_RENDER_PRI, NEW_RENDER_PRI)

# ═══════════════════════════════════════════════════════════════════
# G. exportPDF — get signals
# ═══════════════════════════════════════════════════════════════════

rep("G1. exportPDF — get signals from result",
    '      var r = state.lastResult;\n'
    '      var sc = pfiGetScenario(r.overall);',
    '      var r = state.lastResult;\n'
    '      var signals = r.signals || {pattern_flags:[],recommended_priorities:[],advisory_paths:[]};\n'
    '      var sc = pfiGetScenario(r.overall);')

# ═══════════════════════════════════════════════════════════════════
# H. exportPDF — page 3: observations + merged priorities
# ═══════════════════════════════════════════════════════════════════

OLD_PAGE3 = (
    '      // Page 3\n'
    '      doc.addPage();drawHeader(3,false);drawFooter();y=18;y=sectionHead("90-DAY PRIORITIES",y);\n'
    '      var usableH=PH-10-y-8,pGap=2,pCardHt=(usableH-pGap*4)/5,badgeW=11,labelX=ML+badgeW+4,labelW=CW-badgeW-4,LABELCOL=12,VALCOL_X=labelX+LABELCOL+3,valW=labelW-LABELCOL-3-8;\n'
    '      sc.priorities.forEach(function(pri,idx){'
)

NEW_PAGE3 = (
    '      // Page 3\n'
    '      doc.addPage();drawHeader(3,false);drawFooter();y=18;\n'
    '      if(signals.pattern_flags&&signals.pattern_flags.length>0){\n'
    '        y=sectionHead("MANAGEMENT OBSERVATIONS",y);\n'
    '        setFont("normal",7.5,GDARK);\n'
    '        var obsIntro="Scoring patterns suggest the following areas may warrant management attention:";\n'
    '        var obsIntroL=doc.splitTextToSize(obsIntro,CW);\n'
    '        doc.text(obsIntroL,ML,y);y+=obsIntroL.length*3.4+2;\n'
    '        var obsItems=signals.pattern_flags.slice(0,3);\n'
    '        obsItems.forEach(function(flag){\n'
    '          var fl=doc.splitTextToSize(flag,CW-5);\n'
    '          doc.setFillColor.apply(doc,GOLD);doc.circle(ML+1.5,y+3-2.0,1.2,"F");\n'
    '          setFont("normal",7.5,GDARK);doc.text(fl,ML+4.5,y+3);\n'
    '          y+=fl.length*3.4+2;\n'
    '        });\n'
    '        y+=4;\n'
    '      }\n'
    '      y=sectionHead("90-DAY PRIORITIES",y);\n'
    '      var _dynP=(signals.recommended_priorities||[]),_statP=(sc.priorities||[]),_mergedP=[],_usedT={};\n'
    '      _dynP.forEach(function(p){if(_mergedP.length<5){_mergedP.push(p);_usedT[p.title]=true;}});\n'
    '      _statP.forEach(function(p){if(_mergedP.length<5&&!_usedT[p.title])_mergedP.push(p);});\n'
    '      var usableH=PH-10-y-8,pGap=2,pCardHt=(usableH-pGap*4)/5,badgeW=11,labelX=ML+badgeW+4,labelW=CW-badgeW-4,LABELCOL=12,VALCOL_X=labelX+LABELCOL+3,valW=labelW-LABELCOL-3-8;\n'
    '      _mergedP.forEach(function(pri,idx){'
)

rep("H1. exportPDF — page 3 observations + merged priorities", OLD_PAGE3, NEW_PAGE3)

# ═══════════════════════════════════════════════════════════════════
# I. exportPDF — page 4: advisory bridge replaces static bottom note
# ═══════════════════════════════════════════════════════════════════

OLD_NOTE = (
    '      var noteText="This assessment can serve as the starting point for a deeper portfolio review '
    'using your actual transaction data, pricing records, and operating data \u2014 producing a '
    'Flow-Level Portfolio Map, Management Scorecard, and Operating Cost Structure.";'
    'setFont("normal",7.5,GDARK);var noteLines=doc.splitTextToSize(noteText,CW-8);'
    'var noteH=noteLines.length*3.5+10;fillRect(ML,y,CW,noteH,[244,246,248],2);'
    'fillRect(ML,y,2.5,noteH,GOLD);setFont("normal",7.5,GDARK);'
    'doc.text(noteLines,ML+5,y+6);y+=noteH+5;'
)

NEW_NOTE = (
    '      var _apaths=(signals.advisory_paths||[]).slice(0,4);\n'
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
    'using your actual transaction data, pricing records, and operating data \u2014 producing a '
    'Flow-Level Portfolio Map, Management Scorecard, and Operating Cost Structure.";\n'
    '        setFont("normal",7.5,GDARK);var noteLines=doc.splitTextToSize(noteText,CW-8);\n'
    '        var noteH=noteLines.length*3.5+10;fillRect(ML,y,CW,noteH,[244,246,248],2);\n'
    '        fillRect(ML,y,2.5,noteH,GOLD);setFont("normal",7.5,GDARK);\n'
    '        doc.text(noteLines,ML+5,y+6);y+=noteH+5;\n'
    '      }'
)

rep("I1. exportPDF — advisory bridge replaces static note", OLD_NOTE, NEW_NOTE)

# ═══════════════════════════════════════════════════════════════════
# WRITE
# ═══════════════════════════════════════════════════════════════════

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Step 2 patch results:")
for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
print("\nTest: load pfi.html, run scenario 1, verify observations + priorities + advisory sections appear.")
