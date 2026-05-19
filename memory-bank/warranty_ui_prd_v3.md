# Warranty Reviewer UI — Product Requirements Document

**Agentic Warranty Claims Engine — POC Sprint**

| | |
|---|---|
| **Owner** | Engineer B (UI) |
| **Sprint** | 6-hour POC — parallel branch: `ui-components` |
| **Stack** | React + Vite, Tailwind CSS, Anthropic SDK |
| **Data source** | `claims.json` + `rules.json` (Engineer A output) |
| **Merge at** | Hour 4 — feature freeze Hour 5 |
| **Status** | Active — in sprint |

---

## 1. Overview

Engineer B owns the complete frontend for the Warranty Reviewer UI — the interface through which a human reviewer sees AI-generated claim summaries, understands why a claim was flagged, and takes action. This is the primary demo surface for the stakeholder presentation. Everything the agents produce must feel clear, trustworthy, and fast inside this UI.

The UI has two main surfaces: the **Claim Queue** (list view) and the **Claim Detail** (review view). A lightweight **Savings Counter** sits persistently across both. These three surfaces tell the complete story of the POC in the demo.

A fourth surface — the **Customer Contest Portal** — covers the end-to-end customer-facing journey from result notification through dispute resolution. This surface demonstrates the full closed-loop intelligence model to Toyota stakeholders.

---

## 2. Goals & non-goals

### Goals

- Reviewers can scan flagged claims at a glance and prioritise by severity
- Clicking a claim surfaces an AI-generated summary and a breakdown of policy violations
- Reviewers can approve, reject, or escalate a claim in one click
- A savings counter updates in real time as reviewers make decisions
- The demo flow through 5 hero claims is smooth and requires no explanation
- Customers can receive plain-language claim decisions and contest them with supporting evidence
- The AI agent re-validates contested claims and either auto-resolves or packages them for specialist review
- Toyota warranty specialists can review contested claims with full AI-generated context and issue a final ruling

### Non-goals for this sprint

- Authentication or user management — not needed for POC
- Persistent backend storage — React state only, no database
- Mobile responsiveness — desktop demo only
- Full anomaly detection dashboard — deferred to Phase 2
- Real Toyota branding or production design polish
- Full customer account management or claims history

---

## 3. Data contract with Engineer A

Engineer B's UI consumes two JSON files output by Engineer A. Do not deviate from this schema — Engineer C's agent functions depend on the same shape.

### `claims.json` — claim object shape

| Field | Type | Used in UI |
|---|---|---|
| `claimId` | string | Claim list row ID, detail header |
| `dealerId` | string | Detail view metadata |
| `vin` | string | Detail view metadata |
| `claimDate` | string | Claim list column, detail metadata |
| `repairCodes` | string[] | Detail — repair code badges |
| `laborHours` | number | Detail — compared against rule threshold |
| `parts` | object[] | Detail — parts table |
| `techNotes` | string | Detail — shown in AI summary panel |
| `claimAmount` | number | Claim list — amount column, savings counter |
| `vehicleMileage` | number | Detail metadata |
| `warrantyType` | string | Detail — warranty badge |
| `groundTruth` | string | Hidden — used for mock agent accuracy only |
| `violationHint` | string | Hidden — used by Engineer C for prompt tuning only |
| `customerEmail` | string | Customer portal — notification delivery (mock only) |
| `contestStatus` | string | `none` / `submitted` / `under_review` / `resolved` |
| `contestReason` | string | Customer-submitted contest reason text |
| `contestEvidence` | string[] | Filenames of supporting documents (mock array) |
| `contestResolution` | string | Final specialist ruling text |

### `rules.json` — policy rule shape

Engineer C's agent will return violation results referencing `ruleId` values from this file. The UI should display the `ruleId` and `message` fields when rendering the flag breakdown in the detail view.

---

## 4. UI surfaces

### 4.1 Claim queue — list view

The default landing view. Shows all claims from `claims.json`, sorted by severity (flagged claims first). Each row gives a reviewer enough information to decide whether to open a claim.

#### Column spec

| Column | Source field | Notes |
|---|---|---|
| Claim ID | `claimId` | Monospaced, links to detail view |
| Date | `claimDate` | Formatted MM/DD/YYYY |
| Dealer | `dealerId` | Plain text |
| Repair | `repairCodes` | First code shown as badge; +N if multiple |
| Amount | `claimAmount` | Right-aligned, formatted as $X,XXX.XX |
| Warranty | `warrantyType` | Pill badge: basic / powertrain / extended |
| Status | agent output | `Clean` / `Flagged` / `Anomaly` — colour-coded |
| Contest | `contestStatus` | Shown only when `contestStatus` is not `none` — amber pill |
| Action | — | Quick approve/reject buttons on hover |

#### Status badge colours

| Status | Colour |
|---|---|
| `Clean` | Blue — `bg-blue-100 text-blue-800` |
| `Flagged` | Red — `bg-red-100 text-red-800` |
| `Anomaly` | Amber — `bg-amber-100 text-amber-800` |
| `Contested` | Orange — `bg-orange-100 text-orange-800` |

#### Filtering and sorting

- Filter bar: **All / Flagged / Anomaly / Clean / Contested** tabs above the table
- Default sort: Flagged and Anomaly claims rise to top, then by `claimAmount` descending; Contested claims surface above Clean
- Search input: filters by `claimId` or `dealerId`

#### Loading state

When agents are processing a claim, the status column shows a spinner with label `Analysing...` — this makes the AI feel live during the demo even if results are pre-computed.

---

### 4.2 Claim detail — review view

Opens when a reviewer clicks any row in the queue. Full-width overlay or page replace. Contains four panels stacked vertically: Claim Metadata, AI Summary, Policy Flags, and Parts Detail.

#### Panel 1 — claim metadata

- Claim ID, dealer, VIN, date, mileage, warranty type displayed as a compact label grid
- Repair code badges across the top
- Claim amount displayed prominently in top-right corner

#### Panel 2 — AI summary _(primary demo moment)_

This is the most important panel in the entire UI. It shows the output of Engineer C's summarization agent — a 3-sentence reviewer narrative with a recommended action.

- Displayed in a visually distinct card with a subtle left border accent
- Recommended action shown as a prominent badge: **Approve** / **Review** / **Reject**
- Confidence indicator (low / medium / high) shown alongside the recommendation
- Technician notes shown below the summary in a collapsible "Source notes" section
- Loading skeleton shown while the agent is running

#### Panel 3 — policy flags

Output of Engineer C's policy validation agent. Shows each rule that was checked and its result.

| Element | Detail |
|---|---|
| Rule ID badge | e.g. `R-01` in monospaced pill |
| Rule description | Plain English from `rules.json` `message` field |
| Result | `PASS` in green / `FAIL` in red |
| Severity | Low / Medium / High badge on failed rules only |
| Empty state | If no flags: "No policy violations detected" in green |

#### Panel 4 — parts detail

Renders the `parts` array from the claim as a simple table.

| Column | Source |
|---|---|
| Part code | `parts[].code` |
| Qty | `parts[].qty` |
| Unit cost | `parts[].unitCost` — formatted as currency |
| Line total | `qty × unitCost` — computed in UI |

#### Action bar — bottom of detail view

| Action | Colour | Behaviour |
|---|---|---|
| **Approve** | Green | Marks claim green, returns to queue |
| **Escalate for review** | Amber | Marks claim amber, returns to queue |
| **Reject** | Red | Increments leakage prevented counter, returns to queue |

Each action: updates the claim status in React state, increments the savings counter if rejected, returns to the queue with the next flagged claim auto-selected.

---

### 4.3 Savings counter — persistent header component

Visible at the top of both the queue and detail views. Updates in real time as the reviewer makes decisions. This is the metric stakeholders will look at first.

| Metric | Calculation |
|---|---|
| Claims reviewed | Count of approve + reject + escalate actions taken |
| Flags caught | Count of claims where `groundTruth` is `violation` or `anomaly` and reviewer rejected |
| Leakage prevented | Sum of `claimAmount` for all rejected flagged claims |
| Accuracy | Flags caught / total flagged claims processed — shown as % |

> **Note:** Leakage prevented and accuracy are illustrative for the POC — they use `groundTruth` labels which would not exist in a real deployment. Make this clear in the demo script.

---

### 4.4 Customer contest portal — new surface

A separate view simulating the customer-facing experience. Accessed via a "Customer view" toggle in the demo header — not part of the normal reviewer flow. This surface exists to show Toyota stakeholders the full closed loop: decision delivered → customer contests → agent re-validates → specialist resolves.

#### Panel 0 — pending review state (pre-decision)

Shown when a claim has been submitted but no reviewer decision has been made yet. This is the default customer experience upon first visiting the portal. Designed to reduce anxiety during the wait period and set clear expectations.

| Element | Detail |
|---|---|
| Status banner | Blue "Claim Under Review" with pulsing "Processing" pill — communicates active work |
| Review progress tracker | 4-step pill indicator: Received ✓ → Verifying Coverage ✓ → Reviewing Details (active, pulsing) → Decision (pending) |
| What we're verifying | Checklist of 4 items the review covers: warranty coverage active, repair codes within guidelines, mileage within limits, diagnostic evidence supports repair |
| Submitted claim details | Recap grid: Reference ID, submission date, VIN, mileage, repair codes, claim amount — so the customer can confirm what's under review |
| What happens next | 3-step numbered guide: (1) Review team completes assessment (2–3 business days), (2) Notification with decision + plain-language explanation, (3) If approved → payment to dealer; if denied → option to contest |
| Support contact | Phone number + reference ID — "Contact Toyota Warranty Support at 1-800-331-4331 with your reference number" |

Emotional design goal: move the customer from **anxious** (submitted, no visibility) → **informed** (clear timeline, visible progress, details confirmed). The progress tracker provides "evidence of service" — proof that work is happening even when the customer is waiting.

Transition: when `decisions[claimId]` becomes non-null, the pending view is replaced by Panel 1 (claim result notification) with full decision details.

#### Panel 1 — claim result notification

Shown when a customer "receives" their claim outcome. Simulates the notification the customer would see via email or a customer portal.

| Element | Detail |
|---|---|
| Decision banner | `Approved` in green / `Partially approved` in amber / `Denied` in red |
| Claim summary | Claim ID, date, vehicle, amount |
| Plain-language explanation | Agent-generated text: what was decided, why, and which policy applied — no legal jargon |
| Policy reference | Rule ID and description cited inline — same source as reviewer's policy flags panel |
| Contest CTA | Prominent "I disagree with this decision" button — visible on Denied and Partially approved outcomes only |

Agent requirement: `generateCustomerExplanation(claim, validation)` — produces a 2–3 sentence plain-language explanation suitable for a non-technical customer. Must cite the specific rule that failed and the threshold that was exceeded.

#### Panel 2 — contest submission form

Shown when the customer clicks the contest CTA.

| Field | Type | Notes |
|---|---|---|
| Reason for contest | Textarea | Required — free text, 500 char max |
| Supporting evidence | File upload (mock) | Simulated — accepts filename strings in the demo |
| Additional context | Textarea | Optional — 300 char max |
| Submit button | — | Triggers agent re-validation pipeline |

On submit: `contestStatus` updates to `submitted` in React state. Agent re-validation begins immediately (simulated async).

#### Panel 3 — contest status tracker

Shown after submission. Gives the customer visibility into where their contest stands.

| Status | Message shown to customer |
|---|---|
| `submitted` | "Your contest has been received. We're reviewing your submission." |
| `under_review` | "Your contest is being reviewed by a warranty specialist." |
| `resolved` | "A decision has been made on your contest. See below." |

Progress indicator (3-step pill tracker) shows the current status visually.

#### Panel 4 — resolution notification

Shown when `contestStatus` is `resolved`.

| Element | Detail |
|---|---|
| Final decision banner | `Overturned` in green / `Upheld` in red / `Partially approved` in amber |
| Specialist ruling | `contestResolution` text — plain language, authored by the Toyota specialist |
| Revised amount (if applicable) | Shown when partial approval changes the payout |
| Case closed notice | "This case is now closed. No further action is required." |

---

### 4.5 Specialist resolution workspace — new surface

The internal Toyota warranty specialist view for handling escalated contests. Accessed via a "Specialist view" toggle in the demo header.

#### Layout

Two-column layout: left column (60%) shows the full claim and contest context; right column (40%) shows the AI resolution brief and action tools.

#### Left column — claim and contest context

| Section | Content |
|---|---|
| Original claim | All metadata and repair detail from the standard claim detail view |
| Original decision | The AI recommendation and policy flags that produced the initial ruling |
| Customer contest | Contest reason, supporting evidence filenames, customer-provided context |

#### Right column — AI resolution brief

The output of `generateResolutionBrief(claim, validation, contest)` — a specialist-focused summary prepared by the agent.

| Element | Detail |
|---|---|
| Contest classification | Why the customer is contesting: `labor_dispute` / `coverage_question` / `documentation_gap` / `other` |
| New evidence assessment | Whether the customer's submission changes the picture — `changes_outcome` / `no_material_change` / `needs_investigation` |
| Precedent cases | 1–2 similar past cases and how they were resolved (mock data) |
| Identified gaps | Any data gaps the agent flagged that the specialist should investigate before ruling |
| Agent recommendation | Suggested outcome: `overturn` / `uphold` / `partial` — with brief rationale |

#### Resolution action bar

| Action | Colour | Behaviour |
|---|---|---|
| **Overturn decision** | Green | Sets `contestResolution`, updates `contestStatus` to `resolved`, notifies customer |
| **Uphold decision** | Red | Sets `contestResolution`, updates `contestStatus` to `resolved`, notifies customer |
| **Partial approval** | Amber | Opens amount input, then resolves with revised figure |
| **Request more info** | Blue | Sets `contestStatus` back to `under_review`, sends message to customer |

Resolution notes field (required before any action): free text, 500 char max. This becomes the `contestResolution` text shown to the customer.

---

## 5. Component tree

| Component | Responsibility |
|---|---|
| `App.jsx` | Root — loads `claims.json`, holds global state, routes between views |
| `SavingsCounter.jsx` | Persistent header strip — reads from global reviewed state |
| `ClaimQueue.jsx` | List view — filter tabs, search, sortable table |
| `ClaimRow.jsx` | Single row — status badge, quick actions on hover |
| `ClaimDetail.jsx` | Detail view — orchestrates four panels + action bar |
| `MetadataPanel.jsx` | Panel 1 — label grid, repair codes, amount |
| `AISummaryPanel.jsx` | Panel 2 — agent summary, recommendation badge, source notes |
| `PolicyFlagsPanel.jsx` | Panel 3 — rule results from validation agent |
| `PartsPanel.jsx` | Panel 4 — parts table with computed totals |
| `ActionBar.jsx` | Approve / Escalate / Reject — updates global state |
| `useAgents.js` | Custom hook — calls Engineer C's agent functions, manages loading state |
| `claimsStore.js` | Module — loads `claims.json`, exposes filtered/sorted selectors |
| `CustomerPortal.jsx` | Customer-facing contest journey — notification, form, tracker, resolution |
| `ContestForm.jsx` | Contest submission form — reason, evidence, context fields |
| `ContestStatusTracker.jsx` | 3-step pill progress indicator for contest status |
| `SpecialistWorkspace.jsx` | Two-column specialist view — claim context + AI brief + action bar |
| `ResolutionBriefPanel.jsx` | Right column of specialist workspace — AI brief, precedents, gaps, recommendation |

---

## 6. State management

React state only — no Redux, no backend. Keep it simple for the 6-hour sprint.

| State key | Type | Owned by |
|---|---|---|
| `claims` | `Claim[]` | `App.jsx` — loaded once from `claims.json` |
| `activeClaimId` | string | `App.jsx` — drives queue selection and detail view |
| `agentResults` | object | `App.jsx` — keyed by `claimId`, populated by `useAgents` hook |
| `decisions` | object | `App.jsx` — keyed by `claimId`: `approve \| reject \| escalate \| null` |
| `filter` | string | `ClaimQueue.jsx` — `all \| flagged \| anomaly \| clean \| contested` |
| `isLoading` | object | `useAgents.js` — keyed by `claimId`, boolean |
| `contestData` | object | `App.jsx` — keyed by `claimId`: `{ status, reason, evidence, resolution }` |
| `activeView` | string | `App.jsx` — `reviewer \| customer \| specialist` — drives demo view toggle |

---

## 7. Agent integration (Engineer C handoff)

Engineer B's UI calls four functions exported from Engineer C's branch. The first two are unchanged from the original contract. The last two are new — required for the customer contest and specialist resolution surfaces.

| Function | Input | Output |
|---|---|---|
| `validateClaim(claim, rules)` | claim object + rules array | `{ results: [{ruleId, passed, severity, message}], overallSeverity }` |
| `summarizeClaim(claim, validation)` | claim + validation output | `{ summary: string, recommendation: 'approve'\|'review'\|'reject', confidence: 'low'\|'medium'\|'high' }` |
| `generateCustomerExplanation(claim, validation)` | claim + validation output | `{ explanation: string, ruleReference: string, contestEligible: boolean }` |
| `generateResolutionBrief(claim, validation, contest)` | claim + validation + contest object | `{ classification: string, evidenceAssessment: string, precedents: object[], gaps: string[], recommendation: string, rationale: string }` |

Wire `validateClaim` and `summarizeClaim` inside `useAgents.js` as before. Wire `generateCustomerExplanation` inside `CustomerPortal.jsx` and `generateResolutionBrief` inside `SpecialistWorkspace.jsx`. All four are async — show appropriate loading states.

---

## 8. Hero claim demo flow

Engineer B owns the demo UI experience. These 5 claims are the entire stakeholder script — design the UI so each one tells its story clearly without narration.

| Claim | Story | What the UI must show |
|---|---|---|
| `CLM-00001` | Clean — system working smoothly | Green status, approve recommendation, all rules passed |
| `CLM-00002` | Labor hours 4× over limit — clear catch | Red FAIL on R-01, high severity badge, reject recommendation |
| `CLM-00003` | Out-of-warranty mileage — human would miss | Red FAIL on R-06, amount looks reasonable so flag is surprising |
| `CLM-00004` | Dealer pattern anomaly | Anomaly badge, summary explains the statistical pattern |
| `CLM-00005` | Borderline — unverified ECM diagnosis — **also the contest demo claim** | Medium severity, escalate recommendation, R-10 explanation visible; in customer view, customer contests with additional diagnostic report; specialist overturns after reviewing AI brief |

`CLM-00005` is the only claim that should flow through all four views in the demo — reviewer escalates it, customer contests it, agent re-validates, specialist overturns.

---

## 9. Sprint timeline — Engineer B

| Time | Task |
|---|---|
| Min 0–30 | Lock schema with Engineers A and C. Scaffold React + Vite. Install Tailwind. Create component files as empty stubs. |
| Hr 0–2 | Build `ClaimQueue` and `ClaimRow` with mock data stubs. Implement filter tabs and sort logic. Status badges working. |
| Hr 2–4 | Build `ClaimDetail` with all four panels. Wire `AISummaryPanel` and `PolicyFlagsPanel` to mock agent output shapes. Build `ActionBar` and `SavingsCounter`. |
| Hr 4 | Merge to main. Replace mock stubs with Engineer A real data. Wire `useAgents.js` to Engineer C functions. |
| Hr 4–5 | Integration testing. Fix shape mismatches. Confirm hero claims render correctly end to end. Build `CustomerPortal.jsx` and `SpecialistWorkspace.jsx` with mock contest data for `CLM-00005`. Wire `generateCustomerExplanation` and `generateResolutionBrief`. |
| Hr 5–6 | Demo polish. Confirm loading states work. Confirm view toggle between reviewer / customer / specialist works cleanly. Rehearse full demo flow — including the `CLM-00005` contest arc — twice. |

---

## 10. Acceptance criteria

The UI is considered complete when all of the following pass:

**Reviewer surface**

- [ ] Claim queue loads all 55 claims from `claims.json` without errors
- [ ] Flagged and Anomaly claims sort above clean claims by default
- [ ] Filter tabs correctly show only claims matching the selected `groundTruth`; Escalated tab shows escalated claims
- [ ] Clicking any claim opens the detail view without page refresh
- [ ] AI summary panel shows a loading state while agents are running
- [ ] AI summary cites specific numbers and thresholds — not vague adjectives (Design principle 1)
- [ ] Policy flags panel renders pass/fail per rule with correct severity badges
- [ ] Approve action marks the claim green and returns to queue
- [ ] Reject action increments leakage prevented in the savings counter
- [ ] Escalate action marks the claim with an amber badge
- [ ] After any decision, next flagged/anomaly claim auto-selects (tight loop, no friction)
- [ ] All 5 hero claims tell their story clearly without verbal explanation
- [ ] Savings counter updates correctly after each reviewer decision
- [ ] `Analysing...` spinner visible on claim rows while agents are processing

**Customer portal surface**

- [ ] Pending state shows progress tracker, claim details recap, verification checklist, timeline, and support contact when no decision exists
- [ ] Pending state transitions to decision view when `decisions[claimId]` becomes non-null
- [ ] Claim result notification renders plain-language explanation for `CLM-00005`
- [ ] Explanation cites specific thresholds and amounts — not policy boilerplate (Design principle 1)
- [ ] Contest CTA visible and prominent when claim is Denied or Partially approved (Design principle 6)
- [ ] Contest form accepts reason text and mock evidence filenames
- [ ] `contestStatus` updates to `submitted` immediately on form submit
- [ ] Status tracker shows correct step highlight for each `contestStatus` value
- [ ] Status tracker messaging explains what's happening at each step (not just status labels)
- [ ] Resolution panel renders when `contestStatus` is `resolved`
- [ ] Both overturn AND uphold resolutions include plain-language explanation (Design principle 5)
- [ ] Agent-generated explanation is readable without any warranty domain knowledge

**Specialist workspace surface**

- [ ] Workspace loads `CLM-00005` with full claim detail and contest context in left column
- [ ] AI resolution brief renders with classification, evidence assessment, precedents, gaps, and recommendation in right column
- [ ] AI brief is positioned as research prep — not as a pre-made decision (Design principle 2)
- [ ] Resolution notes field is required before any action button activates
- [ ] "Notes required" helper text visible when notes field is empty
- [ ] Overturn action sets `contestResolution` and updates status to `resolved`
- [ ] Resolved status reflects in the customer portal view immediately (same React state)
- [ ] All context visible in one surface — no switching between tools required (Design principle 4)

---

## Appendix — Tailwind class conventions

Use these Tailwind classes consistently across components to maintain visual coherence.

| Element | Tailwind classes |
|---|---|
| Page background | `bg-gray-50 min-h-screen` |
| Card surface | `bg-white border border-gray-200 rounded-xl p-5` |
| Clean badge | `bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full` |
| Flagged badge | `bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full` |
| Anomaly badge | `bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full` |
| Contested badge | `bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full` |
| Approve button | `bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-lg font-medium` |
| Reject button | `bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-lg font-medium` |
| Escalate button | `bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-4 py-2 rounded-lg font-medium` |
| Overturn button | `bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-lg font-medium` |
| Uphold button | `bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-lg font-medium` |
| AI summary card | `bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl` |
| Resolution brief card | `bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-xl` |
| Customer explanation card | `bg-gray-50 border border-gray-200 rounded-xl p-5 text-base leading-relaxed` |
| Rule PASS | `text-green-600 font-medium` |
| Rule FAIL | `text-red-600 font-medium` |
| Table header | `bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wide` |
| Savings counter | `bg-white border-b border-gray-200 px-6 py-3 flex gap-8 items-center` |
| Contest status pill (active) | `bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full` |
| Contest status pill (inactive) | `bg-gray-100 text-gray-400 text-xs font-medium px-3 py-1 rounded-full` |

---

## 11. User journeys

### Personas

#### The Warranty Analyst (primary user)

> "I need to know *why* it was flagged, not just *that* it was flagged. Give me that and I can move fast."

A mid-senior Toyota operations employee who owns warranty claims end to end — from first-pass queue review through to contested claim resolution. They are the decision-maker. The AI is their preparation layer. They currently work through a manual queue, reading raw repair orders and cross-referencing policy rules in a separate document. Accurate but slow.

**How they use the product — 3-touch lifecycle:**

1. **First-pass review** — Opens the queue, sees flagged claims sorted to top. Reads AI narrative; if specific and citing exact thresholds, they decide in seconds. Clicks Reject/Approve/Escalate. Counter increments. Moves on.
2. **Escalation return** — A claim they previously escalated comes back. The claim detail shows the timeline so they can see what they decided and why. The AI brief updates if anything changed.
3. **Contest resolution** — A claim they rejected is contested. The resolution brief shows exactly what is new: customer evidence, re-validation results, how the picture changed. They enter ruling notes and close the case.

**What builds trust:**
- Specificity in the AI narrative — "8.5 labor hours against a 2.0-hour policy limit — a 325% overage" earns trust. "Labor hours appear elevated" does not.
- Explainability at every step — recommendation badge + confidence level + per-rule breakdown
- Stable UI across claim states — one surface that adapts, not two interfaces to learn
- Final authority is unambiguous — the brief is a prepared dossier, not a pre-made decision

**What erodes trust:**
- Vague or hedged narrative output that requires going back to raw data
- The amber "Unable to analyse" state appearing unpredictably
- Any design pattern implying the AI recommendation IS the decision rather than an input to their decision

**Key metrics:** Claims reviewed per session · decision accuracy · time to clear contested queue

**Touchpoints:** `ClaimQueue` · `ClaimDetail` · `AISummaryPanel` · `PolicyFlagsPanel` · `ActionBar` · `ResolutionBriefPanel` · `SavingsCounter`

---

#### The Claims Operations Manager

> "I don't need to open every claim. I need to know if the system is catching what it should — and I need a number I can take upstairs."

A senior Toyota operations leader accountable for leakage metrics, throughput rates, and escalation volumes. Not in the queue all day — in the queue when something looks wrong, when they need to report results, or when evaluating system performance. Thinks in patterns, not individual cases. A single fraudulent claim is an analyst's problem; a dealer submitting 14 ECM claims in 30 days against a regional average of 2 is their problem.

**How they use the product:**
- **Morning queue review** — Checks savings counter totals. Leakage prevented and accuracy % tell them at a glance whether the overnight batch processed cleanly.
- **Anomaly investigation** — Filters to Anomaly tab. Amber-badged claims visible; dealer IDs clustered. Clicks into a pattern anomaly — AI brief explains the statistical signal in plain language, not a score.
- **Reporting** — Pulls savings counter metrics to build leadership reports. Numbers already there; no export needed.

**What builds trust:**
- Pattern-level language in the anomaly brief — "This dealer has submitted 14 ECM-related claims in 30 days against a regional average of 2" is actionable. A fraud score is not.
- Live metrics always visible — savings counter on every view, updating in real time
- Anomaly detection beyond the rules engine — claims that passed all rules but the agent still flagged

**What erodes trust:**
- Accuracy % dropping without explanation
- Anomaly flags that turn out to be false positives at high rates
- Metrics that don't match what they can independently verify

**Key metrics:** Leakage prevented ($) · flags caught vs. total (accuracy %) · anomaly detection rate · escalation rate

**Touchpoints:** `SavingsCounter` · `ClaimQueue` (Anomaly tab) · `AISummaryPanel` (pattern narrative) · `ClaimDetail` (drill-in only)

---

#### The Customer

> "I just need to understand why my claim was denied. And if I think they got it wrong, I want a real way to push back."

A Toyota vehicle owner who submitted a warranty claim through a dealer. Not a warranty expert. Does not know what R-10 means. Their relationship with Toyota is long-term — a denial that feels arbitrary doesn't just close a claim; it affects how they feel about the brand.

**How they use the product — 4-touch lifecycle:**

1. **Waiting for a result** — Checks the portal. Sees their claim is under review with a progress tracker, details recap, and timeline expectation. Feels informed rather than ignored.
2. **Receiving the result** — Reads the decision notification. The plain-language explanation names the specific rule and threshold. Not "your claim did not meet policy requirements" but "your claim submitted 8.5 labor hours for this repair; the policy limit is 2.0 hours."
3. **Contesting the decision** — Clicks "I disagree." Submits reason + evidence. Sees immediate confirmation. Status tracker advances.
4. **Receiving the resolution** — Tracker lands on resolved. Resolution panel shows outcome alongside specialist's plain-language ruling. Case closed with an explanation regardless of outcome.

**What builds trust:**
- Specific language, not policy boilerplate — must cite the actual numbers (labor hours, mileage, specific threshold)
- A contest path that feels real — "I disagree" button visible without hunting, simple form, immediate confirmation
- Status visibility during the wait — the tracker is the only thing between "heard nothing" and "I know where my case is"
- A final ruling that explains itself — even upheld decisions come with plain-language explanation of why new evidence didn't change the outcome

**What erodes trust:**
- Explanation language requiring policy knowledge to interpret
- Contest CTA that is hard to find or visually de-emphasised
- Status tracker not advancing, or advancing to "resolved" before ruling text is available
- Overturned decision with no explanation of what changed

**Key metrics (from Toyota's perspective):** Contest submission rate · resolution time · overturn rate · explanation completeness

**Touchpoints:** `CustomerPortal` · `ContestForm` · `ContestStatusTracker` · resolution notification panel

---

#### The Warranty Specialist

> "I need all the context in one place so I can make a ruling. Don't tell me what to decide — tell me what's changed."

A senior Toyota employee who handles escalated contests. Deep policy knowledge built over years. Does not want to be second-guessed by AI but will accept AI-generated context that saves research time. Final decision authority always rests with them — the product must make this unambiguous.

**How they use the product:**
- Opens specialist workspace when a contested claim lands in their queue
- Reads left column (original claim + AI decision + contest details) to build context
- Reads right column (AI resolution brief) for classification, evidence assessment, precedents, gaps
- Enters resolution notes (required) and issues ruling

**What builds trust:**
- All context in one surface — no switching between tools or looking up the original claim separately
- AI brief positioned as research assistant output, not recommendation to rubber-stamp
- Precedent citations that are specific and verifiable
- Required notes field — makes the audit trail their own words, not AI-generated

**What erodes trust:**
- AI recommendation that feels presumptuous or overconfident
- Missing context that forces them to dig elsewhere
- Resolution pathway that feels like a checkbox exercise rather than a real judgment

**Key metrics:** Resolution time · overturn/uphold ratio · audit trail completeness

**Touchpoints:** `SpecialistWorkspace` · `ResolutionBriefPanel` · resolution action bar

---

### Persona comparison

| | Warranty Analyst | Ops Manager | Customer | Specialist |
|---|---|---|---|---|
| **Primary goal** | Close claims accurately and fast | Detect leakage patterns and report results | Understand the decision and contest if needed | Review contested claims with full context and rule fairly |
| **Primary surface** | Claim queue + claim detail | Anomaly tab + savings counter | Customer portal | Specialist workspace |
| **Relationship with AI** | Trusts when specific; verifies before acting | Trusts patterns; sceptical of individual scores | Unaware of AI; experiences only the output | Accepts as research prep; final call is theirs |
| **Decision authority** | Full — Approve / Escalate / Reject | None — observes and assigns | None — submits and waits | Full — Overturn / Uphold / Partial |
| **Trust built by** | Specificity, explainability, stable UI | Pattern language, live metrics, anomaly precision | Plain language, contest visibility, tracker accuracy | Complete context, positioned as assistant not authority |
| **Trust broken by** | Vague output, unpredictable errors | High false positive rate, metric inconsistency | Boilerplate denials, no response, unexplained rulings | Presumptuous recommendations, missing context |
| **Volume of interaction** | High — daily, all-day queue work | Low to medium — monitoring | One-time or rare — per claim lifecycle | Low — escalated contests only |

---

### Design principles derived from personas

These principles should be applied across all surfaces. They are not aspirational — they are acceptance criteria.

| # | Principle | Rationale | Applies to |
|---|---|---|---|
| 1 | **Cite numbers, not adjectives** | The analyst trusts "325% overage" but not "elevated." The customer trusts "$1,240 against a $380 limit" but not "exceeded policy." | `AISummaryPanel`, `PolicyFlagsPanel`, `CustomerPortal` |
| 2 | **AI prepares; human decides** | Every surface must position AI output as input to a decision, never as the decision itself. Recommendation badges are suggestions; action buttons are authority. | `ActionBar`, `SpecialistWorkspace`, `ResolutionBriefPanel` |
| 3 | **Status must always be visible and accurate** | The customer's trust depends entirely on the tracker advancing. The manager's trust depends on the counter being live. Stale state destroys confidence. | `ContestStatusTracker`, `SavingsCounter`, `ClaimRow` status badges |
| 4 | **One surface adapts; not multiple to learn** | The analyst touches the same claim at 3 lifecycle points. The layout should stay consistent — only the action bar and available context should change based on claim state. | `ClaimDetail`, `ActionBar`, overall layout |
| 5 | **Silence is the worst outcome** | Every state must show something — pending shows progress, errors show fallback guidance, empty queues show confirmation. No blank screens, no unexplained waits. | `CustomerPortal` pending state, `AISummaryPanel` error state, `ClaimQueue` empty state |
| 6 | **Contest path must feel real, not buried** | The "I disagree" CTA must be prominent, not tucked into small text. The form must be simple. Confirmation must be immediate. | `CustomerPortal`, `ContestForm` |

---

### Journey 1 — Complex claim review (Warranty reviewer)

**Proves:** Reviewer productivity

| Stage | What happens | What the reviewer sees | Reviewer feeling | Component |
|---|---|---|---|---|
| App loads | App fetches `claims.json` and `rules.json`. Agent functions pre-run against all 5 hero claims in the background. | Claim queue appears immediately. `Analysing...` spinner on hero claim rows resolves within seconds. | Neutral — the tool feels fast and ready. | `App.jsx`, `useAgents.js`, `claimsStore.js` |
| Claim queue scan | Reviewer lands on the queue. Flagged and Anomaly claims are sorted to the top by default. | Colour-coded status badges. Red `Flagged` and amber `Anomaly` rows dominate the top. Savings counter shows zeros. | Oriented — understands immediately which claims need attention. | `ClaimQueue.jsx`, `ClaimRow.jsx`, `SavingsCounter.jsx` |
| Open a claim | Reviewer clicks a flagged row. Detail view opens. Metadata renders instantly. | Claim ID, dealer, VIN, date, mileage, warranty type, repair codes, and amount at a glance. Blue skeleton pulses in the summary panel. | Engaged — loading state signals something real is happening. | `ClaimDetail.jsx`, `MetadataPanel.jsx`, `AISummaryPanel.jsx` |
| Read AI summary | Summarization agent output renders. 3-sentence narrative with a recommended action. | e.g. _"This claim for brake pad replacement (B2799) submits 8.5 labor hours against a policy limit of 2.0 hours — a 325% overage. The technician notes do not explain the extended labor time. Recommend rejection."_ Reject badge in red. High confidence. | Informed — the summary gives enough to decide without reading the raw claim. | `AISummaryPanel.jsx` |
| Review policy flags | Policy flags panel shows each rule checked with PASS/FAIL. | e.g. `R-01` — FAIL — High — _"Labor hours for brake pad replacement (B2799) must not exceed 2.0 hrs."_ | Confident — specific rule citation removes ambiguity. | `PolicyFlagsPanel.jsx` |
| Check parts detail | Reviewer optionally scrolls to verify the raw data. | Part codes, quantities, unit costs, and computed line totals. | Reassured — underlying data is visible and not hidden behind AI output. | `PartsPanel.jsx` |
| Make a decision | Reviewer takes one of three actions from the action bar. | Approve / Escalate / Reject buttons. Counter updates immediately on action. | Productive — one decision flows directly into the next. | `ActionBar.jsx`, `SavingsCounter.jsx` |
| Return to queue | After any action, UI returns to queue. Next flagged claim is auto-selected. | Queue with decided claim showing its updated status badge. Savings counter incremented. | Productive — tight loop, no friction. | `ClaimQueue.jsx`, `App.jsx` |

**Happy path:**
```
App loads → claims sorted by severity → reviewer opens flagged claim
→ reads AI summary → checks policy flags → rejects claim
→ leakage counter increments → next claim auto-selected → repeat
```

---

### Journey 2 — Leakage detection in auto-approved claims (Claims operations manager)

**Proves:** Leakage detection and anomaly flagging

| Stage | What happens | What the manager sees | Manager feeling | Component |
|---|---|---|---|---|
| Queue overview | Manager opens the queue. Sees the aggregate picture before drilling into any claim. | Savings counter shows totals across all reviewer decisions. Contested badge visible on any claims with active disputes. | Oriented — the metric headline is visible without opening anything. | `SavingsCounter.jsx`, `ClaimQueue.jsx` |
| Filter to anomalies | Manager selects the `Anomaly` tab. | Only anomaly-flagged claims visible. Dealer IDs visible at a glance — patterns emerge. | Analytical — can see dealer-level clustering without a separate report. | `ClaimQueue.jsx` |
| Open an anomaly claim | Manager clicks `CLM-00004` — the dealer pattern anomaly. | AI summary explains the statistical pattern in plain language. Policy flags show rule passed but anomaly agent fired. | Informed — understands why this wasn't a simple rule catch. | `AISummaryPanel.jsx`, `PolicyFlagsPanel.jsx` |
| Review leakage metrics | After a batch of claims is decided, manager checks the counter. | Leakage prevented total, flags caught count, and accuracy %. | Accountable — has the numbers to report upward. | `SavingsCounter.jsx` |

---

### Journey 3 — High-value claim escalation (Both roles)

**Proves:** Escalation routing and human-in-the-loop governance

| Stage | What happens | What the user sees | Feeling | Component |
|---|---|---|---|---|
| High-risk claim surfaces | A high-value or ambiguous claim appears in the queue. Anomaly or Flagged badge. | Claim sorted near the top by severity and amount. | Alert — the flag is hard to miss. | `ClaimQueue.jsx`, `ClaimRow.jsx` |
| AI summary recommends escalation | Reviewer opens the claim. Summary recommends `Escalate`. | `Review` badge in amber. Medium confidence. R-10 explanation visible in policy flags. | Uncertain but supported — AI has named the ambiguity clearly. | `AISummaryPanel.jsx`, `PolicyFlagsPanel.jsx` |
| Reviewer escalates | Reviewer clicks `Escalate for review`. | Claim status updates to amber. Savings counter increments `Claims reviewed`. | Decisive — made the right call efficiently without second-guessing. | `ActionBar.jsx`, `SavingsCounter.jsx` |
| Manager sees escalation queue | Manager filters to escalated claims. | Contested and escalated claims visible together. Amount and severity visible without opening. | In control — knows which items are waiting for senior judgment. | `ClaimQueue.jsx` |
| Audit trail visible | Either role re-opens the decided claim. | Status badge reflects prior decision. Action bar still available. AI summary and flags unchanged. | Confident — the record is traceable and revisable. | `ClaimDetail.jsx`, `ActionBar.jsx` |

---

### Journey 4 — Customer claim result, contest, and resolution (Customer + Specialist)

**Proves:** Closed-loop intelligence — from customer notification through AI-assisted human resolution

This journey is demonstrated using `CLM-00005` with the demo view toggle switching between customer view and specialist view.

#### Phase 1 — Claim result delivered (Customer)

| Stage | What happens | What the customer sees | Customer feeling | Component |
|---|---|---|---|---|
| Result notification | Customer receives their claim outcome. Agent generates a plain-language explanation. | Decision banner (Denied / Partially approved / Approved). 2–3 sentence explanation citing the specific policy rule that failed and the threshold exceeded. | Informed — understands the decision without needing to know warranty policy. | `CustomerPortal.jsx`, `ContestNotificationPanel.jsx` |
| Decision review | Customer reads the explanation. Decides whether to accept or contest. | "I disagree with this decision" button visible for Denied and Partially approved outcomes. | Heard — has a clear and accessible path to push back. | `CustomerPortal.jsx` |
| Accepts | Customer is satisfied and takes no action. | No further prompts. Case treated as closed. | Resolved. | — |

#### Phase 2 — Contest submitted (Customer)

| Stage | What happens | What the customer sees | Customer feeling | Component |
|---|---|---|---|---|
| Contest form opens | Customer clicks the contest CTA. | Form with reason textarea, mock file upload, and optional context field. | Empowered — the form is simple and doesn't require documentation of every detail. | `ContestForm.jsx` |
| Customer submits | Customer enters reason and any supporting evidence. Clicks submit. | Immediate status update: "Your contest has been received." Step 1 of progress tracker highlighted. | Acknowledged — confirmation is immediate, not "we'll get back to you." | `ContestForm.jsx`, `ContestStatusTracker.jsx` |
| Agent re-validates | Agent parses the contest reason, re-runs policy validation with any new evidence, and classifies the contest type. | Status tracker advances to step 2: "Your contest is being reviewed." | Waiting but informed — knows the process has moved forward. | `useAgents.js`, `ContestStatusTracker.jsx` |

#### Phase 3 — Specialist resolution (Toyota warranty specialist)

| Stage | What happens | What the specialist sees | Specialist feeling | Component |
|---|---|---|---|---|
| Contest package received | Specialist opens the claim in the specialist workspace. | Left column: full original claim, original AI decision, customer contest reason and evidence. Right column: AI resolution brief. | Prepared — has all context in one place before making a judgment. | `SpecialistWorkspace.jsx` |
| AI brief reviewed | Specialist reads the resolution brief. | Contest classification, evidence assessment, 1–2 precedent cases, identified data gaps, and agent recommendation with rationale. | Supported — AI has done the research; specialist makes the call. | `ResolutionBriefPanel.jsx` |
| Specialist decides | Specialist enters resolution notes and selects an outcome. | Overturn / Uphold / Partial approval / Request more info action bar. Notes field required before action activates. | Authoritative — final decision is unambiguously theirs. Audit trail is created. | `SpecialistWorkspace.jsx`, resolution action bar |
| Customer notified | `contestStatus` updates to `resolved`. Customer portal reflects the outcome. | Resolution panel shows final decision banner, specialist ruling text, revised amount if applicable, and "case closed" notice. | Respected — received a human decision with a plain-language explanation. | `CustomerPortal.jsx`, `ContestStatusTracker.jsx` |

**Happy path for CLM-00005:**
```
Reviewer escalates → customer receives denied result → reads plain-language explanation
→ contests with additional diagnostic report → agent re-validates and escalates to specialist
→ specialist reviews AI brief → overturns decision → customer sees "Overturned" in green → case closed
```

#### Edge cases to handle — customer portal

| Scenario | Behaviour |
|---|---|
| Claim pending (no decision yet) | Customer sees "Claim Under Review" with progress tracker, submitted details recap, verification checklist, timeline expectations, and support contact. No contest CTA shown. |
| Agent returns error on re-validation | Status tracker shows "Under review by specialist" — skips auto-resolve path, routes directly to human. |
| Customer submits contest with no evidence | Form accepts — reason text alone is sufficient. Evidence is optional. |
| Specialist requests more info | `contestStatus` reverts to `under_review`. Customer sees "We need a little more information" message with specialist's request text. |
| Contest on an approved claim | Contest CTA not shown. No contest path available for fully approved claims. |
| Specialist upholds original decision | Customer receives plain-language explanation of why the original ruling stands. Case closed with no further action. |

---

### Edge cases — reviewer surface

| Scenario | Behaviour |
|---|---|
| Agent returns an error | `AISummaryPanel` shows "Unable to analyse this claim — review manually" in amber. Action bar still functional. |
| Clean claim opened | Policy flags panel shows "No policy violations detected" in green. Recommendation badge shows Approve. |
| Reviewer reopens a decided claim | Status badge reflects prior decision. Action bar still available to change the decision. |
| All claims reviewed | Queue shows empty state: "All claims reviewed" with final savings counter summary. |
| Contested claim in reviewer queue | Contested badge visible in the Status column. Claim still openable and decidable by reviewer. |

---

_Last updated: May 2025 — Agentic Warranty Claims Engine POC Sprint v3_
