// model.js
// V1: Commercial banking payments portfolio diagnostic
// Language pass: all question descriptions, option labels, sub-labels,
// maturity thresholds, and rules diagnosis rewritten for operator clarity.

window.PPD_MODEL = (() => {

  const pillars = [

    // ── 01 Revenue Architecture ──────────────────────────────────────────
    {
      id: "revenue_arch",
      name: "Revenue Architecture",
      weight: 0.20,
      subtitle: "How the portfolio generates revenue and how durable that mix is",
      questions: [
        {
          id: "RA1",
          title: "Revenue mix across fee, FX, and balance contribution",
          desc: "How diversified is the portfolio's revenue across transaction fees, FX spreads, and balance-driven NII?",
          options: [
            { score: 1, label: "Single source drives the P&L", sub: "One lever — rate cycle, volume, or FX — can swing the whole book" },
            { score: 2, label: "Two sources, one dominates", sub: "Partial diversification; concentration risk remains material" },
            { score: 4, label: "Three sources, reasonably balanced", sub: "Fee, FX, and balance contribution all tracked and managed" },
            { score: 5, label: "Balanced mix with intentional allocation targets", sub: "Mix is actively managed and adjusted by cycle and segment" }
          ]
        },
        {
          id: "RA2",
          title: "Pricing segmentation maturity",
          desc: "How consistently is pricing differentiated by client size, corridor, rail, and behavioral value?",
          options: [
            { score: 1, label: "Flat pricing — no segmentation", sub: "Same price for every client; value capture is minimal" },
            { score: 2, label: "Tiering exists but is applied inconsistently", sub: "Deal-by-deal variation undermines the model" },
            { score: 3, label: "Segmented for top clients only", sub: "Long-tail pricing is unmanaged; leakage is likely" },
            { score: 4, label: "Segmented across tiers with governance controls", sub: "Standardized tiers; approval process enforced" },
            { score: 5, label: "Value-based segmentation by corridor, rail, and behavior", sub: "Client economics drive every pricing decision" }
          ]
        },
        {
          id: "RA3",
          title: "Rail-level unit economics visibility",
          desc: "Can you explain revenue, cost, and margin by rail — and is that data used to steer pricing and investment decisions?",
          options: [
            { score: 0, label: "No visibility by rail", sub: "Economics are a black box; steering decisions are guesswork" },
            { score: 2, label: "Data exists but sits in spreadsheets, unowned", sub: "Directional awareness only; not operationalized" },
            { score: 3, label: "Tracked for major rails, reviewed occasionally", sub: "Baseline discipline; not consistently driving decisions" },
            { score: 4, label: "Tracked and used regularly in pricing and strategy", sub: "Rail economics are a standard input to steering decisions" },
            { score: 5, label: "Rail P&L drives roadmap, pricing floors, and sales plays", sub: "Every material decision starts with rail-level economics" }
          ]
        },
        {
          id: "RA4",
          title: "Revenue concentration — top 10 clients",
          desc: "What share of total payments revenue do the top 10 clients represent?",
          options: [
            { score: 0, label: "More than 60%", sub: "Loss of one client is a P&L event; concentration is a governance issue" },
            { score: 1, label: "40–60%", sub: "Material concentration; earnings stability is structurally at risk" },
            { score: 2, label: "25–40%", sub: "Moderate concentration; manageable with active retention discipline" },
            { score: 3, label: "10–25%", sub: "Healthy distribution; no single client is a systemic risk" },
            { score: 4, label: "Less than 10%", sub: "Durable revenue base; concentration is not a portfolio risk" }
          ]
        },
        {
          id: "RA5",
          title: "Revenue vs. volume growth — monetization capture",
          desc: "Over the last 12–24 months, how has revenue growth tracked relative to volume growth?",
          options: [
            { score: 1, label: "Revenue lagging volume materially", sub: "Value is being produced but not captured — systematic under-pricing" },
            { score: 2, label: "Revenue flat while volume grew", sub: "Pricing or mix leakage is occurring; the P&L is not keeping up" },
            { score: 4, label: "Revenue growing slightly ahead of volume", sub: "Pricing power is working; mix or rate improvements contributing" },
            { score: 5, label: "Revenue consistently outpacing volume", sub: "Pricing discipline and mix management are confirmed and measurable" }
          ]
        },
        {
          id: "RA6",
          title: "FX monetization and spread management",
          desc: "For cross-border flows, how systematically is FX spread captured and managed by corridor?",
          options: [
            { score: 0, label: "FX not offered or not monetized", sub: "Cross-border flows produce no FX contribution" },
            { score: 2, label: "FX available but spread not systematically managed", sub: "Inconsistent capture; leakage almost certain" },
            { score: 3, label: "Offered with some pricing discipline; corridor gaps remain", sub: "Spread managed for major corridors; long-tail is uncontrolled" },
            { score: 4, label: "Embedded in flows with a standard pricing framework", sub: "Corridor-level economics tracked; spread controls enforced" },
            { score: 5, label: "Corridor strategy with spread management and P&L visibility", sub: "FX is a deliberate, measurable revenue lever by corridor" }
          ]
        },
        {
          id: "RA7",
          title: "Packaging and monetization model",
          desc: "How is the payments offer structured — and does the packaging create clear value capture levers?",
          options: [
            { score: 1, label: "All-inclusive bundle — no variable levers", sub: "Usage growth doesn't flow to the P&L; value leakage is structural" },
            { score: 2, label: "Mostly bundled with limited add-ons", sub: "Some levers exist but are not systematically managed" },
            { score: 4, label: "Mixed model with defined bundle and add-on economics", sub: "Intentional packaging with measurable P&L impact per tier" },
            { score: 5, label: "Usage-linked packaging tied to client behavior and margin targets", sub: "Packaging is a managed revenue lever with documented economics" }
          ]
        }
      ]
    },

    // ── 02 Growth Engine Quality ─────────────────────────────────────────
    {
      id: "growth_engine",
      name: "Growth Engine Quality",
      weight: 0.10,
      subtitle: "Whether growth is structural, repeatable, and monetizable",
      questions: [
        {
          id: "GE1",
          title: "GTM repeatability — is the growth engine systematic?",
          desc: "How repeatable and structured is the go-to-market motion for winning new payments business?",
          options: [
            { score: 1, label: "Inbound only — no structured outbound motion", sub: "Growth depends on clients finding you; no proactive engine" },
            { score: 2, label: "Relationship-led; results depend on individuals", sub: "No repeatable system; coverage is uneven across the team" },
            { score: 3, label: "Active GTM motions with uneven execution", sub: "Playbooks exist but adoption varies; outcomes are inconsistent" },
            { score: 4, label: "Repeatable engine with documented segment playbooks", sub: "Predictable growth motion; wins are replicable" },
            { score: 5, label: "Multiple engines — direct, embedded, and partner-led", sub: "Diversified GTM with measurable conversion by channel" }
          ]
        },
        {
          id: "GE2",
          title: "Payments attach rate to banking relationships",
          desc: "How actively is payments cross-sell managed across the banking client base?",
          options: [
            { score: 1, label: "Low attach — not tracked or managed", sub: "Most banking clients do not have payments; no systematic motion" },
            { score: 2, label: "Tracked but not actively managed", sub: "Visibility exists; accountability does not" },
            { score: 3, label: "Managed for priority segments only", sub: "Long-tail attach rate is unmanaged and likely low" },
            { score: 4, label: "Managed across segments with targets and coverage", sub: "Attach rate is a tracked KPI with named owners" },
            { score: 5, label: "Attach optimized through incentives and product design", sub: "Structural attach drivers built into the offer and sales motion" }
          ]
        },
        {
          id: "GE3",
          title: "Workflow embed depth — ERP, TMS, AP/AR integration",
          desc: "How deeply are payments embedded in client operational workflows?",
          options: [
            { score: 1, label: "Mostly portal-based or manual initiation", sub: "Low stickiness; easy to replace with a competitor" },
            { score: 2, label: "File-based integrations in place, limited API", sub: "Some embed; not yet creating meaningful switching costs" },
            { score: 3, label: "File integrations are common across the client base", sub: "Moderate embed; API motion is nascent" },
            { score: 4, label: "API and connector integrations with structured onboarding", sub: "Growing stickiness; switching costs are becoming real" },
            { score: 5, label: "Deeply embedded — workflow dependency creates durable distribution", sub: "Clients would face meaningful operational disruption to switch" }
          ]
        },
        {
          id: "GE4",
          title: "Sales specialization and enablement",
          desc: "Does the sales model include dedicated payments specialists with the tools to win on economics?",
          options: [
            { score: 1, label: "No specialist coverage — payments handled by generalists", sub: "No dedicated motion; payments is an afterthought in most deals" },
            { score: 2, label: "Some specialists in place; coverage gaps are significant", sub: "Inconsistent across segments and geographies" },
            { score: 3, label: "Dedicated coverage but limited enablement tools", sub: "Specialists present but underequipped for economics-based selling" },
            { score: 4, label: "Specialists with playbooks and segment-specific tools", sub: "Strong coverage; sales team can sell on value, not just price" },
            { score: 5, label: "Sales motion explicitly tied to unit economics and margin targets", sub: "Revenue quality — not just volume — is a sales accountability" }
          ]
        },
        {
          id: "GE5",
          title: "Pipeline quality and conversion discipline",
          desc: "What does the payments pipeline look like — and does the team understand what drives wins vs. losses?",
          options: [
            { score: 1, label: "Pipeline dominated by price-driven deals", sub: "Weak differentiation; margin pressure starts at the first meeting" },
            { score: 2, label: "Mixed quality; no clear pattern in what wins", sub: "Conversion is inconsistent; win/loss feedback is absent" },
            { score: 4, label: "Strong conversion in target segments", sub: "The focus is working; coverage gaps exist but are manageable" },
            { score: 5, label: "Predictable conversion with cohort-level win pattern understanding", sub: "Win rates are understood, documented, and actively replicated" }
          ]
        },
        {
          id: "GE6",
          title: "Client experience as a retention and growth driver",
          desc: "Is the onboarding and ongoing service experience helping or hurting growth?",
          options: [
            { score: 1, label: "High friction — escalations are frequent and visible", sub: "CX is a constraint on growth and a source of client attrition" },
            { score: 2, label: "Improvement programs underway but pain is still present", sub: "The problem is acknowledged; it is not yet solved" },
            { score: 4, label: "Stable CX with a structured onboarding motion", sub: "Experience supports growth; it is not a drag on conversion" },
            { score: 5, label: "CX advantage is measurable and tied to win rate", sub: "Onboarding speed and service quality are documented differentiators" }
          ]
        },
        {
          id: "GE7",
          title: "Differentiation clarity by segment",
          desc: "Can the sales team clearly articulate why a client should choose this franchise over a competitor — in terms of economics, not just service?",
          options: [
            { score: 1, label: "No clear differentiation — competing on service and relationship only", sub: "No articulated reason to choose; wins are relationship-dependent" },
            { score: 2, label: "Some value props exist but are not consistently applied", sub: "Differentiation varies by rep; not repeatable across the team" },
            { score: 4, label: "Clear differentiated offer per target segment", sub: "The sales team can articulate it consistently and with confidence" },
            { score: 5, label: "Value prop anchored in quantified client outcomes", sub: "Cost savings, risk reduction, or working capital impact are the pitch" }
          ]
        }
      ]
    },

    // ── 03 Margin & Cost Structure ───────────────────────────────────────
    {
      id: "margin_cost",
      name: "Margin & Cost Structure",
      weight: 0.20,
      subtitle: "Margin durability and the hidden cost of exceptions and leakage",
      questions: [
        {
          id: "MC1",
          title: "Gross margin — current band",
          desc: "What is the approximate gross margin of the payments portfolio after direct costs?",
          options: [
            { score: 0, label: "Below 25%", sub: "Structurally challenged — cost model requires fundamental redesign" },
            { score: 2, label: "25–40%", sub: "Margin is thin and vulnerable to volume or mix shifts" },
            { score: 3, label: "40–55%", sub: "Adequate; meaningful improvement levers likely exist" },
            { score: 4, label: "55–70%", sub: "Strong — headroom to invest while maintaining discipline" },
            { score: 5, label: "Above 70%", sub: "High-margin franchise with structural cost advantages" }
          ]
        },
        {
          id: "MC2",
          title: "Exception and repair rate — percent of payments requiring manual intervention",
          desc: "What percentage of payments require manual repair or exception handling before settlement?",
          options: [
            { score: 0, label: "Above 5%", sub: "Operational failure — margin and client experience are both at risk" },
            { score: 1, label: "3–5%", sub: "Material drag — repair costs are a hidden and likely unquantified P&L burden" },
            { score: 3, label: "1.5–3%", sub: "Moderate leakage — targeted reduction program is warranted" },
            { score: 4, label: "0.5–1.5%", sub: "Healthy STP rate — exceptions are manageable and tracked" },
            { score: 5, label: "Below 0.5%", sub: "High STP discipline — exceptions are rare, documented, and driven to zero" }
          ]
        },
        {
          id: "MC3",
          title: "Repair cost visibility — is the margin impact of exceptions measured?",
          desc: "How precisely is the cost of exception handling measured and owned as a business KPI?",
          options: [
            { score: 0, label: "Not measured", sub: "The margin impact of repairs is unknown — and likely material" },
            { score: 2, label: "Directional estimate only", sub: "Qualitative awareness; no number that drives decisions" },
            { score: 3, label: "Measured periodically but not embedded in operating rhythm", sub: "Some discipline; not a standing agenda item" },
            { score: 4, label: "Measured and reviewed as a standing KPI", sub: "Repair cost is tracked, owned, and reported regularly" },
            { score: 5, label: "Tied to roadmap priorities and team-level accountability", sub: "Repair reduction drives product decisions and performance reviews" }
          ]
        },
        {
          id: "MC4",
          title: "Unit cost discipline — cost per payment tracked and used",
          desc: "Is unit cost per payment (by rail and segment) tracked and used in pricing floors and roadmap decisions?",
          options: [
            { score: 0, label: "No unit cost tracking", sub: "Pricing floors and roadmap tradeoffs lack any cost anchor" },
            { score: 2, label: "Partial tracking — data exists but is not operationalized", sub: "Some visibility; not systematically used in decisions" },
            { score: 3, label: "Tracked and reviewed periodically", sub: "Baseline discipline; not yet embedded in regular governance" },
            { score: 4, label: "Used consistently in pricing decisions and deal governance", sub: "Cost floors inform approvals; unit economics are part of the conversation" },
            { score: 5, label: "Used in product design, roadmap sequencing, and pricing strategy", sub: "Every material decision starts with unit economics" }
          ]
        },
        {
          id: "MC5",
          title: "External cost management — correspondents, networks, and vendors",
          desc: "How actively are third-party costs (correspondent banks, network fees, vendor contracts) managed as a margin lever?",
          options: [
            { score: 1, label: "High dependency — unmanaged and untracked", sub: "External costs are a structural margin risk with no mitigation" },
            { score: 2, label: "High dependency — managed reactively deal-by-deal", sub: "Costs negotiated when forced; no strategic posture" },
            { score: 3, label: "Moderate dependency — contracts reviewed and routing considered", sub: "Some optimization underway; not yet systematic" },
            { score: 4, label: "Optimized through routing strategy and contract structure", sub: "External costs are an actively managed lever with KPI visibility" },
            { score: 5, label: "Dynamic optimization — routing and contracts adjusted based on economics", sub: "Cost structure is continuously arbitraged across providers and rails" }
          ]
        },
        {
          id: "MC6",
          title: "Pricing leakage controls — discounting and override discipline",
          desc: "How controlled is deal-level discounting, and is override frequency measured and owned?",
          options: [
            { score: 1, label: "Overrides are frequent and untracked", sub: "Leakage is occurring silently — magnitude is unknown" },
            { score: 2, label: "Some controls exist but are inconsistently applied", sub: "Override rate is not measured; leakage is uncertain but likely significant" },
            { score: 3, label: "Controls in place for large deals; long-tail is unmanaged", sub: "Top-of-book discipline; the rest of the book is exposed" },
            { score: 4, label: "Override controls active with analytics and approval tiers", sub: "Leakage is visible and actively addressed" },
            { score: 5, label: "Pricing discipline enforced with elasticity data and documented authority tiers", sub: "Discounting is governed, measurable, and tied to margin outcomes" }
          ]
        },
        {
          id: "MC7",
          title: "Margin resilience — sensitivity to rate and volume mix shifts",
          desc: "How well does the portfolio hold its margin under adverse rate or volume mix changes?",
          options: [
            { score: 1, label: "Highly fragile — small shifts create material margin risk", sub: "No mitigation levers; P&L is exposed to external conditions" },
            { score: 2, label: "Some fragility — limited levers available", sub: "Sensitivity understood directionally; response options are narrow" },
            { score: 3, label: "Manageable — levers exist but are not optimized", sub: "Reasonable resilience; no documented response playbook" },
            { score: 4, label: "Resilient — multiple levers available and understood", sub: "Mix, pricing, and cost levers can be pulled in combination" },
            { score: 5, label: "Clearly resilient with a documented lever playbook", sub: "Response strategy is defined, tested, and owned" }
          ]
        }
      ]
    },

    // ── 04 Multi-Rail Strategy ───────────────────────────────────────────
    {
      id: "multi_rail",
      name: "Multi-Rail Strategy & Future Readiness",
      weight: 0.15,
      subtitle: "Real-time readiness, data maturity, and rail economics",
      questions: [
        {
          id: "MR1",
          title: "Real-time payments send capability — RTP / FedNow",
          desc: "What is the current state of real-time send capability, and is it positioned as a commercial offer?",
          options: [
            { score: 1, label: "Receive-only or no capability", sub: "Behind market — send capability gap is widening" },
            { score: 2, label: "Send in pilot; not yet at commercial scale", sub: "Capability exists; it is not generating revenue or differentiation" },
            { score: 3, label: "Send available for some segments or use cases", sub: "Partial scale; GTM motion is limited" },
            { score: 4, label: "Scaled send with active GTM motion", sub: "Capability is real; commercial use cases are in development" },
            { score: 5, label: "Scaled, packaged, and monetized use cases", sub: "RTP/FedNow is a revenue and differentiation lever, not just a feature" }
          ]
        },
        {
          id: "MR2",
          title: "ISO 20022 implementation and operational leverage",
          desc: "Where is the institution on ISO 20022 — and is structured data being used to improve STP, reduce repairs, and enhance analytics?",
          options: [
            { score: 1, label: "Not started", sub: "Compliance risk is growing; STP and repair disadvantage will compound" },
            { score: 2, label: "Migration underway — benefits not yet realized", sub: "Infrastructure investment is occurring; operational value is ahead" },
            { score: 3, label: "Implemented but not operationally leveraged", sub: "Compliant on paper; structured data is not improving outcomes yet" },
            { score: 4, label: "Implemented and actively improving STP and data quality", sub: "Structured data is reducing repairs and improving analytics" },
            { score: 5, label: "Leveraged for STP, pre-validation, and client-level analytics", sub: "ISO data is a measurable margin and CX improvement lever" }
          ]
        },
        {
          id: "MR3",
          title: "Rail selection and routing optimization",
          desc: "How actively is payment routing managed as a cost, speed, and margin lever?",
          options: [
            { score: 1, label: "Static defaults — no routing strategy", sub: "Cost and performance are unmanaged; the bank is not optimizing" },
            { score: 2, label: "Basic rules in place; routing is not a managed lever", sub: "Some structure; not generating measurable economic benefit" },
            { score: 3, label: "Optimization underway for major corridors and rails", sub: "Directional improvement; full coverage gaps remain" },
            { score: 4, label: "Optimized routing with client-configurable rules", sub: "Routing is an active cost and SLA lever with visibility" },
            { score: 5, label: "Economics-driven routing, dynamically adjusted by client and corridor", sub: "Cost, speed, and risk are continuously balanced across rails" }
          ]
        },
        {
          id: "MR4",
          title: "Cross-border corridor strategy",
          desc: "Are top corridors managed with defined pricing, partner strategy, and P&L visibility — or handled reactively? Select 'Not applicable' if cross-border is not in scope.",
          options: [
            { score: null, label: "Not applicable", sub: "Cross-border is not part of this portfolio" },
            { score: 2, label: "Reactive — corridor management is event-driven, not strategic", sub: "No corridor framework; flows are handled as they come" },
            { score: 3, label: "Defined strategy for major corridors", sub: "Top corridors are documented; long-tail is unmanaged" },
            { score: 4, label: "Defined, priced, and actively managed by corridor", sub: "Corridor economics are tracked and optimization is ongoing" },
            { score: 5, label: "Playbooks, partner strategy, and corridor-level P&L in place", sub: "Each major corridor is managed as an independent revenue unit" }
          ]
        },
        {
          id: "MR5",
          title: "Reference data and payment data quality",
          desc: "How mature is data quality discipline — and is it reducing repair rates and correspondent rejections?",
          options: [
            { score: 1, label: "Significant data quality gaps", sub: "High repair rate and correspondent rejection risk from poor reference data" },
            { score: 2, label: "Improving but still noisy — repair volume remains elevated", sub: "Progress is occurring; the drag on STP and cost is still meaningful" },
            { score: 3, label: "Stable baseline — data quality is acceptable, not yet strategic", sub: "Not creating meaningful risk; also not generating competitive advantage" },
            { score: 4, label: "High quality, monitored with defined KPIs", sub: "Data quality is tracked, owned, and improving outcomes" },
            { score: 5, label: "High quality enabling automation and pre-validation at scale", sub: "Data quality is a direct driver of STP improvement and cost reduction" }
          ]
        },
        {
          id: "MR6",
          title: "Fraud and risk control integration into payment flows",
          desc: "Are risk controls well-integrated into payment flows — or do they create friction that slows GTM and client experience?",
          options: [
            { score: 1, label: "Reactive controls only — risk management slows execution", sub: "High friction; GTM and onboarding speed are impaired" },
            { score: 2, label: "Controls in place but creating significant friction", sub: "Risk is slowing deals and client experience; the cost is visible" },
            { score: 3, label: "Balanced controls — trade-off between risk and speed is understood", sub: "Friction is measured; optimization is underway" },
            { score: 4, label: "Controls well-integrated — risk does not materially impede GTM", sub: "Risk posture is not a competitive disadvantage" },
            { score: 5, label: "Risk posture is a client-facing advantage", sub: "Low-friction, high-confidence controls are a differentiator in the market" }
          ]
        },
        {
          id: "MR7",
          title: "Product and platform modernization cadence",
          desc: "How predictable and outcome-focused is the technology delivery cadence for the payments platform?",
          options: [
            { score: 1, label: "Delivery stalled — backlog growing, client gaps widening", sub: "Platform debt is compounding; the competitive position is weakening" },
            { score: 2, label: "Occasional releases with no reliable cadence", sub: "Delivery is unpredictable; commitments are frequently missed" },
            { score: 3, label: "Quarterly release cadence established", sub: "Baseline predictability; business impact of releases is not consistently measured" },
            { score: 4, label: "Predictable releases tied to business outcome KPIs", sub: "Delivery is reliable and linked to measurable revenue or cost impact" },
            { score: 5, label: "Fast cadence with strategic outcomes tracked per release", sub: "Platform velocity is a competitive differentiator and is managed as such" }
          ]
        }
      ]
    },

    // ── 05 Balance Sheet & Liquidity ─────────────────────────────────────
    {
      id: "balance_liquidity",
      name: "Balance Sheet & Liquidity Contribution",
      weight: 0.20,
      subtitle: "The franchise value beyond fees: balances, stickiness, and ROE",
      questions: [
        {
          id: "BL1",
          title: "Payments-to-balance linkage — is balance contribution tracked and used?",
          desc: "Are operating balances generated by payments clients tracked, attributed, and used in pricing and portfolio decisions?",
          options: [
            { score: 1, label: "Balances not linked to payments behavior — no visibility", sub: "The franchise's balance value is invisible to the people managing it" },
            { score: 2, label: "Tracked loosely — awareness without decision-making utility", sub: "Someone knows the number; it is not being used to run the business" },
            { score: 3, label: "Linked and tracked for top clients only", sub: "Discipline at the top of the book; long-tail balance value is unmanaged" },
            { score: 4, label: "Linked across segments and visible in portfolio reporting", sub: "Balance contribution is a standard input to pricing and GTM conversations" },
            { score: 5, label: "Balance-adjusted economics drive pricing, GTM, and portfolio strategy", sub: "Every material decision is made with full understanding of balance contribution" }
          ]
        },
        {
          id: "BL2",
          title: "Operating balance penetration across the payments client base",
          desc: "How deeply do payments clients maintain operating balances — and is penetration actively managed?",
          options: [
            { score: 1, label: "Low penetration — balances are incidental, not captured", sub: "Weak stickiness; treasury value is not being monetized" },
            { score: 2, label: "Moderate penetration — not actively managed as a growth objective", sub: "Balances present but not a managed portfolio lever" },
            { score: 3, label: "Managed for priority segments with targets in place", sub: "Targeted discipline; long-tail penetration is not a focus" },
            { score: 4, label: "High penetration across segments with active GTM plays", sub: "Balance growth is a managed portfolio objective with named ownership" },
            { score: 5, label: "High penetration enhanced by systematic liquidity overlay", sub: "Operating balances are maximized through structured products and relationship design" }
          ]
        },
        {
          id: "BL3",
          title: "Liquidity overlay attachment — sweeps, MMDA, short-term instruments",
          desc: "How actively are liquidity management products sold alongside payments to capture and enhance balance value?",
          options: [
            { score: 1, label: "No liquidity overlay — balance optimization is not pursued", sub: "Clients manage their own liquidity; the bank is not involved" },
            { score: 2, label: "Products available but not actively sold or tracked", sub: "Overlay capability exists; attach rate is minimal and unmanaged" },
            { score: 3, label: "Moderate attach — improving but not systematically managed", sub: "Some momentum; no structured GTM motion driving it" },
            { score: 4, label: "High attach with liquidity overlay packaged into the payments offer", sub: "Overlay is part of the standard client conversation and deal structure" },
            { score: 5, label: "Engineered overlay strategy with optimized balance economics and ROE", sub: "Liquidity products are designed to maximize balance value and franchise ROE" }
          ]
        },
        {
          id: "BL4",
          title: "Balance contribution reflected in payments pricing",
          desc: "Does the pricing model account for balance contribution when determining what a client pays for payments services?",
          options: [
            { score: 1, label: "No — pricing ignores balance contribution entirely", sub: "ROE is systematically understated; high-balance clients are over-priced" },
            { score: 2, label: "Occasionally — ad-hoc recognition in select large deals", sub: "Not systematic; depends on who is doing the deal" },
            { score: 3, label: "Often for large clients — long-tail excluded", sub: "Top of book has discipline; the rest of the portfolio does not" },
            { score: 4, label: "Standard practice — balance contribution is a pricing input across segments", sub: "Balance-adjusted pricing is the rule, not the exception" },
            { score: 5, label: "Formal balance-adjusted pricing model applied consistently with ROE targets", sub: "Every deal is priced with full awareness of balance contribution and cost of funds" }
          ]
        },
        {
          id: "BL5",
          title: "Rate-cycle sensitivity — is downside exposure understood and managed?",
          desc: "How well does the franchise understand its NII exposure to a rate cycle change — and does a response playbook exist?",
          options: [
            { score: 1, label: "Not assessed — rate-cycle risk is a blind spot", sub: "A rate shift will hit the P&L without warning or mitigation" },
            { score: 2, label: "Qualitative awareness only — directional, not measured", sub: "Leadership knows it matters; the exposure is not quantified" },
            { score: 3, label: "Measured at portfolio level — segment-level sensitivity not visible", sub: "Total exposure is known; mitigation levers are not yet defined" },
            { score: 4, label: "Measured and managed through defined hedging and repricing levers", sub: "A rate-cycle response playbook exists and has named owners" },
            { score: 5, label: "Segment-level sensitivity managed with documented response by client cohort", sub: "Rate exposure is continuously monitored and proactively managed at the relationship level" }
          ]
        },
        {
          id: "BL6",
          title: "Client stickiness — are switching costs real and growing?",
          desc: "How durable is the payments relationship — and are structural switching costs being intentionally built?",
          options: [
            { score: 1, label: "Low switching costs — relationships are price-dependent", sub: "Attrition risk is elevated; the franchise is one better offer away from losing clients" },
            { score: 2, label: "Some stickiness — not structurally embedded", sub: "Moderate retention driven by inertia, not structural ties" },
            { score: 3, label: "Moderate stickiness from workflow and balance relationships", sub: "Some operational durability; it is not yet a moat" },
            { score: 4, label: "High stickiness — workflows and balances create documented switching costs", sub: "Clients face real operational disruption and cost to leave" },
            { score: 5, label: "Very high stickiness — client economics make switching irrational", sub: "Embedded workflows, balance optimization, and overlay create a durable ROE contribution" }
          ]
        },
        {
          id: "BL7",
          title: "Treasury integration — payments and broader treasury managed as one franchise",
          desc: "How integrated is the payments business with the broader treasury and liquidity strategy of the bank?",
          options: [
            { score: 1, label: "Siloed — payments and treasury optimized independently", sub: "Franchise value is sub-optimized; the relationship is not leveraged" },
            { score: 2, label: "Partial coordination — occasional, not systematic", sub: "Alignment happens on major accounts; the rest is managed separately" },
            { score: 3, label: "Good coordination on priority clients and major decisions", sub: "Treasury and payments collaborate selectively; systemic integration is limited" },
            { score: 4, label: "Integrated planning — payments is part of the treasury franchise conversation", sub: "Joint strategy, shared clients, coordinated pricing at the segment level" },
            { score: 5, label: "Fully integrated — payments, balances, and liquidity managed as one P&L", sub: "The franchise is operated as a unified treasury and payments business with shared ROE accountability" }
          ]
        }
      ]
    },

    // ── 06 Governance & Operating Model ─────────────────────────────────
    {
      id: "governance",
      name: "Governance & Operating Model",
      weight: 0.15,
      subtitle: "Can strategy execute — and who owns the levers?",
      questions: [
        {
          id: "GO1",
          title: "P&L ownership and authority — is there one throat to choke?",
          desc: "Is there a single owner of the payments P&L with the authority to make and implement decisions on pricing, cost, product, and distribution?",
          options: [
            { score: 1, label: "No clear P&L owner — accountability is diffuse", sub: "Decisions stall; no one has the authority or accountability to act" },
            { score: 2, label: "Shared or ambiguous ownership", sub: "Multiple owners means no owner; execution speed is a casualty" },
            { score: 3, label: "Clear owner identified but with limited authority over key levers", sub: "Ownership without power — the owner cannot drive the outcomes they are accountable for" },
            { score: 4, label: "Clear owner with sufficient authority over pricing, cost, and product", sub: "Decisions can be made and implemented; accountability is real" },
            { score: 5, label: "Full P&L authority with a disciplined operating cadence", sub: "The portfolio owner runs the business like a franchise — with data, rhythm, and accountability" }
          ]
        },
        {
          id: "GO2",
          title: "Pricing governance — who owns the pricing decision and how is it controlled?",
          desc: "How structured is the pricing decision-making process — and are overrides tracked, approved, and reviewed?",
          options: [
            { score: 1, label: "Sales owns pricing — no central governance", sub: "High leakage risk; every deal is a negotiation with no floor" },
            { score: 2, label: "Partial controls that are inconsistently applied", sub: "Governance exists on paper; enforcement is selective or absent" },
            { score: 3, label: "Central review for large deals only — long-tail is uncontrolled", sub: "Top-of-book discipline; the rest of the book leaks silently" },
            { score: 4, label: "Central governance with override analytics and approval tiers enforced", sub: "Override rate is tracked; pricing decisions follow a defined authority matrix" },
            { score: 5, label: "Pricing Council with elasticity discipline and documented authority tiers", sub: "Pricing is a data-driven, governed process with measurable margin integrity" }
          ]
        },
        {
          id: "GO3",
          title: "KPI framework — are the right metrics defined, owned, and reviewed?",
          desc: "How mature is the portfolio's KPI system — and are metrics driving decisions or just being reported?",
          options: [
            { score: 1, label: "KPIs undefined or unclear — decisions made without data", sub: "No operating system; the franchise is managed by intuition" },
            { score: 2, label: "Some KPIs exist but are fragmented across teams", sub: "No single view of the business; measurement is inconsistent and often lagged" },
            { score: 3, label: "KPIs reviewed periodically but not yet driving decisions", sub: "Baseline discipline; metrics inform rather than govern" },
            { score: 4, label: "Monthly executive KPI review with action tracking", sub: "Operating rhythm is established; decisions are tied to data" },
            { score: 5, label: "KPIs drive resource allocation, prioritization, and investment decisions", sub: "The portfolio is run on data — metrics are the primary input to management decisions" }
          ]
        },
        {
          id: "GO4",
          title: "Cross-functional operating cadence — does the forum produce decisions?",
          desc: "How effective is the operating forum that brings together product, ops, finance, and sales to run the payments business?",
          options: [
            { score: 1, label: "No structured forum — decisions made in silos or escalated reactively", sub: "Low accountability; cross-functional problems persist because no one owns the resolution" },
            { score: 2, label: "Forums happen but produce limited decisions or follow-through", sub: "Meetings occur; actions rarely close" },
            { score: 3, label: "Regular forum with established cadence but inconsistent follow-through", sub: "The rhythm is there; execution discipline is not" },
            { score: 4, label: "Strong cadence — decisions tracked, owners named, actions close", sub: "The forum is a real operating mechanism, not just a status meeting" },
            { score: 5, label: "Forum produces measurable outcomes every cycle — it is a competitive advantage", sub: "Operating cadence is the reason the franchise executes faster than its competitors" }
          ]
        },
        {
          id: "GO5",
          title: "Product and operations alignment on shared outcomes",
          desc: "Do product and ops teams share ownership of STP rate, repair cost, and client experience outcomes — or do they operate in separate lanes?",
          options: [
            { score: 1, label: "Siloed — escalations are frequent and friction is high", sub: "Product and ops optimize independently; the client and margin pay the price" },
            { score: 2, label: "Some collaboration — coordination depends on individuals, not structure", sub: "Good relationships help; no structural mechanism for joint ownership" },
            { score: 3, label: "Collaboration on major items — gaps persist elsewhere", sub: "Works for priority issues; systemic joint ownership is limited" },
            { score: 4, label: "Integrated planning — STP and repair KPIs jointly owned", sub: "Product design inputs are informed by ops performance; the loop is closed" },
            { score: 5, label: "Ops performance is a product design input — joint ownership of all margin KPIs", sub: "STP, repair cost, and CX outcomes are shared accountability across both functions" }
          ]
        },
        {
          id: "GO6",
          title: "Technology roadmap delivery — predictable and tied to business outcomes?",
          desc: "How disciplined is technology delivery — and are roadmap commitments linked to measurable revenue or margin outcomes?",
          options: [
            { score: 1, label: "Delivery is stalled or unpredictable — backlog is growing", sub: "Platform gaps are widening; client-facing capabilities are falling behind" },
            { score: 2, label: "Roadmap exists but delivery is unreliable", sub: "Commitments are missed; outcomes are not tracked against releases" },
            { score: 3, label: "Decent delivery track record with limited business linkage", sub: "Baseline predictability; whether it moved the P&L is rarely measured" },
            { score: 4, label: "Strong delivery with outcome KPIs defined per release", sub: "Roadmap is delivered on time and tied to measurable business impact" },
            { score: 5, label: "Outcome-driven roadmap — every release has a defined margin or revenue target", sub: "Technology delivery is managed as a business investment with explicit ROI accountability" }
          ]
        },
        {
          id: "GO7",
          title: "Risk and compliance as a GTM enabler — or a blocker?",
          desc: "Is the risk and compliance function embedded in product and deal design — or does it create late-stage friction that slows market execution?",
          options: [
            { score: 1, label: "Risk and compliance are late-stage blockers", sub: "GTM is regularly slowed by risk involvement that comes too late to be constructive" },
            { score: 2, label: "Some engagement — friction is unpredictable and inconsistent", sub: "Risk is involved selectively; the lack of predictability slows execution" },
            { score: 3, label: "Engaged but review cycles are slow — a partner that adds latency", sub: "The relationship is constructive; the process is not yet efficient" },
            { score: 4, label: "Embedded in product and deal design — friction is low and predictable", sub: "Risk involvement is proactive; surprises are rare" },
            { score: 5, label: "Risk posture actively accelerates GTM — controls are a selling point", sub: "Strong, transparent risk controls are marketed as a competitive advantage with institutional clients" }
          ]
        }
      ]
    }
  ];

  // ── Recommendations library ──────────────────────────────────────────────
  const recommendations = {
    R1:  { title: "Design and implement segmented pricing by client value and corridor", owner: "Product + Sales + Finance", metric: "Revenue per client, margin by segment, elasticity tracking", why: "Closes monetization capture gaps without depending on volume growth." },
    R2:  { title: "Establish rail-level price floors and enforce override controls", owner: "Pricing + Sales Leadership", metric: "Override rate, margin leakage by deal, governance cycle time", why: "Stops silent margin erosion from inconsistent deal-by-deal discounting." },
    R3:  { title: "Redesign packaging model — structured bundle and add-on value tiers", owner: "Product", metric: "ARPA, attach rate, margin contribution per tier", why: "Creates clear levers to capture value and reduces structural bundle leakage." },
    R4:  { title: "Build and implement balance-adjusted pricing model", owner: "Product + Treasury + Finance", metric: "ROE contribution, balance-weighted profitability by client", why: "Aligns payments pricing with total franchise value — not just fee revenue." },
    R5:  { title: "Develop corridor-based FX strategy with spread management discipline", owner: "Product + Trading/FX + Sales", metric: "FX capture rate, spread leakage by corridor, corridor-level P&L", why: "Converts cross-border flows into a deliberately managed revenue lever." },
    R6:  { title: "Launch Exception Reduction Program with repair KPI ownership and cadence", owner: "Ops + Product + Tech", metric: "Repair rate, STP %, cost per repair, trend vs. target", why: "Repairs are often the largest untracked driver of margin compression in commercial payments." },
    R7:  { title: "Deploy pre-validation targeting top payment failure modes by rail", owner: "Product + Tech + Ops", metric: "Failure reason frequency, repair reduction rate", why: "Reduces exception volume at the source — improving both margin and client experience." },
    R8:  { title: "Build unit cost model by rail and segment — and use it in pricing governance", owner: "Finance + Product", metric: "Unit cost by rail, segment price floors, contribution margin", why: "Provides the cost anchor needed for disciplined pricing and roadmap tradeoff decisions." },
    R9:  { title: "Optimize correspondent and network costs through routing strategy and contract structure", owner: "Network Management + Product + Finance", metric: "Cost per payment by rail, correspondent and network fee trends", why: "Improves gross margin through structural external cost levers that are often overlooked." },
    R10: { title: "Create STP scorecard by rail and client segment with standing ownership", owner: "Ops + Product", metric: "STP % by rail and segment, repair rates, trend vs. target", why: "Directs leakage reduction effort where the margin impact is highest." },
    R11: { title: "Build segment-level GTM plays anchored in client economics", owner: "Product + Sales", metric: "Win rate, margin per win, attach rate by segment", why: "Makes growth repeatable and ensures new clients contribute positively to the P&L." },
    R12: { title: "Strengthen ERP, TMS, and AP/AR integration motion for top client segments", owner: "Product + Tech + Sales", metric: "Integration adoption rate, time-to-onboard, NPS post-integration", why: "Increases structural stickiness and reduces the risk of relationship-dependent attrition." },
    R13: { title: "Realign sales incentives toward margin quality, attach rate, and balance contribution", owner: "Sales Leadership + Finance", metric: "Margin per client, attach rate, discounting frequency by rep", why: "Prevents volume-driven growth that systematically destroys profitability." },
    R14: { title: "Build a win/loss feedback loop tied to pricing, onboarding friction, and CX", owner: "Product + Sales Ops", metric: "Loss reason distribution, time-to-yes, onboarding friction scores", why: "Converts market signals into execution priorities — not just anecdotes." },
    R15: { title: "Scale RTP/FedNow send and develop packaged commercial use cases", owner: "Product + Tech + Sales", metric: "RTP send volume, use-case adoption rate, revenue contribution", why: "Converts infrastructure readiness into a commercial growth lever." },
    R16: { title: "ISO 20022 data program focused on STP improvement and repair reduction", owner: "Tech + Ops + Product", metric: "Data quality KPIs, repair driver analysis, STP rate trend", why: "Structured payment data is an underutilized margin and CX improvement lever." },
    R17: { title: "Implement economics-aware routing strategy across rails and corridors", owner: "Product + Tech", metric: "Routing distribution by rail, cost per payment, SLA performance", why: "Optimizes cost and performance across rails — a lever most franchises underuse." },
    R18: { title: "Establish Pricing Council with documented authority tiers and regular cadence", owner: "Exec Sponsor + Pricing Lead", metric: "Override rate, approval cycle time, margin integrity trend", why: "Governance is often the fastest first fix for systematic pricing leakage." },
    R19: { title: "Implement monthly Portfolio Performance Review across rails, segments, and repairs", owner: "Portfolio Owner", metric: "Pillar KPIs trending, actions opened and closed per cycle", why: "Creates the operating rhythm needed to continuously improve franchise performance." },
    R20: { title: "Tie technology roadmap sequencing to economic KPIs — margin, STP, and attach", owner: "Product + Tech + Finance", metric: "Roadmap ROI by release, KPI movement attributable to delivery", why: "Ensures technology delivery is managed as a business investment, not just an engineering activity." }
  };

  // ── Rules engine ─────────────────────────────────────────────────────────
  // Tier 1 = Structural failure — must be addressed before other priorities
  // Tier 2 = Monetization and margin improvement — high-value, addressable
  // Tier 3 = Portfolio risk — elevated but not immediately blocking

  const rules = [

    // Tier 1 — Structural Failure
    {
      id: "exception_margin_crisis",
      tier: 1,
      when: (a) => (a.MC2 <= 1 && a.MC3 <= 1),
      diagnosis: "Exception and repair costs are compressing margin at a rate that threatens the P&L. The volume of manual intervention is too high to manage through normal optimization — this needs a dedicated program with named ownership and a repair rate target.",
      recs: ["R6", "R10", "R19", "R8"]
    },
    {
      id: "operating_system_absent",
      tier: 1,
      when: (a) => (a.GO3 <= 1 || a.GO4 <= 1),
      diagnosis: "The franchise is operating without a functioning management system — KPIs are undefined or unused, and cross-functional execution forums are absent or ineffective. Strategy cannot execute in this environment.",
      recs: ["R19", "R20", "R18"]
    },
    {
      id: "pricing_governance_breakdown",
      tier: 1,
      when: (a) => (a.GO2 <= 1 && (a.MC6 <= 2 || a.RA3 <= 2 || a.MC4 <= 2)),
      diagnosis: "Pricing governance has broken down. Sales-driven discounting, absent override controls, and poor cost visibility are creating systematic margin leakage — at a scale that is likely invisible to leadership.",
      recs: ["R18", "R2", "R13"]
    },

    // Tier 2 — Monetization & Margin Improvement
    {
      id: "monetization_capture_gap",
      tier: 2,
      when: (a) => (a.RA5 <= 2 && a.GE5 >= 3),
      diagnosis: "Volume and pipeline quality are present, but revenue is not keeping up. The gap between volume growth and revenue growth points to a pricing design or packaging problem — not a sales problem.",
      recs: ["R1", "R3", "R2"]
    },
    {
      id: "pricing_leakage_controls_weak",
      tier: 2,
      when: (a) => (a.MC6 <= 2 || a.GO2 <= 2),
      diagnosis: "Discounting and override controls are inconsistent. The result is silent, deal-by-deal margin leakage that accumulates across the book without appearing in any single report.",
      recs: ["R2", "R18", "R13"]
    },
    {
      id: "exceptions_material_not_crisis",
      tier: 2,
      when: (a) => (a.MC2 <= 3 && a.MC2 >= 2),
      diagnosis: "Exception and repair volume is a meaningful but addressable margin drag. At current rates, the repair burden is also creating client experience friction that may be contributing to attrition.",
      recs: ["R6", "R10", "R7"]
    },
    {
      id: "unit_cost_immature",
      tier: 2,
      when: (a) => (a.MC4 <= 2 || a.RA3 <= 2),
      diagnosis: "Unit cost and rail-level economics are not being tracked or used. Without a cost anchor, pricing floors are arbitrary and roadmap investment decisions lack the discipline to optimize returns.",
      recs: ["R8", "R20", "R19"]
    },
    {
      id: "cadence_weak_not_absent",
      tier: 2,
      when: (a) => (a.GO3 === 2 || a.GO4 === 2),
      diagnosis: "An operating cadence exists but lacks the executive rhythm and accountability closure needed to drive consistent execution. The forum meets — but actions do not reliably close.",
      recs: ["R19", "R20", "R18"]
    },
    {
      id: "balances_not_monetized",
      tier: 2,
      when: (a) => (a.BL1 <= 2 && a.BL4 <= 2),
      diagnosis: "Balance contribution from payments clients is not being tracked or reflected in pricing. The franchise is generating balance value that is not flowing back into the P&L — a systematic ROE leak.",
      recs: ["R4", "R13", "R19"]
    },
    {
      id: "fx_without_corridor",
      tier: 2,
      when: (a) => (a.MR4 !== null && a.MR4 <= 2 && a.RA6 >= 3),
      diagnosis: "FX-enabled flows are present, but corridor strategy and spread discipline are under-developed. Cross-border volume is flowing without a managed pricing framework — FX margin is leaking.",
      recs: ["R5", "R1", "R19"]
    },
    {
      id: "fx_spread_leakage",
      tier: 2,
      when: (a) => (a.RA6 >= 2 && a.RA6 <= 3 && a.MR4 !== null && a.MR4 <= 3),
      diagnosis: "Cross-border FX flows are active but spread management and corridor economics are not fully operationalized. This is a predictable form of revenue leakage that grows with volume.",
      recs: ["R5", "R17", "R8"]
    },
    {
      id: "rtp_readiness_gap",
      tier: 2,
      when: (a) => (a.MR1 <= 2 && a.GE3 >= 3),
      diagnosis: "Workflow embedding is growing, but limited real-time send capability is constraining the monetizable use cases available to embedded clients. The infrastructure investment is ahead of the commercial capability.",
      recs: ["R15", "R17", "R11"]
    },

    // Tier 3 — Portfolio Risk
    {
      id: "concentration_risk_extreme",
      tier: 3,
      when: (a) => (a.RA4 <= 1),
      diagnosis: "Revenue concentration is elevated. A single client event — loss, repricing, or strategic shift — could create a material P&L impact that would require 12–18 months to recover from.",
      recs: ["R11", "R1", "R18"]
    },
    {
      id: "float_dependency_risk",
      tier: 3,
      when: (a) => (a.RA1 <= 1 && a.BL5 <= 2),
      diagnosis: "Revenue mix is heavily weighted toward balance-driven income, and rate-cycle sensitivity is not measured or managed. A rate decline would hit this franchise harder than peers with a more diversified revenue mix.",
      recs: ["R3", "R4", "R19"]
    },
    {
      id: "rate_cycle_exposure_mature",
      tier: 3,
      when: (a) => (a.BL5 <= 2 && a.BL1 >= 3),
      diagnosis: "Balance contribution is tracked and meaningful, but rate-cycle sensitivity is not yet measured or managed at the segment level. A rate decline will compress NII in ways that are currently unquantified.",
      recs: ["R4", "R3", "R19"]
    },
    {
      id: "rtp_commercial_gap_mature",
      tier: 3,
      when: (a) => (a.MR1 <= 2 && a.GO1 >= 3),
      diagnosis: "The operating model is sound, but real-time send capability is not yet at commercial scale. As embedded clients expect real-time use cases, this gap will become a GTM constraint.",
      recs: ["R15", "R17", "R12"]
    },
    {
      id: "revenue_mix_concentration_mature",
      tier: 3,
      when: (a) => (a.RA1 <= 2 && a.RA5 >= 3),
      diagnosis: "Revenue is growing ahead of volume, but mix concentration remains — one lever dominates the P&L. As the franchise matures, deliberate mix diversification becomes a strategic priority.",
      recs: ["R1", "R3", "R5"]
    }
  ];

  // ── Sub-score mapping ────────────────────────────────────────────────────
  const subScoreMap = {
    monetization: ["revenue_arch", "growth_engine"],
    margin:       ["margin_cost", "governance"],
    readiness:    ["multi_rail", "balance_liquidity"]
  };

  // ── Pillar floor guard ───────────────────────────────────────────────────
  const pillarFloorGuard = {
    threshold: 1.5,
    penalty:   8
  };

  return { pillars, rules, recommendations, subScoreMap, pillarFloorGuard };
})();
