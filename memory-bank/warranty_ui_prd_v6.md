# Warranty Analyst UI — Product Requirements Document

**Agentic Warranty Claims Engine — POC Sprint**

| | |
|---|---|
| **Owner** | Engineer B (UI) |
| **Version** | v6 — automation model + full persona integration |
| **Sprint** | 6-hour POC — parallel branch: `ui-components` |
| **Stack** | React + Vite, Tailwind CSS, Anthropic SDK |
| **Data source** | `claims.json` + `rules.json` (Engineer A output) |
| **Merge at** | Hour 4 — feature freeze Hour 5 |
| **Status** | Active — in sprint |

---

## 1. Overview

The Warranty Analyst UI is the human layer on top of an automated claims triage engine. The agent handles both ends of the confidence spectrum automatically — clear approvals and clear rejections — without analyst involvement. The analyst only sees what the agent cannot confidently resolve: ambiguous cases, anomaly signals, high-value claims, and customer contests.

This changes the analyst's job fundamentally. They are no longer processing a claim queue. They are exercising judgment on cases that genuinely require it. Every item in their queue is there because the agent decided a human needs to make this call.

The UI serves three personas across five surfaces:

| Surface | Primary persona | Purpose |
|---|---|---|
| **Claim Queue** | Warranty analyst, ops manager | Triage-filtered list — only human-required claims visible by default |
| **Claim Detail + Specialist workspace** | Warranty analyst | Full agent brief, contest context, ruling tools — one surface that adapts |
| **Savings Counter** | Both internal roles | Live automation metrics — agent volume and analyst decisions, two tracks |
| **Customer Contest Portal** | Customer | Decision notification, pending state, contest submission, resolution tracking |
| **Call-in Search** | Warranty analyst | Find any claim by VIN, name, or email when a customer calls |

> The analyst is the same person at every lifecycle moment — first-pass reviewer, escalation decision-maker, and contest resolution specialist. The UI must feel like one coherent tool, not three separate interfaces stitched together.

---

## 2. Personas

### Persona 1 — The Warranty Analyst

> "I need to know *why* it was flagged, not just *that* it was flagged. Give me that and I can move fast."

A mid-senior Toyota operations employee who owns warranty claims end to end — from first-pass queue review through to contested claim resolution. Not a specialist who only sees escalations, and not a rubber stamp on AI output. The decision-maker. The AI is their preparation layer.

They currently work through a manual queue, reading raw repair orders and technician notes, cross-referencing policy rules in a separate document, and making calls largely from pattern recognition built up over years. Accurate but slow. The backlog is always present.

**Three lifecycle moments — one surface:**

1. **First-pass review** — Opens the queue. Flagged and Anomaly claims sorted to top. Reads AI narrative — if specific and citing exact thresholds, decides in seconds. Checks policy flags to confirm. Clicks Reject / Approve / Escalate. Counter increments. Moves on.
2. **Escalation return** — A claim they previously escalated comes back for a final decision. The claim timeline shows what they decided and why. The AI brief updates if anything changed since.
3. **Contest resolution** — A claim they or the agent rejected is contested by the customer. The resolution brief shows exactly what is new: what the customer submitted, what re-validation found, how that changes the picture. Precedents cited, gaps named. They enter ruling notes — required, because those notes become the customer's explanation — and close the case.

**What builds trust:**
- Specificity in the AI narrative: "8.5 labor hours against a 2.0-hour policy limit — a 325% overage" earns trust. "Labor hours appear elevated" does not.
- Explainability at every step: recommendation badge + confidence level + per-rule breakdown means they can always reconstruct the reasoning without relying on the AI being right.
- Stable UI across claim states: one surface that adapts. The action bar changes based on claim state; the layout does not.
- Final authority is unambiguous: the brief reads like a prepared dossier. The action buttons are theirs to press. Nothing should feel like the machine already decided.

**What erodes trust:**
- Vague or hedged narrative output that requires going back to raw data anyway
- The amber "Unable to analyse" state appearing unpredictably mid-session
- Any design pattern that implies the AI recommendation is the decision rather than an input

**Metrics they care about:** Claims reviewed per session · decision accuracy (flags caught vs. false positives) · time to clear contested queue

**Touchpoints:** `ClaimQueue` · `ClaimDetail` · `AISummaryPanel` · `PolicyFlagsPanel` · `ActionBar` · `SpecialistWorkspace` · `ResolutionBriefPanel` · `SavingsCounter` · `CallInSearch`

---

### Persona 2 — The Claims Operations Manager

> "I don't need to open every claim. I need to know if the system is catching what it should — and I need a number I can take upstairs."

A senior Toyota operations leader accountable for leakage metrics, throughput rates, and escalation volumes across the claims function. Not in the queue all day — in the queue when something looks wrong, when they need to report results, or when evaluating whether the system is performing.

Thinks in patterns, not individual cases. A single fraudulent claim is an analyst's problem. A dealer submitting 14 ECM claims in 30 days against a regional average of 2 is their problem.

**How they use the product:**
- **Morning queue review** — Opens app, checks savings counter totals. Leakage prevented and accuracy % tell them at a glance whether the overnight batch processed cleanly. If accuracy has dropped, they drill in.
- **Anomaly investigation** — Filters to Anomaly tab. Amber-badged claims; dealer IDs clustered. Clicks into a pattern anomaly — the AI brief explains the statistical signal in plain language, not a score.
- **Reporting** — Pulls savings counter metrics to build the leadership report. Numbers already there; no export needed for the POC.

**What builds trust:**
- Pattern-level language in the anomaly brief: "This dealer has submitted 14 ECM-related claims in 30 days against a regional average of 2" is actionable. A fraud score is not.
- Live metrics always visible: savings counter on every view, updating in real time as analysts work.
- Anomaly detection beyond the rules engine: claims that passed all rules but the agent still flagged — that is the entire value proposition for this persona.

**What erodes trust:**
- Accuracy % dropping without explanation
- Anomaly flags that turn out to be false positives at high rates — this persona will pull the feature if it creates noise
- Metrics that don't match what they can independently verify in existing reporting

**Metrics they care about:** Leakage prevented ($) · flags caught vs. total flagged (accuracy %) · anomaly detection rate (rules-passed-but-agent-flagged) · escalation rate and resolution time · agent override rate

**Touchpoints:** `SavingsCounter` · `ClaimQueue` (Anomaly tab, All Claims view) · `AISummaryPanel` (pattern narrative) · `ClaimDetail` (drill-in only)

---

### Persona 3 — The Customer

> "I just need to understand why my claim was denied. And if I think they got it wrong, I want a real way to push back."

A Toyota vehicle owner who submitted a warranty claim through a dealer. Not a warranty expert. Does not know what R-10 means. Trusted that their vehicle was covered and is now dealing with the outcome of a process they had no visibility into.

Their relationship with Toyota is long-term. A warranty denial that feels arbitrary or unexplained does not just resolve a single claim — it affects how they feel about the brand.

**Four lifecycle moments:**

1. **Waiting for a result** — Checks the portal. Sees their claim is under review with a progress tracker, details recap, and timeline expectation. Informed rather than ignored.
2. **Receiving the result** — Reads the decision notification. Plain-language explanation names the specific rule and threshold. Not "your claim did not meet policy requirements" but "your claim submitted 8.5 labor hours for this repair; the policy limit is 2.0 hours."
3. **Contesting the decision** — Clicks "I disagree with this decision." Submits reason and supporting evidence. Sees immediate confirmation. Status tracker advances.
4. **Receiving the resolution** — Tracker lands on resolved. Resolution panel shows outcome alongside the analyst's plain-language ruling. Case closed with an explanation they can read, regardless of outcome.

**What builds trust:**
- Specific language, not policy boilerplate: must cite actual numbers — labor hours, mileage, specific threshold
- A contest path that feels real: "I disagree" button visible without hunting, form is simple, confirmation is immediate
- Status visibility during the wait: the tracker is the only thing between "heard nothing" and "I know where my case is." It must advance and be accurate.
- A final ruling that explains itself: even an upheld decision must explain why new evidence didn't change the outcome. Silence is the worst resolution.

**What erodes trust:**
- Explanation language that requires policy knowledge to interpret
- Contest CTA hard to find or visually de-emphasised
- Status tracker not advancing — or advancing to "resolved" before ruling text is available
- Overturned decision with no explanation of what changed

**Metrics (from Toyota's perspective):** Contest submission rate · resolution time · overturn rate · explanation completeness

**Touchpoints:** `CustomerPortal` · `ContestForm` · `ContestStatusTracker` · resolution notification panel

---

### Persona comparison

| | Warranty Analyst | Claims Ops Manager | Customer |
|---|---|---|---|
| Primary goal | Close claims accurately and fast; resolve contests end-to-end | Detect leakage patterns and report results | Understand the decision and contest if needed |
| Primary surface | Claim queue + detail + specialist workspace | Anomaly tab + savings counter | Customer portal |
| Relationship with AI | Trusts when specific; verifies before acting | Trusts patterns; sceptical of individual scores | Unaware of AI; experiences only the output |
| Decision authority | Full — Approve / Escalate / Reject / Overturn / Uphold | None — observes and assigns | None — submits and waits |
| Trust built by | Specificity, explainability, stable UI, unambiguous authority | Pattern language, live metrics, anomaly precision | Plain language, contest visibility, tracker accuracy |
| Trust broken by | Vague output, unpredictable errors, AI as decision-maker | High false positive rate, metric inconsistency | Boilerplate denials, no response, unexplained rulings |
| Volume | High — daily, all-day queue work | Low to medium — monitoring and spot checks | One-time or rare — per claim lifecycle |

---

## 3. Design principles

These are derived directly from the persona needs above. They are not aspirational — they are acceptance criteria. Every surface must satisfy them before it ships.

| # | Principle | Rationale | Applies to |
|---|---|---|---|
| 1 | Cite numbers, not adjectives | The analyst trusts "325% overage" but not "elevated." The customer trusts "$1,240 against a $380 limit" but not "exceeded policy." | `AISummaryPanel`, `PolicyFlagsPanel`, `CustomerPortal` |
| 2 | AI prepares; human decides | Every surface must position AI output as input to a decision, never as the decision itself. Recommendation badges are suggestions; action buttons are authority. | `ActionBar`, `SpecialistWorkspace`, `ResolutionBriefPanel` |
| 3 | Status must always be visible and accurate | Customer trust depends on the tracker advancing. Manager trust depends on the counter being live. Stale state destroys confidence. | `ContestStatusTracker`, `SavingsCounter`, `ClaimRow` status badges |
| 4 | One surface adapts; not multiple to learn | The analyst touches the same claim at 3 lifecycle points. Layout stays consistent — only the action bar and available context change by claim state. | `ClaimDetail`, `ActionBar`, `SpecialistWorkspace`, overall layout |
| 5 | Silence is the worst outcome | Every state must show something — pending shows progress, errors show fallback guidance, empty queues show confirmation. No blank screens. | `CustomerPortal` pending state, `AISummaryPanel` error state, `ClaimQueue` empty state |
| 6 | Contest path must feel real, not buried | The "I disagree" CTA must be prominent. The form must be simple. Confirmation must be immediate. | `CustomerPortal`, `ContestForm` |

---

## 4. Automation model

This section governs what reaches the analyst queue. The routing logic lives in `claimsStore.js` and is non-negotiable — it drives the entire demo narrative.

### Triage posture

| Path | Condition | Agent action | Analyst involvement |
|---|---|---|---|
| Auto-approve | All rules pass · High confidence · No anomaly signal · Below value threshold | Agent approves, no customer notification | None |
| Auto-reject | High-confidence rule failure · Threshold clearly breached | Agent rejects, triggers `generateCustomerExplanation()`, sends plain-language denial | None — unless customer contests |
| Analyst queue | Medium confidence · Borderline threshold · Single rule at limit | Agent escalates with full brief and recommendation | Required — analyst decides |
| Analyst queue | Anomaly signal — rules passed but statistical pattern suspicious | Agent escalates with anomaly brief | Required — always |
| Analyst queue | High-value claim above dollar threshold | Agent escalates regardless of confidence | Required — always |
| Analyst queue | Customer has contested any decision | Agent re-validates, builds resolution brief, routes to analyst | Required — always |

### Hard override triggers

These three conditions force human review regardless of agent confidence. Enforced in routing logic, not just surfaced in the UI.

1. High-value — `claimAmount >= HIGH_VALUE_THRESHOLD`
2. Anomaly — `agentResults[id].anomalySignal === true`
3. Contested — `contestStatus !== 'none'`

### What the analyst never sees

Auto-approved and auto-rejected claims do not appear in the analyst queue unless a hard trigger fires. The queue is a filtered view — not the full claims list.

> Demo exception: the savings counter and "All claims" tab show auto-handled volume so stakeholders can see the scale of what the agent is processing independently.

---

## 5. Data contract with Engineer A

### `claims.json` — claim object shape

| Field | Type | Used in UI |
|---|---|---|
| `claimId` | string | Queue row ID, detail header, search |
| `dealerId` | string | Detail metadata, dealer context |
| `vin` | string | Detail metadata, call-in search |
| `claimDate` | string | Queue column, detail metadata, timeline |
| `repairCodes` | string[] | Detail — repair code badges |
| `laborHours` | number | Detail — compared against rule threshold |
| `parts` | object[] | Detail — parts table |
| `techNotes` | string | Detail — shown in AI brief source notes |
| `claimAmount` | number | Queue column, savings counter, threshold check |
| `vehicleMileage` | number | Detail metadata |
| `warrantyType` | string | Detail — warranty badge |
| `groundTruth` | string | Hidden — POC accuracy metrics only |
| `violationHint` | string | Hidden — Engineer C prompt tuning only |
| `customerEmail` | string | Search (call-in mode), customer portal |
| `customerName` | string | Search (call-in mode), call-ready brief |
| `automationPath` | string | `auto_approved` / `auto_rejected` / `analyst_queue` — set by pipeline |
| `contestStatus` | string | `none` / `submitted` / `under_review` / `resolved` |
| `contestReason` | string | Resolution workspace — customer contest text |
| `contestEvidence` | string[] | Resolution workspace — supporting document filenames |
| `contestResolution` | string | Customer portal — final ruling text |
| `contestSource` | string | `customer_portal` / `analyst_on_behalf` — audit trail |
| `overrideReason` | string | Audit trail — populated when analyst overrides agent |
| `analystNotes` | string | Call log / interaction history |
| `claimTimeline` | object[] | `[{ timestamp, actor, action, note }]` — full lifecycle history |

### `rules.json` — policy rule shape

Unchanged. Engineer C's agent returns violation results referencing `ruleId` values. UI displays `ruleId` and `message` fields in the policy flags panel.

---

## 6. UI surfaces

### 6.1 Claim queue — analyst-filtered list view

The analyst queue shows only claims that require human judgment. The ops manager uses the "All claims" toggle to see full volume including auto-handled claims.

#### Queue filter logic (enforced in `claimsStore.js`)

```js
showInAnalystQueue(claim) {
  if (claim.automationPath === 'analyst_queue') return true;
  if (claim.claimAmount >= HIGH_VALUE_THRESHOLD) return true;
  if (agentResults[claim.claimId]?.anomalySignal === true) return true;
  if (claim.contestStatus !== 'none') return true;
  return false;
}
```

#### Column spec

| Column | Source | Notes |
|---|---|---|
| Claim ID | `claimId` | Monospaced, links to detail |
| Date | `claimDate` | MM/DD/YYYY |
| Dealer | `dealerId` | Plain text |
| Repair | `repairCodes` | First code as badge; +N if multiple |
| Amount | `claimAmount` | Right-aligned, $X,XXX.XX; high-value pill if above threshold |
| Warranty | `warrantyType` | basic / powertrain / extended |
| Queue reason | derived | Why this claim reached the analyst — see badge spec below |
| Status | agent output | Current pipeline state |
| Action | — | Quick actions on hover |

#### Queue reason badges

Every claim in the analyst queue shows why it's there. A claim can carry multiple reasons — show all that apply as stacked pills.

| Reason | Badge colour | Condition |
|---|---|---|
| Borderline | Amber — `bg-amber-100 text-amber-800` | `automationPath === 'analyst_queue'` + medium confidence |
| Anomaly | Orange — `bg-orange-100 text-orange-800` | `anomalySignal === true` |
| High value | Purple — `bg-purple-100 text-purple-800` | `claimAmount >= HIGH_VALUE_THRESHOLD` |
| Contested | Blue — `bg-blue-100 text-blue-800` | `contestStatus !== 'none'` |

#### Sort order

1. Contested (customer is waiting)
2. Anomaly (highest business value signal)
3. High value (financial exposure)
4. Borderline (by `claimAmount` descending within group)

#### Filter tabs

**My queue / Anomaly / High value / Contested / All claims**

"All claims" is the ops manager view — shows auto-handled volume with a summary counter at the top showing total auto-approved and auto-rejected.

#### Search — dual mode

| Mode | Searches | When used |
|---|---|---|
| Claim search (default) | `claimId`, `dealerId` | Standard queue work |
| Customer call-in | `vin`, `customerEmail`, `customerName` across all claims regardless of `automationPath` | When a customer phones in |

Toggle between modes via a labelled button in the search bar. Call-in mode is visually distinct — the search bar highlights to indicate the analyst is now looking across the full claims dataset, not just their queue.

#### Loading state

Claims without pre-run pipeline results show `Analysing...` with a spinner in the queue reason column when first clicked.

---

### 6.2 Claim detail — single adaptive surface

Per Design Principle 4: one surface that adapts, not multiple to learn. The analyst uses this view at all three lifecycle moments. The content panels are always the same; the claim state banner and action bar change based on where the claim is in its lifecycle.

#### Claim state banner — top of view

A single-line banner above Panel 1. Tells the analyst the claim's automation history and why it's in front of them before they read anything else.

| Claim state | Banner text | Colour |
|---|---|---|
| Borderline escalation | "Agent escalated — medium confidence. Your judgment required." | Amber |
| Anomaly escalation | "Agent flagged anomaly — all rules passed. Statistical signal triggered." | Orange |
| High-value escalation | "High-value claim — above review threshold. Requires human sign-off." | Purple |
| Contested — auto-rejected | "Customer contested auto-rejection. Agent re-validated with new evidence." | Blue |
| Contested — analyst decision | "Customer contested your prior decision. New evidence submitted." | Blue |
| Escalation return | "You previously escalated this claim. A final decision is now required." | Amber |

#### Claim timeline — new panel

Sits between the claim state banner and Panel 1 (metadata). Collapsed by default; expands on click. Shows the full lifecycle of the claim so the analyst can re-orient quickly at any lifecycle moment without re-reading the whole claim.

| Field | Example |
|---|---|
| Timestamp | Apr 14, 2025 · 09:41 |
| Actor | `Agent` / `Analyst` / `Customer` / `System` |
| Action | "Auto-rejected — R-01 FAIL, high confidence" |
| Note | Optional — override reasons, call log entries, escalation context |

#### Panel 1 — claim metadata

Claim ID, dealer, VIN, date, mileage, warranty type as a compact label grid. Repair code badges across the top. Claim amount in the top-right corner. `automationPath` badge shows whether this claim was originally auto-routed or escalated.

#### Panel 2 — AI brief (primary decision surface)

The most important panel. Content adapts by claim state — but the visual structure stays consistent so the analyst always knows where to look.

**For borderline and anomaly escalations:**

| Element | Detail |
|---|---|
| Escalation reason | One sentence: why the agent escalated instead of auto-deciding. Sourced from `escalationReason` field. |
| Narrative | 3-sentence plain-English summary: what the claim is, what was found, what makes it ambiguous. Specificity is required — numbers, thresholds, percentages. |
| Recommendation badge | `Approve` (green) / `Review` (amber) / `Reject` (red) |
| Confidence | `low` / `medium` / `high` |
| Source notes | Collapsible — original technician notes with inline citations |

**For contested claims — resolution mode:**

The AI brief becomes the Case Research Brief. Per Design Principle 2, it is positioned as research prep, not a pre-made decision. Label reads "Case Research Brief · AI-prepared context".

| Element | Detail |
|---|---|
| What's changed | Lead section — plain-language summary of what is different since the original decision. Answers: "Why am I looking at this again?" |
| Original agent reasoning | The exact rule logic and threshold the agent used to make the original decision — shown before the customer's evidence. The analyst is auditing the agent's decision, not just arbitrating. |
| Contest classification | `labor_dispute` / `coverage_question` / `documentation_gap` / `other` |
| Evidence assessment | `changes_outcome` / `no_material_change` / `needs_investigation` |
| Precedents | 1–2 similar past cases with outcome AND similarity rationale (e.g. "same repair code + diagnostic report submitted — overturned in 3 of 4 cases"). Without the rationale, the analyst cannot evaluate whether the precedent is relevant. |
| Identified gaps | Data gaps the agent flagged. Pre-populates the "Request more info" draft message. |
| Analysis summary | Agent's assessment with rationale — ends with "Your decision · Your reasoning" to reinforce analyst authority |

#### Panel 3 — policy flags

Standard rule-by-rule PASS/FAIL output from the validation agent.

If `anomalySignal === true`, a dedicated anomaly signal row appears below the standard rules:

```
⚑  Anomaly signal  ·  [anomalyDescription from agent — plain language pattern explanation]
```

Styled in orange (`bg-orange-50 border-l-4 border-orange-400`) so the analyst immediately understands why a claim with all-green rules is in their queue.

#### Panel 4 — parts detail

Parts table with computed line totals. Unchanged from v3.

#### Contest context panel — shown on contested claims

Sits between Panels 3 and 4 when the claim has active contest data. The analyst can review the full contest without switching to the resolution workspace.

| Section | Content |
|---|---|
| Prior decision badge | "You previously rejected / the agent auto-rejected this claim" with coloured status pill |
| Customer contest | Contest reason, supporting evidence filenames, customer-provided context |
| Contest status | Current state of the contest with timestamp |
| Re-validation summary | One sentence from the agent: what re-validation found |

#### Action bar — state-aware

The action bar changes by claim state. This is the most consequential UI change in v6 — the agree/override distinction is how the system learns which agent signals are reliable.

**Borderline / anomaly / high-value escalation:**

| Action | Colour | Behaviour |
|---|---|---|
| Approve — agree with agent | Green (when agent recommended Approve) | No modal. `agreedWithAgent: true`. |
| Approve — override | Green with 2px border (when agent recommended Reject) | Triggers override modal. Reason required. |
| Reject — agree with agent | Red (when agent recommended Reject) | No modal. `agreedWithAgent: true`. |
| Reject — override | Red with 2px border (when agent recommended Approve) | Triggers override modal. Reason required. |
| Escalate for senior review | Amber | Adds to escalation queue with analyst note |

**Override reason modal** — fires when analyst decision contradicts agent recommendation:

- Label: "You're overriding the agent recommendation. Why?"
- Textarea, 300 char max, required
- Populated into `overrideReason` field and `claimTimeline`
- Surfaced to ops manager in the agent calibration view

The 2px border on override buttons (the only exception to the 0.5px border rule) signals visually that this is a consequential action before the modal fires.

**Contested claim resolution:**

| Action | Colour | Behaviour |
|---|---|---|
| Overturn decision | Green | Requires ruling notes → `contestStatus → resolved` |
| Uphold decision | Red | Requires ruling notes → `contestStatus → resolved` |
| Partial approval | Amber | Opens revised amount input + ruling notes → resolves |
| Request more info | Blue | Pre-populates message from agent-identified gaps → `contestStatus → under_review` |

**Ruling notes field** (required before any contested action activates):
- Label: "Ruling notes — this becomes the customer's explanation and the audit record."
- 500 char max
- Becomes `contestResolution` text shown to the customer
- The label is a constant reminder (per Persona 3's needs) that the analyst is writing for a non-technical reader

---

### 6.3 Savings counter — two-track automation metrics

Two visually distinct tracks separated by a divider. This shows stakeholders the full picture at a glance: what the agent handled autonomously on the left, what the analyst decided on the right.

**Agent track (left):**

| Metric | Calculation |
|---|---|
| Auto-approved | Count of `automationPath === 'auto_approved'` claims this session |
| Auto-rejected | Count of `automationPath === 'auto_rejected'` claims |
| Leakage prevented (auto) | Sum of `claimAmount` for auto-rejected claims |

**Analyst track (right):**

| Metric | Calculation |
|---|---|
| Analyst reviewed | Count of analyst decisions taken |
| Overrides | Count where `overrideReason` was populated |
| Flags caught | Analyst-rejected claims where `groundTruth` is violation |
| Agent accuracy | Analyst decisions that agreed with agent recommendation ÷ total analyst decisions, shown as % |

> POC note: leakage prevented and accuracy use `groundTruth` labels for illustration. Make this clear in the demo script.

---

### 6.4 Customer contest portal

The customer touches the portal at four moments. Each one is either a trust-building or trust-destroying interaction (Persona 3).

#### Panel 0 — pending review state

Shown when a claim has been submitted but no decision has been made. Designed to move the customer from anxious to informed.

| Element | Detail |
|---|---|
| Status banner | Blue "Claim Under Review" with pulsing "Processing" pill |
| Review progress tracker | 4-step pill: Received ✓ → Verifying Coverage ✓ → Reviewing Details (active, pulsing) → Decision (pending) |
| What we're verifying | Checklist of 4 items: warranty coverage active · repair codes within guidelines · mileage within limits · diagnostic evidence supports repair |
| Submitted claim details | Reference ID, submission date, VIN, mileage, repair codes, claim amount — confirms what's under review |
| What happens next | 3-step guide: (1) Review complete in 2–3 business days, (2) Notification with decision and explanation, (3) If approved → dealer payment; if denied → contest option |
| Support contact | "Contact Toyota Warranty Support at 1-800-331-4331 with your reference number" |

Transition: when `decisions[claimId]` becomes non-null, Panel 0 is replaced by Panel 1.

#### Panel 1 — claim result notification

| Element | Detail |
|---|---|
| Decision banner | `Approved` (green) / `Partially approved` (amber) / `Denied` (red) |
| Decision source | "Automatically assessed by our warranty system" when `automationPath === 'auto_rejected'` — sets accurate expectations |
| Claim summary | Claim ID, date, vehicle, amount |
| Plain-language explanation | `generateCustomerExplanation()` output — 2–3 sentences, specific numbers and thresholds, no legal jargon |
| Policy reference | Rule ID and plain-English description cited inline |
| Contest CTA | "I disagree with this decision" — prominent, not buried. Visible on Denied and Partially approved only. |

#### Panel 2 — contest submission form

| Field | Type | Notes |
|---|---|---|
| Reason for contest | Textarea | Required, 500 char max |
| Supporting evidence | File upload (mock) | Accepts filename strings in demo |
| Additional context | Textarea | Optional, 300 char max |
| Submit | Button | Triggers re-validation pipeline |

On submit: `contestStatus → submitted`. Confirmation is immediate — not "we'll be in touch."

#### Panel 3 — contest status tracker

3-step pill progress indicator.

| Status | Message |
|---|---|
| `submitted` | "Your contest has been received. We're reviewing your submission." |
| `under_review` | "Your contest is being reviewed by a warranty specialist." |
| `resolved` | "A decision has been made on your contest. See below." |

#### Panel 4 — resolution notification

| Element | Detail |
|---|---|
| Final decision banner | `Overturned` (green) / `Upheld` (red) / `Partially approved` (amber) |
| Ruling text | `contestResolution` — analyst-authored, plain language |
| Revised amount | Shown when partial approval changes the payout |
| Case closed | "This case is now closed. No further action is required." |

Per Design Principle 5: both overturn AND uphold must include a plain-language explanation. Silence is the worst outcome regardless of which way the decision went.

#### Edge cases — customer portal

| Scenario | Behaviour |
|---|---|
| Claim pending (no decision yet) | Panel 0 shown — progress tracker, claim details recap, timeline, support contact |
| Agent re-validation error | Status tracker shows "Under review by specialist" — skips auto-resolve, routes to analyst |
| Contest submitted with no evidence | Accepted — reason text alone is sufficient |
| Analyst requests more info | `contestStatus → under_review`. Customer sees analyst's pre-populated message |
| Contest on approved claim | Contest CTA not shown |
| Analyst upholds original decision | Customer receives plain-language explanation of why new evidence didn't change the outcome |

---

### 6.5 Call-in search

Accessed via a "Call-in" button in the top navigation. For when a customer calls Toyota directly about their claim.

#### Search inputs

Accepts: `vin`, `customerName` (partial), `customerEmail`, `claimId`. Returns claims across all `automationPath` values — a customer may call about an auto-approved claim, an auto-rejected claim, or an active contest. None of these are in the analyst queue by default.

#### Call-ready brief

Condensed view designed to be read from, not studied. Opens on clicking a search result.

| Element | Content |
|---|---|
| Status line | "Claim CLM-00003 · Rejected Apr 15 · $1,240.00" |
| Decision source | "Automatically assessed" or "Reviewed by warranty analyst" |
| Reason (plain language) | `generateCustomerExplanation()` output — same text the customer received |
| Contest status | "Not yet contested · Eligible to contest until [contestDeadline]" or current contest state |

**State-specific content:**

| Claim state | Call-ready brief shows |
|---|---|
| Auto-approved | "Claim approved automatically. All policy rules passed. No violations detected." |
| Auto-rejected, no contest | Explanation + contest window + contest CTA for analyst to initiate |
| Contested in progress | Current status + expected resolution timeline |
| Resolved | Final outcome + ruling text |

#### Analyst-initiated contest

From the call-ready brief, the analyst can open a contest on behalf of the customer:
- Clicks "Open contest on behalf of customer"
- Contest form opens — same fields as customer portal
- `contestSource` set to `analyst_on_behalf`
- Same re-validation pipeline fires
- Timeline entry created: "Contest initiated by analyst on customer's behalf"

#### Call log

After any call-in interaction, the analyst adds a call log note to the claim:
- 500 char max
- Saved to `analystNotes` and appended to `claimTimeline` with actor: `Analyst`, action: "Call log"
- Visible in claim timeline if claim is later reviewed or contested

---

## 7. Component tree

| Component | Responsibility |
|---|---|
| `App.jsx` | Root — loads data, global state, routes views, pre-fetches pipeline for hero claims |
| `SavingsCounter.jsx` | Two-track header — agent volume (left) + analyst decisions (right) |
| `ClaimQueue.jsx` | Analyst-filtered list — queue reason badges, sort, filter tabs, dual-mode search |
| `ClaimRow.jsx` | Single row — stacked queue reason pills, hover quick actions |
| `ClaimDetail.jsx` | Adaptive detail view — state banner, timeline, four panels, contest context, action bar |
| `ClaimStateBanner.jsx` | Single-line banner explaining why claim is in the queue |
| `ClaimTimeline.jsx` | Collapsible lifecycle history panel |
| `MetadataPanel.jsx` | Panel 1 — label grid, repair codes, automationPath badge |
| `AISummaryPanel.jsx` | Panel 2 — adapts between escalation brief and case research brief |
| `PolicyFlagsPanel.jsx` | Panel 3 — PASS/FAIL rules + anomaly signal row |
| `PartsPanel.jsx` | Panel 4 — parts table |
| `ContestContextPanel.jsx` | Contest context — prior decision badge, customer contest details, re-validation summary |
| `ActionBar.jsx` | State-aware — agree/override distinction, override modal trigger |
| `OverrideModal.jsx` | Required reason capture when analyst contradicts agent |
| `useAgents.js` | Pipeline sequence, `getAutomationPath()`, pre-fetch, loading states |
| `claimsStore.js` | Queue filter logic, sort, dual-mode search |
| `CustomerPortal.jsx` | Customer view — pending state, notification, form, tracker, resolution |
| `ContestForm.jsx` | Contest submission — reason, evidence, context |
| `ContestStatusTracker.jsx` | 3-step pill progress indicator |
| `SpecialistWorkspace.jsx` | Contest resolution surface — claim+contest context left, case research brief right |
| `ResolutionBriefPanel.jsx` | Right column — original reasoning, evidence assessment, precedents+rationale, gaps, analysis |
| `CallInSearch.jsx` | Call-in search surface — dual-input search, results list |
| `CallReadyBrief.jsx` | Condensed call-facing summary — state-aware across all automationPath values |
| `AnalystContestForm.jsx` | Analyst-initiated contest on behalf of customer |

---

## 8. State management

React state only — no Redux, no backend.

| State key | Type | Owned by | Notes |
|---|---|---|---|
| `claims` | `Claim[]` | `App.jsx` | Loaded once from `claims.json` |
| `activeClaimId` | string | `App.jsx` | Drives queue selection and detail |
| `agentResults` | object | `App.jsx` | Keyed by `claimId` — full pipeline output including `anomalySignal`, `escalationReason` |
| `decisions` | object | `App.jsx` | `claimId → { action, agreedWithAgent, overrideReason }` |
| `filter` | string | `ClaimQueue.jsx` | `myqueue \| anomaly \| highvalue \| contested \| allclaims` |
| `searchMode` | string | `ClaimQueue.jsx` | `queue \| callin` |
| `isLoading` | object | `useAgents.js` | Keyed by `claimId`, boolean |
| `contestData` | object | `App.jsx` | `claimId → { status, reason, evidence, resolution, source }` |
| `activeView` | string | `App.jsx` | `analyst \| customer \| specialist \| callin` |
| `callLog` | object | `App.jsx` | `claimId → string[]` — analyst call notes this session |

Key change from v3: `decisions` stores `agreedWithAgent` boolean and `overrideReason` alongside the action. This powers the agent accuracy metric in the savings counter and the override rate visible to the ops manager.

---

## 9. Agent integration (Engineer C handoff)

### Internal review pipeline — three functions in sequence

Called inside `useAgents.js`. The analyst UI receives the output of all three — never intermediate steps.

| Step | Function | Input | Output |
|---|---|---|---|
| 1 — Normalise | `normalizeClaim(claim)` | Raw claim | `{ normalizedClaim, techNotesSummary }` |
| 2 — Validate | `validateClaim(normalizedClaim, rules)` | Normalised claim + rules | `{ results: [{ruleId, passed, severity, message}], overallSeverity, anomalySignal, anomalyDescription }` |
| 3 — Summarise | `summarizeClaim(claim, validation)` | Claim + validation | `{ summary, recommendation, confidence, escalationReason }` |

`anomalySignal` (boolean) and `anomalyDescription` (string) power the anomaly signal row in the policy flags panel.
`escalationReason` (string) populates the claim state banner.

### Automation routing — new in v6

```js
getAutomationPath(claim, validation, summary) {
  if (claim.claimAmount >= HIGH_VALUE_THRESHOLD) return 'analyst_queue';
  if (validation.anomalySignal) return 'analyst_queue';
  if (summary.confidence === 'high' && validation.overallSeverity === 'high')
    return 'auto_rejected';
  if (summary.confidence === 'high' && validation.overallSeverity === 'none')
    return 'auto_approved';
  return 'analyst_queue'; // ambiguous → human
}
```

### Customer contest pipeline

| Function | Input | Output |
|---|---|---|
| `generateCustomerExplanation(claim, validation)` | Claim + validation | `{ explanation, ruleReference, contestEligible, contestDeadline }` |
| `generateResolutionBrief(claim, validation, contest)` | Claim + validation + contest | `{ originalReasoning, classification, evidenceAssessment, precedents[{caseId, outcome, similarityRationale}], gaps, recommendation, rationale, prePopulatedRequestMessage }` |

`originalReasoning` — the agent's exact rejection logic at time of original decision, shown to the analyst before the customer's evidence.
`precedents[].similarityRationale` — why the agent considered this case similar. Without this, the analyst cannot evaluate whether the precedent is relevant.
`prePopulatedRequestMessage` — draft message for the "Request more info" action, based on identified gaps.
`contestDeadline` — used in call-ready brief and customer portal.

---

## 10. Hero claim demo flow

| Claim | Story | Automation path | What the UI shows |
|---|---|---|---|
| `CLM-00001` | Clean — system working | Auto-approved | Not in analyst queue. "All claims" tab only. Green badge. |
| `CLM-00002` | Labor hours 4× limit — clear reject | Auto-rejected | Not in analyst queue. Customer receives denial. Demonstrated via call-in search. |
| `CLM-00003` | Out-of-warranty mileage — looks reasonable | Analyst queue — borderline | Analyst queue. Banner: "Medium confidence. Your judgment required." Escalation reason: "Mileage at 97% of threshold." |
| `CLM-00004` | Dealer pattern anomaly | Analyst queue — anomaly | Analyst queue. Orange anomaly badge. All rules PASS. Anomaly signal row explains dealer pattern. |
| `CLM-00005` | Borderline ECM — also the contest demo | Analyst queue → auto-reject → contest | Full loop across all four views. |

**Full demo sequence for `CLM-00005`:**
```
Analyst queue:  agent escalated at medium confidence
                → analyst reviews brief → escalates to senior review
Agent:          senior path auto-rejects with high confidence
Customer view:  receives auto-rejection with plain-language explanation
                → contests with independent diagnostic report
Agent:          re-validates with new evidence
                → builds resolution brief with original reasoning + evidence delta
Analyst:        opens contested claim in specialist workspace
                → reads original agent reasoning first
                → reads customer evidence and agent assessment
                → overturns → enters ruling notes
Customer view:  "Overturned" · ruling text · case closed
```

`CLM-00002` call-in demo:
```
Customer phones about auto-rejected claim
→ Analyst clicks Call-in mode → searches by VIN
→ Call-ready brief: decision source "automatically assessed", plain-language reason, contest window
→ Customer wants to contest → analyst initiates on their behalf
→ Re-validation pipeline fires → contest source: analyst_on_behalf
```

---

## 11. Sprint timeline — Engineer B

| Time | Task |
|---|---|
| Min 0–30 | Lock schema with Engineers A and C. Confirm new fields: `automationPath`, `anomalySignal`, `escalationReason`, `originalReasoning`, `contestSource`, `overrideReason`, `claimTimeline`, `customerName`, `contestDeadline`, `similarityRationale`, `prePopulatedRequestMessage`. Scaffold. |
| Hr 0–2 | Build `ClaimQueue` with queue filter logic in `claimsStore.js`. Queue reason badges (stacked). Dual-mode search. Filter tabs including "All claims". |
| Hr 2–4 | Build `ClaimDetail` — state banner, timeline panel, four content panels, contest context panel, state-aware action bar, override modal. Build two-track `SavingsCounter`. |
| Hr 4 | Merge. Wire real data. Wire `useAgents.js` pipeline with `getAutomationPath()`. |
| Hr 4–5 | Integration test all 5 hero claims. Build `CustomerPortal` (including Panel 0 pending state) and `SpecialistWorkspace` for `CLM-00005` contest arc. Wire new agent output fields. Build `CallInSearch` and `CallReadyBrief` for `CLM-00002` call-in demo. |
| Hr 5–6 | Demo polish. Loading states. View toggles. Rehearse full demo flow — `CLM-00005` loop and `CLM-00002` call-in — twice. |

---

## 12. Acceptance criteria

### Automation routing

- [ ] `getAutomationPath()` runs for every claim on app load
- [ ] Auto-approved and auto-rejected claims absent from analyst queue by default
- [ ] All three hard override triggers (high-value, anomaly, contested) force queue inclusion
- [ ] `CLM-00001` appears only in "All claims" tab
- [ ] `CLM-00002` appears only in "All claims" tab until contested
- [ ] "All claims" tab shows auto-handled volume counter at top

### Claim queue

- [ ] Queue reason badges render for all four trigger types; multiple reasons stack as separate pills
- [ ] Sort order: Contested → Anomaly → High value → Borderline
- [ ] Call-in search finds claims by VIN, customer name, and email across all `automationPath` values
- [ ] `Analysing...` spinner visible on claim rows while pipeline processes

### Claim detail

- [ ] State banner renders correctly for all six claim states
- [ ] Claim timeline panel present, collapsed by default, expands with correct entries
- [ ] AI brief shows `escalationReason` for escalated claims
- [ ] AI brief labelled "Case Research Brief · AI-prepared context" in contest resolution mode
- [ ] AI brief shows `originalReasoning` before customer evidence for contested claims
- [ ] Policy flags panel shows anomaly signal row (orange) when `anomalySignal === true`
- [ ] Anomaly row shows `anomalyDescription` in plain language
- [ ] Contest context panel visible when claim has active contest data
- [ ] AI narrative cites specific numbers and thresholds — not vague adjectives (Principle 1)

### Action bar

- [ ] Agree / override distinction shown correctly based on agent recommendation vs. analyst action
- [ ] Override buttons use 2px border to signal consequential action
- [ ] Override modal fires when analyst contradicts agent recommendation
- [ ] Override reason required before confirming override decision
- [ ] `overrideReason` populates in `decisions[]` state and claim timeline
- [ ] Ruling notes field required before contested claim actions activate
- [ ] Ruling notes label reads: "Ruling notes — this becomes the customer's explanation and the audit record."
- [ ] "Request more info" pre-populates from `prePopulatedRequestMessage`

### Savings counter

- [ ] Two tracks separated by visual divider
- [ ] Agent track shows auto-approved, auto-rejected, leakage prevented (auto)
- [ ] Analyst track shows decisions, overrides, flags caught, agent accuracy %

### Customer portal

- [ ] Panel 0 (pending state) shows progress tracker, claim recap, verification checklist, timeline, support contact
- [ ] Panel 0 transitions to Panel 1 when `decisions[claimId]` becomes non-null
- [ ] Auto-rejection notification states "automatically assessed by our warranty system"
- [ ] Decision explanation cites specific thresholds and amounts, not policy boilerplate (Principle 1)
- [ ] Contest CTA is prominent, not buried (Principle 6)
- [ ] Both overturn AND uphold include plain-language ruling explanation (Principle 5)
- [ ] Status tracker advances accurately at each stage (Principle 3)

### Call-in surface

- [ ] Search returns results across all claim states including auto-approved and auto-rejected
- [ ] Call-ready brief renders correctly for all four claim states (auto-approved, auto-rejected, contested, resolved)
- [ ] Analyst-initiated contest sets `contestSource` to `analyst_on_behalf`
- [ ] Call log entry saves to `claimTimeline` and appears in timeline panel

---

## Appendix — Tailwind class conventions

| Element | Tailwind classes |
|---|---|
| Page background | `bg-gray-50 min-h-screen` |
| Card surface | `bg-white border border-gray-200 rounded-xl p-5` |
| Borderline badge | `bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full` |
| Anomaly badge | `bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full` |
| High-value badge | `bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full` |
| Contested badge | `bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full` |
| Auto-approved badge | `bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full` |
| Auto-rejected badge | `bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full` |
| Approve (agree) | `bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-lg font-medium` |
| Approve (override) | `bg-green-50 text-green-700 border-2 border-green-400 hover:bg-green-100 px-4 py-2 rounded-lg font-medium` |
| Reject (agree) | `bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-lg font-medium` |
| Reject (override) | `bg-red-50 text-red-700 border-2 border-red-400 hover:bg-red-100 px-4 py-2 rounded-lg font-medium` |
| Escalate button | `bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-4 py-2 rounded-lg font-medium` |
| Overturn button | `bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-lg font-medium` |
| Uphold button | `bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-lg font-medium` |
| AI brief card | `bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl` |
| Case research brief card | `bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-xl` |
| Anomaly signal row | `bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-md text-orange-800` |
| State banner — borderline | `bg-amber-50 border-b border-amber-200 px-5 py-2 text-amber-800 text-sm` |
| State banner — anomaly | `bg-orange-50 border-b border-orange-200 px-5 py-2 text-orange-800 text-sm` |
| State banner — high value | `bg-purple-50 border-b border-purple-200 px-5 py-2 text-purple-800 text-sm` |
| State banner — contested | `bg-blue-50 border-b border-blue-200 px-5 py-2 text-blue-800 text-sm` |
| Override button border | `border-2` — 2px, the only exception to the 0.5px border rule; signals a consequential action |
| Customer explanation card | `bg-gray-50 border border-gray-200 rounded-xl p-5 text-base leading-relaxed` |
| Call-ready brief card | `bg-gray-50 border border-gray-200 rounded-xl p-5 text-base leading-relaxed` |
| Timeline entry | `flex gap-3 py-2 border-b border-gray-100 text-sm` |
| Savings counter | `bg-white border-b border-gray-200 px-6 py-3 flex gap-8 items-center` |
| Savings counter track divider | `w-px h-8 bg-gray-200 mx-2` |
| Contest status pill (active) | `bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full` |
| Contest status pill (inactive) | `bg-gray-100 text-gray-400 text-xs font-medium px-3 py-1 rounded-full` |

---

_Last updated: May 2025 — Agentic Warranty Claims Engine POC Sprint v6_
