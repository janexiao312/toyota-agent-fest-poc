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

---

## 2. Goals & non-goals

### Goals

- Reviewers can scan flagged claims at a glance and prioritise by severity
- Clicking a claim surfaces an AI-generated summary and a breakdown of policy violations
- Reviewers can approve, reject, or escalate a claim in one click
- A savings counter updates in real time as reviewers make decisions
- The demo flow through 5 hero claims is smooth and requires no explanation

### Non-goals for this sprint

- Authentication or user management — not needed for POC
- Persistent backend storage — React state only, no database
- Mobile responsiveness — desktop demo only
- Full anomaly detection dashboard — deferred to Phase 2
- Real Toyota branding or production design polish

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
| Action | — | Quick approve/reject buttons on hover |

#### Status badge colours

| Status | Colour |
|---|---|
| `Clean` | Blue — `bg-blue-100 text-blue-800` |
| `Flagged` | Red — `bg-red-100 text-red-800` |
| `Anomaly` | Amber — `bg-amber-100 text-amber-800` |

#### Filtering and sorting

- Filter bar: **All / Flagged / Anomaly / Clean** tabs above the table
- Default sort: Flagged and Anomaly claims rise to top, then by `claimAmount` descending
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

---

## 6. State management

React state only — no Redux, no backend. Keep it simple for the 6-hour sprint.

| State key | Type | Owned by |
|---|---|---|
| `claims` | `Claim[]` | `App.jsx` — loaded once from `claims.json` |
| `activeClaimId` | string | `App.jsx` — drives queue selection and detail view |
| `agentResults` | object | `App.jsx` — keyed by `claimId`, populated by `useAgents` hook |
| `decisions` | object | `App.jsx` — keyed by `claimId`: `approve \| reject \| escalate \| null` |
| `filter` | string | `ClaimQueue.jsx` — `all \| flagged \| anomaly \| clean` |
| `isLoading` | object | `useAgents.js` — keyed by `claimId`, boolean |

---

## 7. Agent integration (Engineer C handoff)

Engineer B's UI calls two functions exported from Engineer C's branch. These are the only cross-branch dependencies. The interface contract is fixed — do not change it without agreeing with Engineer C.

| Function | Input | Output |
|---|---|---|
| `validateClaim(claim, rules)` | claim object + rules array | `{ results: [{ruleId, passed, severity, message}], overallSeverity }` |
| `summarizeClaim(claim, validation)` | claim + validation output | `{ summary: string, recommendation: 'approve'\|'review'\|'reject', confidence: 'low'\|'medium'\|'high' }` |

Wire these inside `useAgents.js`. Call `validateClaim` first, then pass its output to `summarizeClaim`. Both are async. Show a loading skeleton in `AISummaryPanel` and `PolicyFlagsPanel` while awaiting results.

For the demo, pre-run agents against all 5 hero claims on app load so results are ready instantly when the reviewer opens each claim.

---

## 8. Hero claim demo flow

Engineer B owns the demo UI experience. These 5 claims are the entire stakeholder script — design the UI so each one tells its story clearly without narration.

| Claim | Story | What the UI must show |
|---|---|---|
| `CLM-00001` | Clean — system working smoothly | Green status, approve recommendation, all rules passed |
| `CLM-00002` | Labor hours 4× over limit — clear catch | Red FAIL on R-01, high severity badge, reject recommendation |
| `CLM-00003` | Out-of-warranty mileage — human would miss | Red FAIL on R-06, amount looks reasonable so flag is surprising |
| `CLM-00004` | Dealer pattern anomaly | Anomaly badge, summary explains the statistical pattern |
| `CLM-00005` | Borderline — unverified ECM diagnosis | Medium severity, escalate recommendation, R-10 explanation visible |

---

## 9. Sprint timeline — Engineer B

| Time | Task |
|---|---|
| Min 0–30 | Lock schema with Engineers A and C. Scaffold React + Vite. Install Tailwind. Create component files as empty stubs. |
| Hr 0–2 | Build `ClaimQueue` and `ClaimRow` with mock data stubs. Implement filter tabs and sort logic. Status badges working. |
| Hr 2–4 | Build `ClaimDetail` with all four panels. Wire `AISummaryPanel` and `PolicyFlagsPanel` to mock agent output shapes. Build `ActionBar` and `SavingsCounter`. |
| Hr 4 | Merge to main. Replace mock stubs with Engineer A real data. Wire `useAgents.js` to Engineer C functions. |
| Hr 4–5 | Integration testing. Fix shape mismatches. Confirm hero claims render correctly end to end. |
| Hr 5–6 | Demo polish. Confirm loading states work. Rehearse demo flow twice. |

---

## 10. Acceptance criteria

The UI is considered complete when all of the following pass:

- [ ] Claim queue loads all 55 claims from `claims.json` without errors
- [ ] Flagged and Anomaly claims sort above clean claims by default
- [ ] Filter tabs correctly show only claims matching the selected `groundTruth`
- [ ] Clicking any claim opens the detail view without page refresh
- [ ] AI summary panel shows a loading state while agents are running
- [ ] Policy flags panel renders pass/fail per rule with correct severity badges
- [ ] Approve action marks the claim green and returns to queue
- [ ] Reject action increments leakage prevented in the savings counter
- [ ] Escalate action marks the claim with an amber badge
- [ ] All 5 hero claims tell their story clearly without verbal explanation
- [ ] Savings counter updates correctly after each reviewer decision

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
| Approve button | `bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-lg font-medium` |
| Reject button | `bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-lg font-medium` |
| Escalate button | `bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-4 py-2 rounded-lg font-medium` |
| AI summary card | `bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl` |
| Rule PASS | `text-green-600 font-medium` |
| Rule FAIL | `text-red-600 font-medium` |
| Table header | `bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wide` |
| Savings counter | `bg-white border-b border-gray-200 px-6 py-3 flex gap-8 items-center` |

---

_Last updated: May 2025 — Agentic Warranty Claims Engine POC Sprint_
