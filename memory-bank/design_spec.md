# Toyota Agentic Warranty Claims Engine
## UI/UX Design Specification — Proof of Concept (POC)
**Audience:** Executive reviewers  
**Stage:** POC — Demonstrating core value to stakeholders, not production build  
**Prepared for:** Toyota Motor North America (TMNA)  
**Source Document:** Slalom Internal Leadership Pitch v1.0 (Confidential)

---

## 1. Product Overview

The Warranty Claims Engine is an AI-powered intervention platform designed to surface leakage, route exceptions, and support human reviewers on high-value and complex warranty claims. This spec covers the **POC-phase UI** — scoped to the minimum set of screens and interactions needed to demonstrate the core value proposition to Toyota executives and decision-makers.

The goal of the POC design is not pixel-perfect production UI. It is to make the concept real enough that stakeholders can viscerally understand the value, greenlight the 90-day pilot, and align on the operating model. Think: high-fidelity mockups of 2–3 key screens, a clickable flow, and a clear visual story.

The tool is **not** a claims submission portal. It is an **intelligence and intervention interface** for the reviewers and executives overseeing the claims adjudication process.

### POC Design Philosophy
> Design for the "aha moment" — the instant a stakeholder sees a flagged claim, reads the AI summary, and understands why this is better than what exists today. Every design decision should serve that moment.

### What the POC Must Prove
1. The AI can surface leakage a human would have missed
2. The review experience is faster and more informed than the current process
3. The system is explainable and auditable — not a black box
4. The value (savings, efficiency) is legible at a glance

---

## 2. Design Principles

These principles are derived directly from the product's core philosophy: *"The future of warranty is not faster processing. It is intelligent intervention."*

### 2.1 Intelligence-Forward, Not Form-Forward
Every screen should lead with AI-generated insight, not data entry fields. Reviewers should arrive at a decision view — not a blank form. Raw claim data is secondary to synthesized context.

### 2.2 Human Judgment at the Center
The AI assists; humans decide. Every AI recommendation must include a visible confidence signal and a clear path to override. Trust is earned through transparency, not hidden behind automation.

### 2.3 Escalation Clarity
The difference between auto-handled and escalated claims must be immediately legible. Reviewers should never have to hunt for why something landed on their desk.

### 2.4 Audit-First Design
Every action — approval, denial, override, escalation — must be loggable and reversible. The UI must make audit trails feel natural, not burdensome.

### 2.5 Density With Clarity
Warranty reviewers are power users. Prioritize information density over simplicity, but never sacrifice scannability. Data-heavy views should be structured around decision-making flow, not alphabetical order or arbitrary groupings.

### 2.6 Brand Alignment
The tool operates within Toyota's enterprise environment. Visual language should feel professional, restrained, and trustworthy — aligned with Toyota's brand values of reliability and precision.

---

## 3. Visual Design Language

### 3.1 Color System

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#EB0A1E` (Toyota Red) | Primary CTAs, key status indicators, alert badges |
| `--primary-dark` | `#B00015` | Hover states on primary actions |
| `--surface-base` | `#0D0D0D` | Dark mode base canvas (executive review mode) |
| `--surface-card` | `#1A1A1A` | Card and panel backgrounds |
| `--surface-raised` | `#242424` | Elevated components (modals, drawers) |
| `--border-subtle` | `#2E2E2E` | Dividers, card borders |
| `--text-primary` | `#FFFFFF` | Headlines, primary body copy |
| `--text-secondary` | `#A0A0A0` | Labels, metadata, captions |
| `--text-muted` | `#5A5A5A` | Disabled, placeholder |
| `--status-risk` | `#EB0A1E` | High-risk flags, anomaly indicators |
| `--status-warning` | `#F59E0B` | Medium-risk, review needed |
| `--status-safe` | `#10B981` | Auto-approved, validated |
| `--status-pending` | `#6366F1` | In-progress, AI processing |
| `--accent-muted` | `#3D1A1D` | Subtle red-tinted backgrounds for risk surfaces |

> **Note:** A light mode variant should be designed for dealer-network and field-ops contexts. The dark mode is optimized for executive dashboards and intensive review sessions.

### 3.2 Typography

#### Toyota Type Family (confirmed font files)

| File | Weight Name | CSS `font-weight` | Use |
|---|---|---|---|
| `Toyota_Type_Black.ttf` | Black | 900 | Hero numbers, giant KPI display values |
| `Toyota_Type_Bold_1.otf` | Bold | 700 | Card titles, table headers, decision button labels |
| `Toyota_Type_Semibold_1.otf` | Semibold | 600 | Section headings, tab labels, status badges |
| `Toyota_Type_Regular.otf` | Regular | 400 | Body copy, descriptions, agent narrative output |
| `Toyota_Type_Book_1.otf` | Book | 350 | Secondary body, metadata, captions |
| `Toyota_Type_Light_1.otf` | Light | 300 | Large display headings, hero callouts |

#### Type Scale

| Role | Font | Weight | Size | Line Height |
|---|---|---|---|---|
| Hero / KPI Value | Toyota Type | Black (900) | 40–56px | 1.0 |
| Display Heading | Toyota Type | Light (300) | 32–40px | 1.1 |
| Section Heading | Toyota Type | Semibold (600) | 20–24px | 1.2 |
| Card Title | Toyota Type | Bold (700) | 15–17px | 1.3 |
| Body | Toyota Type | Regular (400) | 13–15px | 1.5 |
| Label / Caption | Toyota Type | Book (350) | 11–12px | 1.4 |
| Data / Monospaced | `JetBrains Mono` or `IBM Plex Mono` | 400–600 | 12–14px | 1.4 |

> **Monospaced fallback:** Toyota Type has no monospaced variant. Use `JetBrains Mono` for claim IDs, VINs, dollar amounts in data tables, and audit trail timestamps to visually distinguish machine-generated data from human-readable copy.

#### CSS `@font-face` Declaration (for web/HTML prototype)

```css
@font-face {
  font-family: 'Toyota Type';
  src: url('Toyota_Type_Black.ttf') format('truetype');
  font-weight: 900;
}
@font-face {
  font-family: 'Toyota Type';
  src: url('Toyota_Type_Bold_1.otf') format('opentype');
  font-weight: 700;
}
@font-face {
  font-family: 'Toyota Type';
  src: url('Toyota_Type_Semibold_1.otf') format('opentype');
  font-weight: 600;
}
@font-face {
  font-family: 'Toyota Type';
  src: url('Toyota_Type_Regular.otf') format('opentype');
  font-weight: 400;
}
@font-face {
  font-family: 'Toyota Type';
  src: url('Toyota_Type_Book_1.otf') format('opentype');
  font-weight: 350;
}
@font-face {
  font-family: 'Toyota Type';
  src: url('Toyota_Type_Light_1.otf') format('opentype');
  font-weight: 300;
}

:root {
  --font-primary: 'Toyota Type', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace;
}
```

### 3.3 Spacing & Grid

- Base unit: `4px`
- Standard content padding: `24px`
- Card internal padding: `20px`
- Grid: 12-column, `16px` gutters
- Dashboard max-width: `1440px`
- Review panel max-width: `1200px`

### 3.4 Elevation & Depth

Use layered surfaces rather than drop shadows to convey hierarchy:
- **L0** — Page background (`--surface-base`)
- **L1** — Content panels and cards (`--surface-card`)
- **L2** — Modals, side drawers, flyouts (`--surface-raised`)
- **L3** — Tooltips, floating elements (`#2E2E2E` + 1px border)

---

## 4. Core User Roles (Pilot Scope)

### 4.1 Warranty Reviewer
Primary day-to-day user of the review queue and claim detail views. Needs fast access to AI-summarized claim context, override controls, and escalation tools.

### 4.2 Warranty Operations Manager
Monitors team throughput, queue health, and aggregate leakage metrics. Uses dashboard and reporting views. Does not review individual claims in detail.

### 4.3 Executive Sponsor / Observer
Periodically reviews high-level performance metrics, pilot savings tracking, and AI confidence trends. Needs an executive summary view with minimal interaction complexity.

---

## 5. Screen Architecture

### POC Priority Screens (Build These First)
These 3 screens are the minimum required to land the concept with executives. They map directly to the three things stakeholders need to believe: *there's a problem, the AI catches it, the human stays in control.*

```
★ Executive Dashboard             ← "Here's the value" — KPIs, savings, leakage caught
★ Claims Queue                    ← "Here's what the AI flagged" — prioritized worklist
★ Claim Detail View               ← "Here's how it works" — the core aha-moment screen
```

### Full Screen Inventory (Design Later / Reference Only for POC)
```
├── Agent Activity Monitor        ← Real-time orchestration status (ops only)
├── Pilot Metrics Report          ← ROI tracking, savings rate, review throughput
└── Settings / Governance         ← Escalation thresholds, reviewer assignments
```

> **POC Recommendation:** Design all 3 priority screens at high fidelity. Wire them into a clickable prototype (Figma or equivalent). The remaining screens can be low-fidelity or represented as placeholder tiles in the nav to show completeness without over-investing design time pre-pilot approval.

---

## 6. Screen-by-Screen Specifications

### 6.1 Executive Dashboard

**Purpose:** Give pilot sponsors a single-view answer to "Is this working?"

**Key Metrics (above the fold):**

| Metric | Source | Display |
|---|---|---|
| Leakage Prevented (Pilot) | Claims Engine | Large currency figure, trend sparkline |
| Savings Rate on Flagged Claims | Claims Engine | Percentage gauge, vs. target (97%) |
| Claims Auto-Handled | Orchestration Layer | Count + % of total pilot volume |
| Claims Escalated to Human | Escalation Agent | Count, avg. resolution time |
| Active Anomaly Signals | Anomaly Detection Agent | Count, severity breakdown |
| Pilot vs. Target Savings | Finance | Progress bar toward $100M annual target |

**Layout Notes:**
- Top row: 4 KPI cards (large numeric display, secondary label, trend indicator)
- Middle section: Savings trend chart (area chart, 90-day pilot period, weekly resolution)
- Bottom section: Claims volume breakdown by type (stacked bar) + Agent activity summary (small cards per agent with status indicator)
- Sticky header with pilot phase indicator and days remaining

**Interaction:**
- Each KPI card is clickable and drills into the relevant queue or report
- No data entry on this screen — read-only

---

### 6.2 Claims Queue

**Purpose:** The primary worklist for warranty reviewers. Shows only claims that require human attention in the pilot.

**Queue Tabs:**

| Tab | Claims Shown | Agent Source |
|---|---|---|
| High-Risk | Anomaly flags, suspected fraud, dealer outliers | Anomaly Detection Agent |
| Complex Repair | Multi-step repairs, unusual labor/parts combos | Repair Logic Agent |
| Policy Exceptions | Coverage edge cases, out-of-pattern approvals | Policy Validation Agent |
| All Escalated | Combined view of all above | Escalation Agent |

**Table Columns:**

| Column | Description |
|---|---|
| Claim ID | Unique identifier, links to Claim Detail |
| Vehicle / VIN | Model, year, partial VIN |
| Dealer | Dealer name + region |
| Claim Value | Dollar amount |
| Risk Score | AI-generated score, color-coded badge (Red / Amber / Green) |
| Flag Reason | Short label from agent (e.g., "Labor hours anomaly", "Coverage mismatch") |
| AI Confidence | Percentage badge with color encoding |
| Age in Queue | Time since escalation |
| Assignee | Reviewer name or "Unassigned" |
| Status | Pending Review / In Review / Escalated / Resolved |

**Filtering & Sorting:**
- Filter by: Dealer, Claim Value range, Risk Score, Agent source, Date range, Assignee
- Sort by: Claim Value (default desc.), Risk Score, Age in Queue
- Saved filter sets for common workflows

**Bulk Actions (pilot scope):**
- Assign to reviewer
- Mark for supervisor review
- Export selected claims (CSV/PDF)

---

### 6.3 Claim Detail View

**Purpose:** The primary decision-making screen. Presents all AI agent outputs for a single claim in a reviewable, auditable format.

**Layout:** Two-column — left panel (AI context, 65% width) + right panel (decision controls, 35% width)

#### Left Panel: AI Context Sections

**Section A — Claim Summary** *(Claim Summarization Agent)*
- Plain-language narrative of the claim (2–4 sentences)
- Key data points extracted: repair date, mileage, claimed parts, labor hours
- Source citations visible (e.g., "Based on technician note ref: TN-20481 and repair order RO-9923")
- Expand/collapse for full raw technician notes

**Section B — Policy Validation** *(Policy Validation Agent)*
- Coverage status: Covered / Not Covered / Edge Case
- Policy rule matched (displayed as rule reference + plain-language explanation)
- Historical pattern: "This repair type was approved in 87% of similar claims in the past 12 months"
- Flags if any policy conditions are unmet

**Section C — Repair Logic Analysis** *(Repair Logic Agent)*
- Labor hours: Claimed vs. expected range (with source benchmark)
- Parts usage: Each part with status (Expected / Unusual / Unsupported)
- Complexity assessment: Simple / Standard / Complex / Outlier
- Visual indicator: horizontal bar showing claimed hours vs. normal range

**Section D — Anomaly Signals** *(Anomaly Detection Agent)*
- Signal list: each flag with type, severity, and brief explanation
  - e.g., "Dealer outlier: This dealer's approval rate for this repair type is 34% above network average"
  - e.g., "Repeat pattern: Same technician code submitted 6x this month"
- Dealer risk profile: mini card with dealer's historical anomaly rate
- None detected state: clearly displayed (not hidden or empty)

#### Right Panel: Decision Controls

**Claim Metadata (top)**
- Claim ID, Dealer, VIN, Claim Value, Date submitted

**AI Recommendation (prominent)**
- Recommended action: Approve / Deny / Escalate
- Confidence score with visual gauge
- One-line rationale from orchestration layer

**Decision Buttons**
- `Approve` (green, primary) — with optional note field
- `Deny` (red, requires reason selection from dropdown + optional note)
- `Escalate to Supervisor` (outlined) — with context field
- `Request Additional Info` (ghost) — triggers dealer notification template

**Override Controls**
- If reviewer disagrees with AI recommendation: "Override AI Recommendation" toggle
- On toggle: required reason field (dropdown + free text)
- Override is logged with full context in audit trail

**Audit Trail (bottom of right panel)**
- Chronological list of all actions taken on this claim
- Each entry: timestamp, actor (human or agent name), action, and any attached notes
- Agent actions are clearly labeled (e.g., "Anomaly Detection Agent flagged: Labor outlier — 10:42 AM")

---

### 6.4 Agent Activity Monitor

**Purpose:** Gives operations managers real-time visibility into agent health and orchestration status during the pilot.

**Per-Agent Card (one card per agent):**

| Element | Description |
|---|---|
| Agent Name | e.g., "Repair Logic Agent" |
| Status | Running / Idle / Error (color-coded) |
| Claims Processed (today) | Count |
| Avg. Processing Time | Duration |
| Escalation Rate | % of claims this agent escalated |
| Last Activity | Timestamp |

**System Health Bar (top of screen):**
- Overall orchestration layer status
- Queue depth (claims awaiting processing)
- Error rate (last 24h)

---

### 6.5 Pilot Metrics Report

**Purpose:** Weekly/cumulative ROI tracking for pilot sponsors and Slalom delivery leads.

**Sections:**
- Savings Summary: Leakage prevented, claims reviewed, auto-handled rate
- Agent Performance: Per-agent accuracy, escalation rates, false positive rate (if measurable)
- Reviewer Activity: Claims per reviewer, avg. review time, override rate
- Anomaly Breakdown: Signal types, dealer outlier counts, fraud indicators
- Trend Lines: Week-over-week across all key metrics

**Export:** PDF report (executive brief format) and CSV data export

---

## 7. Component Library (Pilot Scope)

### 7.1 Core Components

| Component | Description |
|---|---|
| `<RiskBadge>` | Color-coded pill: HIGH / MEDIUM / LOW / CLEAR |
| `<AgentCard>` | Standardized card for displaying agent output with source citations |
| `<ConfidenceGauge>` | Circular or linear gauge showing AI confidence % |
| `<ClaimRow>` | Table row component for queue view with all columns |
| `<DecisionButton>` | Approve / Deny / Escalate with icon, color, and loading state |
| `<AuditEntry>` | Single audit trail line item with actor, action, timestamp |
| `<MetricCard>` | KPI display card with value, label, trend indicator |
| `<OverrideToggle>` | Toggle + reason field for human override actions |
| `<AgentStatusDot>` | Inline status indicator (Running / Idle / Error) |
| `<CitationChip>` | Inline reference chip linking to source document/note |
| `<SavingsBar>` | Progress bar tracking savings toward target |
| `<FlagList>` | Structured list of anomaly flags with severity icons |

### 7.2 Design Token Application

All components must consume tokens from Section 3.1. No hardcoded color values. This enables light mode support and Toyota brand compliance updates without component rewrites.

---

## 8. Interaction Patterns

### 8.1 Progressive Disclosure
AI panels in the Claim Detail view default to summary view. Full agent output (raw data, all citations, full reasoning chain) is available on expand. This keeps the default experience clean for experienced reviewers while preserving transparency for audit and oversight.

### 8.2 Inline Confidence
Every AI-generated value or recommendation must display a confidence level inline — never buried in a tooltip or secondary screen. Trust is built through consistent visibility of uncertainty, not hidden behind clean numbers.

### 8.3 Contextual Help
On first use of any AI panel, a one-time tooltip explains what agent generated the content and what data it was grounded in. Dismissible, resurface from `?` icon.

### 8.4 Keyboard-First Review
Power reviewer workflow must be fully keyboard navigable:
- `J` / `K` — next/previous claim in queue
- `A` — Approve
- `D` — Deny
- `E` — Escalate
- `O` — Override mode
- `?` — Keyboard shortcut reference

### 8.5 Empty States
All queue views, agent output panels, and anomaly lists must have meaningful empty states — not blank space. E.g., "No anomaly signals detected. This claim passed all pattern checks." This is critical for reviewer trust: absence of a flag must feel deliberate, not missing.

---

## 9. Responsible AI Design Requirements

These requirements are non-negotiable for pilot launch, derived from the "Enterprise-Safe by Design" section of the source document.

| Requirement | UI Implementation |
|---|---|
| Human-in-the-loop | No claim can be denied or approved without a human action in the UI |
| Explainability | Every AI output must display its source citations and reasoning basis |
| Confidence transparency | All AI recommendations display confidence score and uncertainty signals |
| Override logging | Every override is captured with reason, actor, and timestamp |
| Escalation thresholds visible | Reviewers can see why a claim was escalated (agent + rule that triggered it) |
| Audit-grade trail | Full action history on every claim, including agent actions |
| Prompt injection protection | UI must never display raw LLM outputs without sanitization layer |
| No silent auto-denial | Denials always require human confirmation, never fully automated in pilot |

---

## 10. Pilot Success Metrics (Design-Measurable)

The following metrics should be trackable from UI interaction data during the pilot:

| Metric | How It's Measured |
|---|---|
| Reviewer override rate | % of AI recommendations overridden |
| Avg. time-to-decision | Time from claim open to decision action |
| Escalation resolution time | Time from escalation flag to supervisor action |
| AI confidence vs. accuracy | Compare confidence scores against final reviewer decisions |
| Feature adoption | Which agent panels reviewers expand most (trust signal) |
| Empty state interactions | How often reviewers re-check cleared claims |

---

## 11. Out of Scope for POC

The following are explicitly deferred — do not design these for the POC presentation:

- Dealer-facing portal or submission UI
- Supplier chargeback workflow
- Quality Signal Agent output views (engineering/field ops)
- Agent Activity Monitor (full build)
- Pilot Metrics Report (full build — use a placeholder tile in nav)
- Settings / Governance screen
- Mobile/tablet optimization
- Light mode implementation
- Multi-language support
- Keyboard shortcut navigation
- Integration with Toyota TMNA legacy DMS UI shell
- Real data connectivity — POC uses representative synthetic/anonymized claim data

### POC Deliverables Checklist
- [ ] High-fidelity mockups: Executive Dashboard, Claims Queue, Claim Detail View
- [ ] Clickable prototype connecting all 3 screens
- [ ] Design token file (colors, typography) for handoff
- [ ] Annotated Claim Detail View explaining each agent panel
- [ ] One "before/after" comparison frame showing current state vs. this tool (for executive narrative)

---

## 12. Open Design Questions

Before final design begins, the following need answers from Toyota stakeholders:

1. **Data access:** What is the schema for claim data as it enters the Intake Agent? Field names will determine UI labeling.
2. **Reviewer authority levels:** Can all reviewers approve/deny, or only certain roles? This affects which decision buttons are shown to whom.
3. **Toyota design system:** Does TMNA have an existing internal design system or component library to align with?
4. **Accessibility requirements:** What WCAG level is required for internal enterprise tools at TMNA?
5. **Existing tool context:** What does the current claims review interface look like? Understanding the legacy UX informs transition design.
6. **Escalation thresholds:** What claim value or risk score threshold triggers mandatory supervisor review? Needed to configure the `<OverrideToggle>` logic.
7. **Export formats:** Does the pilot require claims decisions to export back into any legacy system (SAP, Dealer management system)?

---

*Document version: 1.0 — POC scope only. Update to v2.0 when advancing to 90-day pilot design, v3.0 for 12-month scale.*  
*Source: Slalom TMNA Agentic Warranty Claims Engine Internal Pitch v1.0 (Confidential)*
