// model.js
// V1: Commercial banking payments portfolio diagnostic
// Future-proofing hook: tokenized rails (stablecoins) planned V2 (not in UI/scoring yet).
//
// CHANGELOG (scoring pass):
// - Balance Sheet weight: 15% → 20% (franchise ROE justification)
// - Growth Engine weight: 15% → 10% (offset; growth quality is downstream of economics)
// - Pillar floor guard: composite score is penalized when any pillar avg falls below 1.5/5.0
// - RA4: added missing score=3 option (was gap between 2 and 4)
// - GE3: added missing score=2 option
// - MR4: N/A option now flags as excluded (null) rather than scoring as 1
// - Replaced "Best-in-class" sub-labels with concrete operational descriptors
// - Added FX leakage rule (Tier 2)
// - Tightened pricing_governance_breakdown trigger (was too narrow)
// - Fixed 30/60/90 rec slice overlap (noted for app.js pass)

window.PPD_MODEL = (() => {
  const pillars = [
    {
      id: "revenue_arch",
      name: "Revenue Architecture",
      weight: 0.20,
      subtitle: "How the portfolio makes money and how resilient it is",
      questions: [
        {
          id: "RA1",
          title: "Revenue mix diversification",
          desc: "Revenue is meaningfully diversified across fee, FX, and balance contribution.",
          options: [
            { score: 1, label: "Mostly one lever", sub: "Single dominant source drives earnings" },
            { score: 2, label: "Two levers, one dominates", sub: "Some diversification but concentration risk remains" },
            { score: 4, label: "Diversified across 3 levers", sub: "Balanced fee/FX/balance contribution" },
            { score: 5, label: "Diversified + intentional mix strategy", sub: "Product-led mix optimization with documented targets" }
          ]
        },
        {
          id: "RA2",
          title: "Pricing segmentation maturity",
          desc: "Pricing is segmented by client value (size, behavior, corridor/rail, complexity).",
          options: [
            { score: 1, label: "Flat / one-size pricing", sub: "Minimal value capture differentiation" },
            { score: 2, label: "Some tiering, inconsistently enforced", sub: "Tiers exist on paper but vary deal-by-deal" },
            { score: 3, label: "Segmented for top clients only", sub: "Long-tail pricing is unmanaged" },
            { score: 4, label: "Segmented broadly with governance", sub: "Standardized tiers with approval controls" },
            { score: 5, label: "Value-based + corridor/rail + behavioral segmentation", sub: "Economics drive all pricing decisions" }
          ]
        },
        {
          id: "RA3",
          title: "Rail-level monetization clarity",
          desc: "You can explain unit economics by rail and use it to steer decisions.",
          options: [
            { score: 0, label: "Not measurable / not tracked", sub: "No visibility by rail" },
            { score: 2, label: "Tracked in pieces, no ownership", sub: "Data exists but not operationalized" },
            { score: 3, label: "Tracked for major rails occasionally", sub: "Not consistently used in decisions" },
            { score: 4, label: "Tracked + used in pricing/strategy", sub: "Regular input to steering decisions" },
            { score: 5, label: "Tracked + tied to roadmap + sales plays", sub: "Rail economics drive execution priorities" }
          ]
        },
        {
          id: "RA4",
          title: "Revenue concentration risk",
          desc: "Top 10 clients represent:",
          options: [
            { score: 0, label: ">60% of revenue", sub: "Severe volatility risk; loss of one client is a P&L event" },
            { score: 1, label: "40–60%", sub: "Material concentration; earnings stability is at risk" },
            { score: 2, label: "25–40%", sub: "Moderate concentration; manageable with active retention" },
            { score: 3, label: "10–25%", sub: "Healthy distribution across client base" },
            { score: 4, label: "<10%", sub: "Low concentration; revenue is structurally durable" }
          ]
        },
        {
          id: "RA5",
          title: "Monetization capture (revenue vs volume)",
          desc: "Over last 12–24 months, revenue growth vs volume growth:",
          options: [
            { score: 1, label: "Revenue lagging materially", sub: "Systematic value under-capture" },
            { score: 2, label: "Revenue flat while volume up", sub: "Pricing or mix leakage present" },
            { score: 4, label: "Revenue slightly outpacing volume", sub: "Healthy monetization capture" },
            { score: 5, label: "Revenue consistently outpacing volume", sub: "Pricing power and mix improvement confirmed" }
          ]
        },
        {
          id: "RA6",
          title: "FX monetization integration (if applicable)",
          desc: "For FX-enabled flows, FX is:",
          options: [
            { score: 0, label: "Not offered / not monetized", sub: "No FX capture" },
            { score: 2, label: "Offered ad-hoc, minimal capture", sub: "Inconsistent spread management" },
            { score: 3, label: "Offered but weak pricing discipline", sub: "Spread leakage likely" },
            { score: 4, label: "Embedded in flows + pricing framework", sub: "Standardized capture with controls" },
            { score: 5, label: "Embedded + corridor strategy + spread management", sub: "Corridor-level economics actively managed" }
          ]
        },
        {
          id: "RA7",
          title: "Packaging strategy",
          desc: "Monetization model is:",
          options: [
            { score: 1, label: "Purely bundled / all-you-can-eat", sub: "Limited pricing levers; value leakage likely" },
            { score: 2, label: "Mostly bundled with some add-ons", sub: "Partial levers; no systematic optimization" },
            { score: 4, label: "Mixed model with clear value levers", sub: "Intentional packaging with defined add-on economics" },
            { score: 5, label: "Packaging tied to behavior + economics", sub: "Usage-linked packaging with measurable margin impact" }
          ]
        }
      ]
    },

    {
      id: "growth_engine",
      name: "Growth Engine Quality",
      weight: 0.10,
      subtitle: "Whether growth is structural and monetizable",
      questions: [
        { id: "GE1", title: "Primary growth engine repeatability", desc: "How repeatable is the GTM engine?",
          options: [
            { score: 1, label: "Mostly inbound / legacy relationships", sub: "No structured outbound motion" },
            { score: 2, label: "Relationship-led, inconsistent", sub: "Results depend on individuals, not systems" },
            { score: 3, label: "Active GTM motions but uneven", sub: "Some playbooks exist; execution varies" },
            { score: 4, label: "Repeatable engine + documented playbooks", sub: "Predictable growth motion across segments" },
            { score: 5, label: "Multiple engines (embedded + direct + partners)", sub: "Diversified GTM with measurable conversion" }
          ]
        },
        { id: "GE2", title: "Attachment / cross-sell management", desc: "Payments attach rate is:",
          options: [
            { score: 1, label: "Low / not tracked", sub: "No systematic attach motion" },
            { score: 2, label: "Tracked but not actively managed", sub: "Visibility without accountability" },
            { score: 3, label: "Managed for top segments only", sub: "Long-tail attach is unmanaged" },
            { score: 4, label: "Managed across segments with targets", sub: "Attach rate is a tracked KPI" },
            { score: 5, label: "Optimized via incentives + product design", sub: "Attach drives measurable revenue uplift" }
          ]
        },
        { id: "GE3", title: "Workflow embed depth", desc: "Payments embedded in client workflows (ERP/TMS/AP/AR):",
          options: [
            { score: 1, label: "Mostly portal/manual", sub: "Low stickiness; high switching risk" },
            { score: 2, label: "Limited file-based integrations", sub: "Some embed, easily replaced" },
            { score: 3, label: "File-based integrations common", sub: "Moderate embed across client base" },
            { score: 4, label: "APIs/connectors + structured onboarding motion", sub: "High embed potential; growing stickiness" },
            { score: 5, label: "Deeply embedded + high switching costs", sub: "Workflow dependency creates durable distribution" }
          ]
        },
        { id: "GE4", title: "Sales specialization & enablement", desc: "Commercial payments sales motion:",
          options: [
            { score: 1, label: "No specialist sales motion", sub: "Generalist coverage; payments is an afterthought" },
            { score: 2, label: "Some specialists, significant coverage gaps", sub: "Inconsistent across segments" },
            { score: 3, label: "Dedicated coverage, limited enablement tools", sub: "Specialists in place but underequipped" },
            { score: 4, label: "Specialist + enablement + documented plays", sub: "Strong coverage with segment-specific tools" },
            { score: 5, label: "Sales motion tied to unit economics and margin targets", sub: "Revenue quality is a sales accountability" }
          ]
        },
        { id: "GE5", title: "Pipeline quality", desc: "Pipeline conversion and quality:",
          options: [
            { score: 1, label: "Dominated by price shopping", sub: "Weak differentiation; margin pressure at entry" },
            { score: 2, label: "Mixed quality, inconsistent conversion", sub: "No clear signal on what wins" },
            { score: 4, label: "Strong conversion in priority segments", sub: "Focus is working; coverage gaps elsewhere" },
            { score: 5, label: "Predictable conversion + cohort tracking", sub: "Win patterns understood and replicated" }
          ]
        },
        { id: "GE6", title: "Client experience as growth driver", desc: "Onboarding and ongoing CX:",
          options: [
            { score: 1, label: "High friction, frequent escalations", sub: "CX is a constraint on growth" },
            { score: 2, label: "Improvement initiatives underway", sub: "Pain acknowledged; not yet resolved" },
            { score: 4, label: "Stable CX + clear onboarding motion", sub: "CX supports rather than hinders growth" },
            { score: 5, label: "CX advantage measurably tied to win rate", sub: "Onboarding speed/quality is a differentiator" }
          ]
        },
        { id: "GE7", title: "Differentiation clarity", desc: "Value prop by segment:",
          options: [
            { score: 1, label: "Unclear / 'service' only", sub: "No articulated reason to choose over competitors" },
            { score: 2, label: "Some value props, inconsistently applied", sub: "Not repeatable across the sales team" },
            { score: 4, label: "Clear differentiated offer per segment", sub: "Sales team can articulate it consistently" },
            { score: 5, label: "Quantified outcomes (time, risk, cost savings)", sub: "Value prop anchored in client economics" }
          ]
        }
      ]
    },

    {
      id: "margin_cost",
      name: "Margin & Cost Structure",
      weight: 0.20,
      subtitle: "Margin durability and hidden leakage (especially exceptions)",
      questions: [
        { id: "MC1", title: "Gross margin band", desc: "Gross margin:",
          options: [
            { score: 0, label: "<25%", sub: "Structurally challenged; cost model requires redesign" },
            { score: 2, label: "25–40%", sub: "Margin is vulnerable to volume or mix shifts" },
            { score: 3, label: "40–55%", sub: "Adequate; improvement levers exist" },
            { score: 4, label: "55–70%", sub: "Strong margin with room to invest" },
            { score: 5, label: ">70%", sub: "High-margin franchise with structural cost advantages" }
          ]
        },
        { id: "MC2", title: "Exception / repair rate", desc: "Percent of payments requiring manual repair:",
          options: [
            { score: 0, label: ">5%", sub: "Critical operational leakage; margin and CX both at risk" },
            { score: 1, label: "3–5%", sub: "Material leakage; repair costs are a hidden P&L drag" },
            { score: 3, label: "1.5–3%", sub: "Moderate leakage; targeted reduction program warranted" },
            { score: 4, label: "0.5–1.5%", sub: "Healthy STP rate; exceptions are manageable" },
            { score: 5, label: "<0.5%", sub: "High STP discipline; exceptions are rare and documented" }
          ]
        },
        { id: "MC3", title: "Repair cost visibility", desc: "Repair cost measurement:",
          options: [
            { score: 0, label: "Not measured", sub: "Margin impact of exceptions is unknown" },
            { score: 2, label: "Estimated qualitatively", sub: "Directional awareness only" },
            { score: 3, label: "Measured periodically", sub: "Some discipline; not embedded in operating cadence" },
            { score: 4, label: "Measured + owned as a KPI", sub: "Repair cost tracked and reviewed regularly" },
            { score: 5, label: "Tied to roadmap and team incentives", sub: "Repair reduction drives product and ops decisions" }
          ]
        },
        { id: "MC4", title: "Unit cost discipline", desc: "Unit cost per payment/client tracking:",
          options: [
            { score: 0, label: "No unit cost tracking", sub: "No cost lens for pricing or roadmap decisions" },
            { score: 2, label: "Partial tracking", sub: "Some data; not systematically used" },
            { score: 3, label: "Tracked and periodically reviewed", sub: "Baseline discipline; not yet operationalized" },
            { score: 4, label: "Used regularly in pricing decisions", sub: "Cost floors inform deal governance" },
            { score: 5, label: "Used in product design and roadmap tradeoffs", sub: "Economics-driven delivery decisions" }
          ]
        },
        { id: "MC5", title: "External cost dependency management", desc: "Dependence on correspondents/networks/vendors:",
          options: [
            { score: 1, label: "High dependency, unmanaged", sub: "External costs are a structural margin risk" },
            { score: 2, label: "High dependency, reactive negotiations", sub: "Cost managed deal-by-deal, not strategically" },
            { score: 3, label: "Moderate dependency, actively managed", sub: "Contracts reviewed; some routing optimization" },
            { score: 4, label: "Optimized via routing and contract structure", sub: "External costs are a managed lever" },
            { score: 5, label: "Dynamic optimization strategy in place", sub: "Routing and contracts adjusted based on economics" }
          ]
        },
        { id: "MC6", title: "Pricing leakage controls", desc: "Discounting/override controls:",
          options: [
            { score: 1, label: "Overrides frequent and unmanaged", sub: "Leakage is likely significant and invisible" },
            { score: 2, label: "Some controls, inconsistently applied", sub: "Override rate not tracked; leakage uncertain" },
            { score: 3, label: "Strong controls for top clients", sub: "Long-tail remains uncontrolled" },
            { score: 4, label: "Controls + override analytics in place", sub: "Leakage visible and actively managed" },
            { score: 5, label: "Elasticity testing + governance discipline", sub: "Pricing decisions informed by data and authority tiers" }
          ]
        },
        { id: "MC7", title: "Margin resilience", desc: "Resilience to rate/volume mix changes:",
          options: [
            { score: 1, label: "Highly fragile", sub: "Small volume or rate shifts create material margin risk" },
            { score: 2, label: "Some fragility", sub: "Limited mitigation levers available" },
            { score: 3, label: "Neutral / manageable", sub: "Reasonable resilience; levers exist but not optimized" },
            { score: 4, label: "Resilient with multiple levers", sub: "Mix, pricing, and cost levers available" },
            { score: 5, label: "Clearly resilient with documented lever playbook", sub: "Response strategy is defined and tested" }
          ]
        }
      ]
    },

    {
      id: "multi_rail",
      name: "Multi-Rail Strategy & Future Readiness",
      weight: 0.15,
      subtitle: "Real-time readiness, data maturity, and rail optimization",
      questions: [
        { id: "MR1", title: "Real-time payments (send) capability", desc: "RTP/FedNow send capability:",
          options: [
            { score: 1, label: "Receive-only / none", sub: "Behind market; send capability gap growing" },
            { score: 2, label: "Limited send (pilot stage)", sub: "Capability exists; not yet at scale" },
            { score: 3, label: "Send available for some segments", sub: "Partial scale; GTM motion limited" },
            { score: 4, label: "Scaled send + active GTM motion", sub: "Strong readiness; use cases being developed" },
            { score: 5, label: "Scaled + packaged use cases + monetized", sub: "RTP/FedNow is a revenue and differentiation lever" }
          ]
        },
        { id: "MR2", title: "ISO 20022 / structured data maturity", desc: "Data/ISO readiness:",
          options: [
            { score: 1, label: "Not started", sub: "Significant gap; compliance and STP risk" },
            { score: 2, label: "In flight", sub: "Transition underway; benefits not yet realized" },
            { score: 3, label: "Implemented, limited operational usage", sub: "Compliant but not yet leveraged" },
            { score: 4, label: "Implemented + actively leveraged", sub: "Structured data improving STP and analytics" },
            { score: 5, label: "Leveraged for STP, pre-validation, and analytics", sub: "ISO data is a margin and CX lever" }
          ]
        },
        { id: "MR3", title: "Rail choice / routing strategy", desc: "Routing optimization:",
          options: [
            { score: 1, label: "No routing strategy; static defaults", sub: "Cost and performance not optimized" },
            { score: 2, label: "Basic rules, limited optimization", sub: "Routing is not a managed lever" },
            { score: 3, label: "Some optimization in place", sub: "Moderate; major corridors addressed" },
            { score: 4, label: "Optimized routing + client-configurable rules", sub: "Routing is an active cost and SLA lever" },
            { score: 5, label: "Economics-driven routing + configurable by client", sub: "Cost, speed, and risk balanced dynamically" }
          ]
        },
        {
          id: "MR4",
          title: "Cross-border corridor strategy (if applicable)",
          desc: "Corridor strategy — select 'Not applicable' if cross-border is not part of the portfolio.",
          options: [
            { score: null, label: "Not applicable", sub: "Cross-border not in scope for this portfolio" },
            { score: 2, label: "Ad-hoc / reactive", sub: "Corridor management is event-driven, not strategic" },
            { score: 3, label: "Defined for major corridors", sub: "Top corridors have documented strategy" },
            { score: 4, label: "Defined + priced + actively managed", sub: "Corridor economics tracked and optimized" },
            { score: 5, label: "Playbooks + partners + corridor-level P&L", sub: "Corridors managed as independent revenue units" }
          ]
        },
        { id: "MR5", title: "Reference data / data quality maturity", desc: "Data quality baseline:",
          options: [
            { score: 1, label: "Major data gaps", sub: "High repair rate and correspondent rejection risk" },
            { score: 2, label: "Improving, still noisy", sub: "Progress underway; repair volume still elevated" },
            { score: 3, label: "Stable baseline", sub: "Data quality is acceptable; not yet a strategic asset" },
            { score: 4, label: "High-quality + monitored with KPIs", sub: "Data quality tracked and owned" },
            { score: 5, label: "High-quality + enables automation and pre-validation", sub: "Data quality directly reduces exceptions and cost" }
          ]
        },
        { id: "MR6", title: "Fraud/risk integration maturity", desc: "Risk controls integrated into flows:",
          options: [
            { score: 1, label: "Reactive controls only", sub: "High friction; risk management slows execution" },
            { score: 2, label: "Some controls, significant friction", sub: "Risk slows GTM and client onboarding" },
            { score: 3, label: "Balanced controls, friction measurable", sub: "Trade-off between risk and speed is understood" },
            { score: 4, label: "Controls well-integrated into payment flows", sub: "Risk does not materially impede GTM" },
            { score: 5, label: "Risk posture actively enables GTM", sub: "Low-friction controls are a client-facing advantage" }
          ]
        },
        { id: "MR7", title: "Product modernization cadence", desc: "Roadmap delivery cadence:",
          options: [
            { score: 1, label: "Stalled", sub: "Backlog growing; client-facing gaps widening" },
            { score: 2, label: "Occasional releases", sub: "Delivery is unpredictable; no reliable cadence" },
            { score: 3, label: "Quarterly releases", sub: "Baseline predictability; outcomes not consistently measured" },
            { score: 4, label: "Predictable releases + outcome KPIs", sub: "Delivery tied to business results" },
            { score: 5, label: "Fast cadence + strategic outcomes tracked", sub: "Roadmap delivery is a competitive differentiator" }
          ]
        }
      ]
    },

    {
      id: "balance_liquidity",
      name: "Balance Sheet & Liquidity Contribution",
      weight: 0.20,
      subtitle: "Franchise value beyond fees: balances, stickiness, ROE",
      questions: [
        { id: "BL1", title: "Payments-to-balance linkage", desc: "Are balances linked to payments behavior and tracked?",
          options: [
            { score: 1, label: "Not linked or tracked", sub: "Franchise value from balances is invisible" },
            { score: 2, label: "Tracked loosely", sub: "Some awareness; not used in decisions" },
            { score: 3, label: "Linked for top clients only", sub: "Partial discipline; long-tail unmanaged" },
            { score: 4, label: "Linked across segments", sub: "Balance contribution visible and used" },
            { score: 5, label: "Used in pricing and GTM decisions", sub: "Balance-adjusted economics drive portfolio strategy" }
          ]
        },
        { id: "BL2", title: "Operating balance penetration", desc: "Operating balance penetration is:",
          options: [
            { score: 1, label: "Low", sub: "Weak stickiness; treasury value not captured" },
            { score: 2, label: "Moderate but not actively managed", sub: "Balances present but not a managed lever" },
            { score: 3, label: "Managed for priority segments", sub: "Targeted discipline; coverage gaps remain" },
            { score: 4, label: "High penetration with targets and plays", sub: "Balance growth is a managed objective" },
            { score: 5, label: "High penetration + optimized overlays", sub: "Operating balances systematically enhanced by liquidity products" }
          ]
        },
        { id: "BL3", title: "Liquidity overlay (sweeps/MMDA/CDs)", desc: "Liquidity product attach:",
          options: [
            { score: 1, label: "None", sub: "No liquidity overlay; balance optimization not pursued" },
            { score: 2, label: "Offered, low attach", sub: "Products available but not actively sold" },
            { score: 3, label: "Moderate attach", sub: "Attach improving; not yet systematically managed" },
            { score: 4, label: "High attach + packaged with payments", sub: "Liquidity overlay is part of the payments offer" },
            { score: 5, label: "Engineered overlay + optimized economics", sub: "Liquidity products maximize balance value and ROE" }
          ]
        },
        { id: "BL4", title: "Pricing recognizes balance value", desc: "Does pricing reflect balance contribution?",
          options: [
            { score: 1, label: "No", sub: "Pricing ignores balance contribution; ROE understated" },
            { score: 2, label: "Sometimes", sub: "Ad-hoc recognition; not systematic" },
            { score: 3, label: "Often for large clients", sub: "Partial discipline; long-tail excluded" },
            { score: 4, label: "Standard practice across segments", sub: "Balance contribution is a pricing input" },
            { score: 5, label: "Formal balance-adjusted pricing model", sub: "ROE-aware pricing applied consistently" }
          ]
        },
        { id: "BL5", title: "Rate-cycle sensitivity awareness", desc: "Rate sensitivity is:",
          options: [
            { score: 1, label: "Not assessed", sub: "Rate-cycle risk is a blind spot" },
            { score: 2, label: "Qualitative awareness only", sub: "Directional view; not measured" },
            { score: 3, label: "Measured broadly", sub: "Sensitivity understood at portfolio level" },
            { score: 4, label: "Measured + managed via defined levers", sub: "Rate-cycle playbook exists" },
            { score: 5, label: "Optimized by segment with documented response plan", sub: "Rate sensitivity is actively managed by client cohort" }
          ]
        },
        { id: "BL6", title: "Stickiness via operating model", desc: "Switching costs and retention drivers:",
          options: [
            { score: 1, label: "Low switching costs", sub: "Relationships are price-dependent; attrition risk elevated" },
            { score: 2, label: "Some stickiness", sub: "Moderate retention; not structurally embedded" },
            { score: 3, label: "Moderate stickiness", sub: "Workflow and balance ties create some durability" },
            { score: 4, label: "High stickiness via workflows and balances", sub: "Switching costs are real and documented" },
            { score: 5, label: "Very high stickiness + durable ROE contribution", sub: "Client economics make switching irrational" }
          ]
        },
        { id: "BL7", title: "Treasury integration", desc: "Payments integrated into broader treasury strategy:",
          options: [
            { score: 1, label: "Siloed from treasury strategy", sub: "Payments and treasury optimized independently" },
            { score: 2, label: "Partial coordination", sub: "Occasional alignment; not systematic" },
            { score: 3, label: "Good coordination on major decisions", sub: "Treasury and payments collaborate on key accounts" },
            { score: 4, label: "Integrated planning across products", sub: "Payments is part of the treasury franchise conversation" },
            { score: 5, label: "Fully integrated franchise strategy", sub: "Payments, balances, and liquidity managed as one P&L" }
          ]
        }
      ]
    },

    {
      id: "governance",
      name: "Governance & Operating Model",
      weight: 0.15,
      subtitle: "Can strategy execute? Who owns the levers?",
      questions: [
        { id: "GO1", title: "Clear P&L ownership", desc: "P&L ownership and authority:",
          options: [
            { score: 1, label: "No clear owner", sub: "Accountability is diffuse; execution stalls" },
            { score: 2, label: "Shared or unclear accountability", sub: "Decisions slow; no single throat to choke" },
            { score: 3, label: "Clear owner with limited authority", sub: "Owner identified but lacks levers" },
            { score: 4, label: "Clear owner + sufficient authority", sub: "Decisions can be made and implemented" },
            { score: 5, label: "Full operating cadence + P&L authority", sub: "Portfolio owner runs a disciplined operating system" }
          ]
        },
        { id: "GO2", title: "Pricing governance", desc: "Pricing decision-making model:",
          options: [
            { score: 1, label: "Sales-driven pricing; no central governance", sub: "High leakage risk; overrides untracked" },
            { score: 2, label: "Partial controls inconsistently applied", sub: "Governance exists on paper; not enforced" },
            { score: 3, label: "Central review for large deals only", sub: "Long-tail pricing remains uncontrolled" },
            { score: 4, label: "Central governance + analytics", sub: "Override rate tracked; approval tiers enforced" },
            { score: 5, label: "Governance + elasticity discipline + documented authority tiers", sub: "Pricing is a managed, data-driven process" }
          ]
        },
        { id: "GO3", title: "KPI transparency", desc: "KPI system maturity:",
          options: [
            { score: 1, label: "KPIs undefined or unclear", sub: "No operating system; decisions made without data" },
            { score: 2, label: "Some KPIs exist but fragmented", sub: "No single view; measurement is inconsistent" },
            { score: 3, label: "KPIs reviewed periodically", sub: "Baseline discipline; not yet driving decisions" },
            { score: 4, label: "Monthly exec-level KPI review", sub: "Operating rhythm established; actions tracked" },
            { score: 5, label: "KPIs drive resource allocation and decisions", sub: "Data is the primary input to portfolio management" }
          ]
        },
        { id: "GO4", title: "Cross-functional operating cadence", desc: "Operating forum effectiveness:",
          options: [
            { score: 1, label: "Ad-hoc; no structured forum", sub: "Low accountability; decisions made in silos" },
            { score: 2, label: "Occasional forums, low impact", sub: "Meetings happen; decisions do not follow" },
            { score: 3, label: "Regular forums with mixed execution", sub: "Cadence established; follow-through inconsistent" },
            { score: 4, label: "Strong cadence + decisions tracked", sub: "Forum drives action; owners accountable" },
            { score: 5, label: "Forum produces measurable outcomes each cycle", sub: "Operating cadence is a competitive advantage" }
          ]
        },
        { id: "GO5", title: "Product + Ops alignment", desc: "Ops and product collaboration:",
          options: [
            { score: 1, label: "Siloed; escalations frequent", sub: "High friction between product and ops teams" },
            { score: 2, label: "Some collaboration, inconsistent", sub: "Coordination depends on individuals" },
            { score: 3, label: "Good collaboration on major items", sub: "Works for priority issues; gaps elsewhere" },
            { score: 4, label: "Integrated planning across product and ops", sub: "STP and repair KPIs jointly owned" },
            { score: 5, label: "Joint ownership of STP, repair, and margin KPIs", sub: "Ops performance is a product design input" }
          ]
        },
        { id: "GO6", title: "Tech roadmap ownership & delivery", desc: "Roadmap clarity and delivery discipline:",
          options: [
            { score: 1, label: "No roadmap clarity", sub: "Delivery is unpredictable; backlog unmanaged" },
            { score: 2, label: "Roadmap exists but delivery is weak", sub: "Commitments missed; outcomes not tracked" },
            { score: 3, label: "Decent delivery track record", sub: "Baseline predictability; business linkage limited" },
            { score: 4, label: "Strong delivery discipline", sub: "Roadmap delivered on time with measurable outcomes" },
            { score: 5, label: "Outcome-driven roadmap with economic KPIs", sub: "Each release has a defined margin or revenue impact target" }
          ]
        },
        { id: "GO7", title: "Risk/Compliance partnership", desc: "Risk engagement model:",
          options: [
            { score: 1, label: "Risk/compliance is a late-stage blocker", sub: "GTM slowed significantly by late risk involvement" },
            { score: 2, label: "Some engagement but inconsistent", sub: "Risk involved selectively; friction unpredictable" },
            { score: 3, label: "Engaged but review cycles are slow", sub: "Risk is a partner but adds latency" },
            { score: 4, label: "Embedded in product and deal design", sub: "Risk involvement is proactive; friction low" },
            { score: 5, label: "Risk posture actively accelerates GTM", sub: "Controls are a selling point; risk enables velocity" }
          ]
        }
      ]
    }
  ];

  // Recommendation library (used by rules engine)
  const recommendations = {
    R1: { title: "Implement segmented pricing (value tiers + behavioral)", owner: "Product + Sales + Finance", metric: "Revenue/volume elasticity, margin by segment", why: "Closes monetization capture gaps without relying on volume growth." },
    R2: { title: "Introduce rail-level price floors and override controls", owner: "Pricing + Sales Leadership", metric: "Override rate, margin leakage, deal governance cycle time", why: "Stops silent margin erosion through inconsistent discounting." },
    R3: { title: "Redesign packaging (bundle + add-on value levers)", owner: "Product", metric: "ARPA, attach rate, margin mix", why: "Creates clear levers to capture value and reduce bundle leakage." },
    R4: { title: "Establish balance-adjusted pricing model", owner: "Product + Treasury + Finance", metric: "ROE contribution, balance-weighted profitability", why: "Aligns pricing with franchise value beyond fees." },
    R5: { title: "Build corridor-based FX strategy (top corridors playbook)", owner: "Product + Trading/FX + Sales", metric: "FX capture rate, spread leakage, corridor profitability", why: "Turns cross-border flows into deliberate monetization." },
    R6: { title: "Stand up Exception Reduction Program (repair KPI + cadence)", owner: "Ops + Product + Tech", metric: "Repair rate, STP %, cost per repair", why: "Repairs are often the biggest hidden driver of margin compression." },
    R7: { title: "Deploy pre-validation for top payment failure modes", owner: "Product + Tech + Ops", metric: "Top failure reason frequency, repair reduction", why: "Reduces exception volume upstream, improving CX and margin." },
    R8: { title: "Create unit cost model (cost per payment/client) and use it in pricing", owner: "Finance + Product", metric: "Unit cost by rail/segment, price floors, contribution margin", why: "Enables disciplined pricing and roadmap tradeoffs." },
    R9: { title: "Optimize external costs (routing, contracts, volume tiers)", owner: "Network Mgmt + Product + Finance", metric: "Cost per payment, correspondent/network fees", why: "Improves gross margin through structural cost levers." },
    R10:{ title: "Create STP scorecard by rail and client segment", owner: "Ops + Product", metric: "STP %, repair rates by segment", why: "Targets leakage where it matters most." },
    R11:{ title: "Build 3 segment GTM plays tied to unit economics", owner: "Product + Sales", metric: "Win rate, margin per win, attach rate", why: "Makes growth repeatable and profitable." },
    R12:{ title: "Strengthen ERP/TMS integration motion (top integrations)", owner: "Product + Tech + Sales", metric: "Integration adoption, time-to-onboard", why: "Increases stickiness and reduces switching risk." },
    R13:{ title: "Align sales incentives with margin and attach (not volume alone)", owner: "Sales Leadership + Finance", metric: "Margin per client, attach rate, discounting frequency", why: "Prevents growth that destroys profitability." },
    R14:{ title: "Implement win/loss loop tied to pricing and CX friction", owner: "Product + Sales Ops", metric: "Loss reasons, time-to-yes, onboarding friction", why: "Turns market feedback into execution priorities." },
    R15:{ title: "Scale RTP/FedNow send and package commercial use cases", owner: "Product + Tech + Sales", metric: "RTP send volume, use-case adoption, monetization", why: "Turns readiness into a growth lever." },
    R16:{ title: "ISO/data program focused on STP and repair reduction outcomes", owner: "Tech + Ops + Product", metric: "Data quality KPIs, repair driver analysis", why: "Structured data is a margin and CX lever." },
    R17:{ title: "Implement economics-aware routing strategy", owner: "Product + Tech", metric: "Routing distribution, cost per payment, SLA performance", why: "Optimizes cost and performance across rails." },
    R18:{ title: "Establish Pricing Council with authority tiers and approval cadence", owner: "Exec Sponsor + Pricing", metric: "Override rate, approval cycle time, margin integrity", why: "Governance is often the first fix for leakage." },
    R19:{ title: "Monthly Portfolio Performance Review (rails, segments, repairs)", owner: "Portfolio Owner", metric: "Pillar KPIs trending, actions closed", why: "Creates an operating system for continuous improvement." },
    R20:{ title: "Tie roadmap to economic KPIs (margin, repairs, attach)", owner: "Product + Tech + Finance", metric: "Roadmap ROI, KPI movement per release", why: "Ensures delivery drives business outcomes." }
  };

  // Rules engine — tiered: Tier 1 = structural failure, Tier 2 = monetization/margin gaps, Tier 3 = portfolio risk
  const rules = [

    // 🔴 Tier 1 — Structural Failure (blocking; must be resolved before other priorities matter)

    {
      id: "exception_margin_crisis",
      tier: 1,
      when: (a) => (a.MC2 <= 1 && a.MC3 <= 1),
      diagnosis: "Exception/repair costs are critically compressing margin and threatening franchise economics. This is a P&L emergency.",
      recs: ["R6", "R10", "R19", "R8"]
    },
    {
      id: "operating_system_absent",
      tier: 1,
      when: (a) => (a.GO3 <= 1 || a.GO4 <= 1),
      diagnosis: "The franchise lacks a functioning operating system — KPI cadence and cross-functional execution forums are absent or ineffective.",
      recs: ["R19", "R20", "R18"]
    },
    {
      id: "pricing_governance_breakdown",
      tier: 1,
      // Widened: fires when pricing governance is weak AND either cost visibility or override controls are poor
      when: (a) => (a.GO2 <= 1 && (a.MC6 <= 2 || a.RA3 <= 2 || a.MC4 <= 2)),
      diagnosis: "Pricing governance has broken down. Uncontrolled discounting and override patterns are creating systematic margin leakage.",
      recs: ["R18", "R2", "R13"]
    },

    // 🟡 Tier 2 — Monetization & Margin Improvement

    {
      id: "monetization_capture_gap",
      tier: 2,
      when: (a) => (a.RA5 <= 2 && a.GE5 >= 3),
      diagnosis: "Growth is present but monetization capture is lagging. Pricing design and packaging are the primary constraint.",
      recs: ["R1", "R3", "R2"]
    },
    {
      id: "pricing_leakage_controls_weak",
      tier: 2,
      when: (a) => (a.MC6 <= 2 || a.GO2 <= 2),
      diagnosis: "Discounting and override controls are inconsistent, creating silent margin leakage and deal-by-deal pricing volatility.",
      recs: ["R2", "R18", "R13"]
    },
    {
      id: "exceptions_material_not_crisis",
      tier: 2,
      when: (a) => (a.MC2 <= 3 && a.MC2 >= 2),
      diagnosis: "Exception/repair volume is a meaningful but addressable margin drag. It is also likely creating CX friction.",
      recs: ["R6", "R10", "R7"]
    },
    {
      id: "unit_cost_immature",
      tier: 2,
      when: (a) => (a.MC4 <= 2 || a.RA3 <= 2),
      diagnosis: "Unit cost and rail-level economics are under-instrumented, weakening pricing floors and roadmap ROI discipline.",
      recs: ["R8", "R20", "R19"]
    },
    {
      id: "cadence_weak_not_absent",
      tier: 2,
      when: (a) => (a.GO3 === 2 || a.GO4 === 2),
      diagnosis: "Operating cadence exists but lacks executive rhythm and accountability closure. Execution discipline is inconsistent.",
      recs: ["R19", "R20", "R18"]
    },
    {
      id: "balances_not_monetized",
      tier: 2,
      when: (a) => (a.BL1 <= 2 && a.BL4 <= 2),
      diagnosis: "Balance contribution appears under-monetized and is not yet reflected in pricing strategy or GTM decisions.",
      recs: ["R4", "R13", "R19"]
    },
    {
      id: "fx_without_corridor",
      tier: 2,
      when: (a) => (a.MR4 !== null && a.MR4 <= 2 && a.RA6 >= 3),
      diagnosis: "FX-enabled flows exist, but corridor strategy and spread pricing discipline appear under-optimized. FX leakage likely.",
      recs: ["R5", "R1", "R19"]
    },
    {
      // NEW: FX leakage — FX flows present but spread management weak
      id: "fx_spread_leakage",
      tier: 2,
      when: (a) => (a.RA6 >= 2 && a.RA6 <= 3 && a.MR4 !== null && a.MR4 <= 3),
      diagnosis: "Cross-border FX flows appear active but spread management and corridor economics are not yet fully operationalized. Silent FX leakage is likely.",
      recs: ["R5", "R17", "R8"]
    },
    {
      id: "rtp_readiness_gap",
      tier: 2,
      when: (a) => (a.MR1 <= 2 && a.GE3 >= 3),
      diagnosis: "Workflow embedding exists, but limited real-time send capability constrains monetizable use cases for embedded clients.",
      recs: ["R15", "R17", "R11"]
    },

    // 🔵 Tier 3 — Portfolio Risk (structural; elevated but not blocking)

    {
      id: "concentration_risk_extreme",
      tier: 3,
      when: (a) => (a.RA4 <= 1),
      diagnosis: "Revenue concentration risk is elevated. A single client event could create material P&L volatility.",
      recs: ["R11", "R1", "R18"]
    },
    {
      id: "float_dependency_risk",
      tier: 3,
      when: (a) => (a.RA1 <= 1 && a.BL5 <= 2),
      diagnosis: "Revenue mix appears overly dependent on balance-driven income with limited rate-cycle hedging. Downside rate exposure is meaningful.",
      recs: ["R3", "R4", "R19"]
    }
  ];

  // Sub-score mapping (directional)
  const subScoreMap = {
    monetization: ["revenue_arch", "growth_engine"],
    margin: ["margin_cost", "governance"],
    readiness: ["multi_rail", "balance_liquidity"]
  };

  // Pillar floor guard config
  // If any pillar avg score falls below this threshold, apply a composite score penalty
  const pillarFloorGuard = {
    threshold: 1.5,   // below this (out of 5.0) triggers a floor penalty
    penalty: 8        // points deducted from the composite 0–100 score per collapsed pillar
  };

  // V2 placeholder (disabled)
  const v2Hooks = {
    tokenizedRails: {
      enabled: false,
      note: "Planned V2: tokenized value rails (stablecoins/tokenized deposits) readiness overlay."
    }
  };

  return { pillars, rules, recommendations, subScoreMap, pillarFloorGuard, v2Hooks };
})();
