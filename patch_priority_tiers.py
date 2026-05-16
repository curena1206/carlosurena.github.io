#!/usr/bin/env python3
"""
Generalize maturity-aware priority tiers across all signal rules.
Adds priority_low / priority_mid / priority_high to every rule.
Updates selection logic: 0-50 → low, 51-70 → mid, >70 → high.
Run from carlosurena.github.io directory:
    python3 patch_priority_tiers.py
"""

with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

log = []

# ── Replace SIGNAL_RULES block ────────────────────────────────────────────────

START = '    var SIGNAL_RULES = ['
END   = '\n    function computeSignals('

si = html.find(START)
ei = html.find(END)

if si < 0 or ei < 0:
    print("MISS: Could not locate SIGNAL_RULES block boundaries")
    exit(1)

NEW_RULES = '''    var SIGNAL_RULES = [
      // ── PRICING ───────────────────────────────────────────────────────────
      {id:"pricing_governance_weak",category:"pricing",
       condition:function(a){return (a.MC6||0)<=2&&(a.GO4||0)<=2;},
       pattern_flag:"Pricing override discipline and governance appear limited across the portfolio.",
       priority_low:{title:"Establish Pricing Council with Override Controls",owner:"Exec Sponsor + Pricing Lead",kpi:"Override rate, approval cycle time, margin integrity trend",why:"Pricing governance is often the fastest lever for reducing cumulative margin inconsistency."},
       priority_mid:{title:"Strengthen Pricing Governance and Override Discipline",owner:"Exec Sponsor + Pricing Lead",kpi:"Override rate trend, margin integrity, deal-level pricing variance",why:"Strengthening pricing governance consistency may reduce cumulative margin drift across the portfolio."},
       priority_high:{title:"Advance Pricing Architecture and Portfolio Economics",owner:"Exec Sponsor + Pricing Lead",kpi:"Override rate trend, portfolio margin integrity, pricing realization across segments",why:"At this maturity level, pricing architecture becomes a strategic lever for portfolio differentiation."},
       advisory_path:{label:"Pricing visibility review",description:"Flow-level pricing analysis and override governance design."},
       impact_weight:0.30},
      {id:"rail_economics_absent",category:"pricing",
       condition:function(a){return (a.RA3||0)<=2&&(a.MC4||0)<=2;},
       pattern_flag:"Rail-level economics may not be consistently informing pricing or investment decisions.",
       priority_low:{title:"Build Rail-Level Pricing and Cost Visibility",owner:"Finance + Product",kpi:"Unit cost by rail, pricing realization rate, contribution by flow",why:"Without rail-level cost anchoring, pricing governance and routing decisions may lack economic grounding."},
       priority_mid:{title:"Deepen Rail-Level Economic Integration into Portfolio Decisions",owner:"Finance + Product",kpi:"Rail contribution trend, pricing realization by rail, cost-to-serve by flow",why:"Deeper rail economics integration may improve pricing precision and investment prioritization across the portfolio."},
       priority_high:{title:"Advance Rail Economics Across Portfolio Strategy and Pricing",owner:"Finance + Product",kpi:"Rail portfolio contribution, pricing architecture by rail, strategic rail allocation",why:"Rail-level economic intelligence supports more sophisticated portfolio positioning and investment decisions at scale."},
       advisory_path:{label:"Flow-level cost structure",description:"Rail and flow-level cost attribution and pricing floor analysis."},
       impact_weight:0.25},
      {id:"fx_monetization_gap",category:"pricing",
       condition:function(a){return a.MR4!=null&&(a.MR4||0)<=3&&(a.RA6||0)>=2&&(a.RA6||0)<=3;},
       pattern_flag:"Revenue opportunities within payment flows may not be consistently visible across client and transaction activity.",
       priority_low:{title:"Develop Pricing Visibility and Revenue Capture Discipline",owner:"Product + Pricing + Sales",kpi:"Revenue capture rate, pricing realization across payment flows, contribution visibility",why:"Revenue capture gaps across payment flows are often among the more recoverable margin opportunities in a commercial payments portfolio."},
       priority_mid:{title:"Strengthen Revenue Capture Across Payment Flow Economics",owner:"Product + Pricing + Sales",kpi:"Revenue capture rate trend, pricing realization by flow type, contribution by segment",why:"Improving revenue capture consistency across payment flows may meaningfully improve portfolio economics without volume growth."},
       priority_high:{title:"Advance Payment Flow Revenue Architecture and Capture Discipline",owner:"Product + Pricing + Sales",kpi:"Revenue architecture by flow, capture rate at portfolio level, pricing differentiation",why:"At this maturity level, revenue capture becomes an architectural discipline embedded into portfolio strategy."},
       advisory_path:{label:"Flow economics review",description:"Payment flow economics and pricing visibility analysis."},
       impact_weight:0.20},
      // ── EXCEPTION MANAGEMENT ──────────────────────────────────────────────
      {id:"exception_crisis",category:"exceptions",
       condition:function(a){return (a.MC2||0)<=1&&(a.MC3||0)<=1;},
       pattern_flag:"Exception and repair volume appears elevated with limited cost visibility or named ownership.",
       priority_low:{title:"Launch Exception Reduction Program with Named Ownership",owner:"Ops + Product + Tech",kpi:"Repair rate, STP %, cost per repair, trend vs. target",why:"Exception volume is often among the more visible sources of margin pressure in commercial payments."},
       priority_mid:{title:"Formalize Exception Management and STP Improvement Program",owner:"Ops + Product + Tech",kpi:"STP rate trend, repair rate by flow, cost per exception",why:"Formalizing exception management creates the operational discipline needed to reduce repair burden consistently."},
       priority_high:{title:"Advance STP and Exception Control as Strategic Operating Capability",owner:"Ops + Product + Tech",kpi:"STP rate at portfolio level, exception trend, cost efficiency vs. prior period",why:"Advancing exception control at this maturity level may become a source of operating differentiation and cost leverage."},
       advisory_path:{label:"Exception reduction program design",description:"Root cause analysis and STP improvement program across major payment flows."},
       impact_weight:0.30},
      {id:"exception_elevated",category:"exceptions",
       condition:function(a){return (a.MC2||0)>1&&(a.MC2||0)<=3&&(a.MC3||0)>=2;},
       pattern_flag:"Exception volume may be creating operational pressure that warrants structured review.",
       priority_low:{title:"Build Exception Tracking and Repair Cost Ownership Model",owner:"Ops + Product",kpi:"STP % by rail, repair rate trend, cost per exception",why:"Tracking repair costs consistently creates the visibility needed to prioritize reduction effort."},
       priority_mid:{title:"Strengthen Exception Discipline and STP Performance",owner:"Ops + Product",kpi:"STP rate by rail, exception trend, cost per repair vs. target",why:"Strengthening exception discipline at this stage may improve operating economics and client experience simultaneously."},
       priority_high:{title:"Advance STP Discipline as a Portfolio Operating Standard",owner:"Ops + Product",kpi:"STP rate at portfolio level, exception cost trend, repair rate vs. industry benchmark",why:"Advancing STP performance may create measurable operating cost advantage and client experience differentiation."},
       advisory_path:null,
       impact_weight:0.20},
      // ── TREASURY INTEGRATION ──────────────────────────────────────────────
      {id:"treasury_not_integrated",category:"treasury",
       condition:function(a){return (a.BL1||0)<=2&&(a.BL2||0)<=2;},
       pattern_flag:"Treasury and balance contribution may not be consistently reflected in relationship pricing or portfolio economics.",
       priority_low:{title:"Integrate Treasury Contribution into Relationship and Portfolio Economics",owner:"Finance + Relationship Management",kpi:"Treasury contribution per relationship, balance contribution rate, total relationship return",why:"Payments relationships that do not reflect balance value may be systematically underpriced."},
       priority_mid:{title:"Deepen Treasury Integration Across Portfolio Pricing and Economics",owner:"Finance + Relationship Management",kpi:"Balance-inclusive return by relationship, treasury contribution trend, pricing adjustment rate",why:"Deepening treasury integration may improve pricing precision and total relationship return visibility."},
       priority_high:{title:"Advance Treasury-Payment Economics as Portfolio Differentiator",owner:"Finance + Relationship Management",kpi:"Treasury-integrated portfolio return, balance contribution at portfolio level, relationship economics trend",why:"At this maturity level, treasury-payment economics integration may become a source of competitive and client relationship advantage."},
       advisory_path:{label:"Treasury contribution analysis",description:"Relationship economics incorporating balance contribution and pricing review."},
       impact_weight:0.25},
      {id:"rate_sensitivity_unmanaged",category:"treasury",
       condition:function(a){return (a.BL5||0)<=2&&(a.BL1||0)>=3;},
       pattern_flag:"Balance contribution appears tracked but rate-cycle sensitivity may not be consistently evaluated.",
       priority_low:{title:"Build Rate Sensitivity Model Across Operating Balance Relationships",owner:"Finance + Treasury",kpi:"Treasury contribution per relationship, balance contribution rate, total relationship return",why:"Franchises with strong balance contribution may face portfolio economics shifts as rate conditions evolve."},
       priority_mid:{title:"Formalize Rate Cycle Management Across Payment Portfolio",owner:"Finance + Treasury",kpi:"Rate sensitivity by segment, balance return vs. prior cycle, portfolio exposure by rate tier",why:"Formalizing rate cycle management may reduce portfolio economics volatility as market conditions change."},
       priority_high:{title:"Advance Rate Cycle Positioning as Strategic Portfolio Lever",owner:"Finance + Treasury",kpi:"Rate cycle exposure at portfolio level, balance-weighted return trend, strategic positioning by rate scenario",why:"Advancing rate cycle positioning may become a source of portfolio resilience and strategic differentiation at this maturity level."},
       advisory_path:{label:"Treasury contribution analysis",description:"Rate cycle sensitivity and balance-inclusive portfolio economics review."},
       impact_weight:0.20},
      {id:"treasury_coordination_absent",category:"treasury",
       condition:function(a){return (a.BL3||0)<=2;},
       pattern_flag:"Treasury contribution and payment activity may not yet be consistently integrated into broader portfolio economics.",
       priority_low:{title:"Establish Treasury-Payments Coordination for Priority Relationships",owner:"Treasury + Relationship Management",kpi:"Treasury engagement rate, joint review cadence, treasury-inclusive deal count",why:"Coordination gaps between treasury and payments often reduce total relationship value visibility."},
       priority_mid:{title:"Strengthen Treasury-Payments Operating Coordination",owner:"Treasury + Relationship Management",kpi:"Joint review frequency, treasury contribution by relationship, coordination coverage rate",why:"Strengthening treasury-payments coordination may improve total relationship economics and pricing discipline."},
       priority_high:{title:"Deepen Treasury-Payment Integration Across Portfolio Strategy",owner:"Treasury + Relationship Management",kpi:"Treasury-payment integration rate, portfolio economics contribution, relationship return trend",why:"Deepening treasury-payment integration at this maturity level may reinforce competitive positioning and relationship durability."},
       advisory_path:null,
       impact_weight:0.15},
      // ── RAIL MATURITY ─────────────────────────────────────────────────────
      {id:"rtp_capability_gap",category:"rail",
       condition:function(a){return (a.MR1||0)<=2;},
       pattern_flag:"Real-time payment capability may not yet be aligned with commercial use cases or client expectations.",
       priority_low:{title:"Develop Real-Time Payment Strategy and Use Case Roadmap",owner:"Product + Tech + Sales",kpi:"RTP send volume, use-case adoption rate, commercial contribution",why:"Real-time capability gaps may become more visible as client expectations evolve and competitors scale."},
       priority_mid:{title:"Expand Real-Time Payment Capability Across Commercial Use Cases",owner:"Product + Tech + Sales",kpi:"Real-time send volume trend, use-case penetration, commercial activation rate",why:"Expanding real-time capability into additional commercial use cases may improve client experience and competitive positioning."},
       priority_high:{title:"Extend Real-Time Commercial Capability Across Priority Use Cases",owner:"Product + Tech + Sales",kpi:"Real-time use case adoption rate, commercial contribution, client activation rate",why:"Extending real-time capability into priority commercial use cases may strengthen the franchise's competitive position as client expectations evolve."},
       advisory_path:{label:"Rail routing and cost optimization",description:"Real-time rail strategy and commercial use case development."},
       impact_weight:0.25},
      {id:"routing_and_data_weak",category:"rail",
       condition:function(a){return (a.MR3||0)<=2&&(a.MR5||0)<=2;},
       pattern_flag:"Routing discipline and data quality patterns may be contributing to operating inefficiency.",
       priority_low:{title:"Implement Economics-Aware Routing with Data Quality Program",owner:"Product + Tech + Ops",kpi:"Routing distribution by rail, STP rate, data quality KPIs",why:"Static routing and data quality gaps often compound exception volume and cost structure."},
       priority_mid:{title:"Strengthen Routing Economics and Data Quality Discipline",owner:"Product + Tech + Ops",kpi:"Routing optimization rate, STP improvement trend, data quality score by flow",why:"Strengthening routing economics and data quality may reduce operating cost and improve client execution outcomes."},
       priority_high:{title:"Advance Routing Strategy and Data Intelligence as Operating Capability",owner:"Product + Tech + Ops",kpi:"Routing intelligence coverage, STP rate at portfolio level, data quality as operating standard",why:"Advancing routing and data discipline at this maturity level may create operating efficiency advantages that are difficult for less mature franchises to replicate."},
       advisory_path:{label:"Rail routing and cost optimization",description:"Rail economics, routing strategy, and data quality improvement program."},
       impact_weight:0.20},
      {id:"cross_border_unmanaged",category:"rail",
       condition:function(a){return a.MR4!=null&&(a.MR4||0)<=2;},
       pattern_flag:"Payment flows may not yet be managed consistently across economics, servicing structure, and client experience.",
       priority_low:{title:"Establish Payment Flow Visibility and Management Discipline",owner:"Portfolio Management + Product",kpi:"Flow economics, servicing structure, client experience consistency by flow",why:"Unmanaged payment flows may carry inconsistent economics, service expectations, and pricing across the portfolio."},
       priority_mid:{title:"Strengthen Payment Flow Economics and Servicing Consistency",owner:"Portfolio Management + Product",kpi:"Flow economics trend, servicing consistency rate, client experience by flow type",why:"Strengthening payment flow management may improve economic consistency and client experience across the portfolio."},
       priority_high:{title:"Advance Payment Flow Management as Strategic Portfolio Capability",owner:"Portfolio Management + Product",kpi:"Flow portfolio economics, servicing differentiation, client experience at scale",why:"Advancing payment flow management at this maturity level may reinforce portfolio positioning and client relationship durability."},
       advisory_path:{label:"Flow economics review",description:"Flow-level economic visibility and servicing structure review."},
       impact_weight:0.20},
      // ── WORKFLOW INTEGRATION ──────────────────────────────────────────────
      {id:"workflow_and_attach_limited",category:"workflow",
       condition:function(a){return (a.GE3||0)<=2&&(a.GE2||0)<=2;},
       pattern_flag:"Client workflow integration and product attach depth appear limited, which may affect relationship durability.",
       priority_low:{title:"Build Workflow Integration Program for Priority Client Relationships",owner:"Relationship Management + Product",kpi:"Workflow integration rate, product depth per client, relationship durability",why:"Limited workflow integration may increase relationship sensitivity to pricing or service competition."},
       priority_mid:{title:"Deepen Client Workflow Integration and Product Attach Discipline",owner:"Relationship Management + Product",kpi:"Integration depth trend, attach rate by segment, relationship durability score",why:"Deepening workflow integration may improve relationship durability and reduce competitive vulnerability across priority clients."},
       priority_high:{title:"Advance Client Integration as Strategic Relationship Capability",owner:"Relationship Management + Product",kpi:"Integration coverage at portfolio level, attach rate trend, client operating dependence",why:"Advancing client integration at this maturity level may create relationship durability that is structurally difficult for competitors to displace."},
       advisory_path:null,
       impact_weight:0.20},
      {id:"onboarding_friction",category:"workflow",
       condition:function(a){return (a.GE4||0)<=2;},
       pattern_flag:"Onboarding and activation discipline may be creating friction that affects revenue realization timing.",
       priority_low:{title:"Standardize Onboarding and Activation Across Major Segments",owner:"Ops + Product + Sales",kpi:"Time-to-activate, onboarding completion rate, revenue realization lag",why:"Onboarding friction delays revenue and may create early relationship risk."},
       priority_mid:{title:"Strengthen Onboarding Discipline and Activation Quality",owner:"Ops + Product + Sales",kpi:"Activation time trend, onboarding quality score, revenue realization improvement",why:"Strengthening onboarding discipline may accelerate revenue realization and improve early relationship experience."},
       priority_high:{title:"Advance Onboarding as Commercial Velocity Capability",owner:"Ops + Product + Sales",kpi:"Onboarding velocity, time-to-revenue, activation quality at portfolio scale",why:"Advancing onboarding as a commercial capability may create measurable competitive advantage in client acquisition and relationship launch speed."},
       advisory_path:null,
       impact_weight:0.15},
      // ── COST VISIBILITY ───────────────────────────────────────────────────
      {id:"unit_cost_absent",category:"cost",
       condition:function(a){return (a.MC4||0)<=1;},
       pattern_flag:"Unit cost visibility may be absent, which can limit pricing discipline and investment prioritization.",
       priority_low:{title:"Build Unit Cost Model by Rail and Segment",owner:"Finance + Product",kpi:"Unit cost by rail, segment price floors, contribution margin",why:"Cost anchoring is a prerequisite for consistent pricing governance and investment prioritization."},
       priority_mid:{title:"Deepen Unit Cost Visibility and Pricing Integration",owner:"Finance + Product",kpi:"Unit cost trend by rail, pricing floor adherence, cost-informed investment rate",why:"Deepening unit cost visibility may improve pricing precision and strengthen investment decision discipline."},
       priority_high:{title:"Advance Cost Architecture as Strategic Portfolio Lever",owner:"Finance + Product",kpi:"Cost architecture coverage, unit cost at portfolio level, cost-to-serve differentiation",why:"Advancing cost architecture at this maturity level may become a source of pricing advantage and portfolio economics differentiation."},
       advisory_path:{label:"Flow-level cost structure",description:"Unit cost modeling and cost attribution across rails and segments."},
       impact_weight:0.30},
      {id:"cost_visibility_limited",category:"cost",
       condition:function(a){return (a.MC4||0)>1&&(a.MC4||0)<=2&&(a.MC5||0)<=2;},
       pattern_flag:"Cost management discipline appears limited across both internal processing and external provider costs.",
       priority_low:{title:"Develop Comprehensive Cost Visibility Across Rails and Providers",owner:"Finance + Portfolio Management",kpi:"Unit cost trend, external provider cost per payment, routing cost impact",why:"Gaps in internal and external cost visibility may limit margin management options."},
       priority_mid:{title:"Strengthen Cost Management Discipline Across Internal and External Drivers",owner:"Finance + Portfolio Management",kpi:"Internal cost trend, external provider cost management, cost discipline score",why:"Strengthening cost management across internal and external drivers may improve margin resilience across the portfolio."},
       priority_high:{title:"Advance Cost Intelligence as Operating Efficiency Capability",owner:"Finance + Portfolio Management",kpi:"Cost intelligence coverage, cost-to-serve differentiation, portfolio margin trend",why:"Advancing cost intelligence at this maturity level may create operating efficiency advantages that support sustained portfolio performance."},
       advisory_path:{label:"Flow-level cost structure",description:"End-to-end cost visibility model including internal processing and external network costs."},
       impact_weight:0.20},
      // ── GOVERNANCE ────────────────────────────────────────────────────────
      {id:"ownership_and_kpi_weak",category:"governance",
       condition:function(a){return (a.GO1||0)<=2&&(a.GO2||0)<=2;},
       pattern_flag:"Portfolio ownership and KPI review discipline appear limited, which may reduce management visibility into recurring patterns.",
       priority_low:{title:"Establish Portfolio Ownership Model with Recurring KPI Review",owner:"Senior Management + Portfolio Owner",kpi:"Ownership clarity, KPI review frequency, actions opened and closed per cycle",why:"Named ownership and recurring review create the accountability structure needed for sustained improvement."},
       priority_mid:{title:"Strengthen Portfolio Ownership and KPI Governance Discipline",owner:"Senior Management + Portfolio Owner",kpi:"KPI review consistency, ownership clarity trend, action closure rate per cycle",why:"Strengthening portfolio ownership and KPI discipline may improve management visibility and operating accountability."},
       priority_high:{title:"Advance Portfolio Governance as Strategic Steering Capability",owner:"Senior Management + Portfolio Owner",kpi:"Governance discipline at portfolio scale, KPI integration across functions, strategic steering effectiveness",why:"Advancing portfolio governance at this maturity level may reinforce disciplined decision-making and strategic portfolio steering."},
       advisory_path:{label:"Portfolio governance design",description:"Operating model design for portfolio ownership, KPI governance, and review cadence."},
       impact_weight:0.30},
      {id:"cross_functional_limited",category:"governance",
       condition:function(a){return (a.GO3||0)<=2;},
       pattern_flag:"Cross-functional coordination across product, finance, and operations may be operating inconsistently.",
       priority_low:{title:"Establish Cross-Functional Operating Review with Shared Portfolio Metrics",owner:"Portfolio Owner + Finance + Ops",kpi:"Review participation rate, actions closed per cycle, cross-functional alignment",why:"Portfolio decisions made without cross-functional input may reflect incomplete economics."},
       priority_mid:{title:"Strengthen Cross-Functional Coordination and Portfolio Alignment",owner:"Portfolio Owner + Finance + Ops",kpi:"Coordination consistency, shared metric usage, cross-functional decision quality",why:"Strengthening cross-functional coordination may improve portfolio economics integration and decision-making discipline."},
       priority_high:{title:"Advance Integrated Operating Model as Competitive Capability",owner:"Portfolio Owner + Finance + Ops",kpi:"Operating model integration score, cross-functional decision velocity, portfolio alignment at scale",why:"Advancing the integrated operating model at this maturity level may create coordination advantages that support sustained portfolio performance."},
       advisory_path:{label:"Portfolio governance design",description:"Cross-functional operating model and shared metrics framework."},
       impact_weight:0.20},
      {id:"portfolio_visibility_limited",category:"governance",
       condition:function(a){return (a.GO6||0)<=2&&(a.GO5||0)<=2;},
       pattern_flag:"Management visibility into portfolio economics appears limited across major rails and segments.",
       priority_low:{title:"Build Integrated Portfolio Visibility for Management Review",owner:"Finance + Product + Portfolio Owner",kpi:"Portfolio coverage, KPI accessibility, management review frequency",why:"Visibility gaps at the portfolio level may slow response to operating or pricing pressure."},
       priority_mid:{title:"Deepen Portfolio Visibility and Management Intelligence",owner:"Finance + Product + Portfolio Owner",kpi:"Visibility coverage trend, management review quality, decision response time",why:"Deepening portfolio visibility may improve operating responsiveness and strategic decision quality."},
       priority_high:{title:"Advance Portfolio Intelligence as Strategic Decision Capability",owner:"Finance + Product + Portfolio Owner",kpi:"Portfolio intelligence coverage, decision velocity, management insight at scale",why:"Advancing portfolio intelligence at this maturity level may create decision-making capabilities that distinguish the franchise from less mature competitors."},
       advisory_path:{label:"Portfolio governance design",description:"Integrated portfolio reporting and management visibility design."},
       impact_weight:0.20}
    ];'''

html = html[:si] + NEW_RULES + html[ei:]
log.append("  OK  [Replace SIGNAL_RULES — 18 rules with priority_low/mid/high]")

# ── Update priority selection logic ──────────────────────────────────────────

from_sel = ('        var activePri=(overall>70&&r.priority_high)?r.priority_high:r.priority;\n'
            '        if (activePri && !seenPri[activePri.title]) {')

to_sel   = ('        var activePri=overall>70&&r.priority_high?r.priority_high:overall>50&&r.priority_mid?r.priority_mid:r.priority_low||r.priority;\n'
            '        if (activePri && !seenPri[activePri.title]) {')

if from_sel in html:
    html = html.replace(from_sel, to_sel, 1)
    log.append("  OK  [Update priority selection logic — 3-tier]")
else:
    log.append("  MISS [Update priority selection logic]")

# ── Write ─────────────────────────────────────────────────────────────────────

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Priority tiers patch results:")
for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
