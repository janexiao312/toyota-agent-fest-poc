# Warranty Reviewer UI — Task Breakdown

**Source:** `warranty_ui_prd.md`  
**Sprint:** 6-hour POC  

---

## Phase 1 — Project Setup (Min 0–30)

- [x] Scaffold React + Vite project
- [x] Install and configure Tailwind CSS
- [x] Create empty stub files for all components (`App.jsx`, `SavingsCounter.jsx`, `ClaimQueue.jsx`, `ClaimRow.jsx`, `ClaimDetail.jsx`, `MetadataPanel.jsx`, `AISummaryPanel.jsx`, `PolicyFlagsPanel.jsx`, `PartsPanel.jsx`, `ActionBar.jsx`)
- [x] Create `useAgents.js` custom hook stub
- [x] Create `claimsStore.js` module stub
- [x] Confirm `claims.json` and `rules.json` load without errors

---

## Phase 2 — Claim Queue / List View (Hr 0–2)

### ClaimQueue component
- [ ] Render sortable table with columns: Claim ID, Date, Dealer, Repair, Amount, Warranty, Status, Action
- [ ] Format `claimDate` as MM/DD/YYYY
- [ ] Format `claimAmount` as $X,XXX.XX (right-aligned)
- [ ] Show first repair code as badge; display `+N` if multiple codes exist
- [ ] Implement warranty type pill badges (basic / powertrain / extended)

### Status badges
- [ ] Render `Clean` badge — `bg-blue-100 text-blue-800`
- [ ] Render `Flagged` badge — `bg-red-100 text-red-800`
- [ ] Render `Anomaly` badge — `bg-amber-100 text-amber-800`
- [ ] Show `Analysing...` spinner as loading state

### Filtering & sorting
- [ ] Implement filter tabs: All / Flagged / Anomaly / Clean
- [ ] Default sort: Flagged and Anomaly claims first, then by `claimAmount` descending
- [ ] Implement search input filtering by `claimId` or `dealerId`

### ClaimRow component
- [ ] Render single row with all columns
- [ ] Show quick approve/reject buttons on hover

---

## Phase 3 — Claim Detail / Review View (Hr 2–4)

### Navigation
- [ ] Clicking a claim row opens the detail view (overlay or page replace, no page refresh)
- [ ] Back navigation returns to queue

### Panel 1 — MetadataPanel
- [ ] Display label grid: Claim ID, dealer, VIN, date, mileage, warranty type
- [ ] Show repair code badges across top
- [ ] Display claim amount prominently in top-right corner

### Panel 2 — AISummaryPanel
- [ ] Render AI summary in styled card (`bg-blue-50 border-l-4 border-blue-500`)
- [ ] Show recommendation badge: Approve / Review / Reject
- [ ] Show confidence indicator: low / medium / high
- [ ] Render collapsible "Source notes" section with technician notes
- [ ] Implement loading skeleton while agent is running

### Panel 3 — PolicyFlagsPanel
- [ ] Render rule ID badge in monospaced pill (e.g. `R-01`)
- [ ] Display rule description from `rules.json` `message` field
- [ ] Show result: PASS (green) / FAIL (red)
- [ ] Show severity badge (Low / Medium / High) on failed rules only
- [ ] Implement empty state: "No policy violations detected" in green

### Panel 4 — PartsPanel
- [ ] Render parts table: Part code, Qty, Unit cost, Line total
- [ ] Format unit cost as currency
- [ ] Compute line total (qty × unitCost) in UI

### ActionBar
- [ ] Approve button — marks claim green, returns to queue
- [ ] Escalate button — marks claim amber, returns to queue
- [ ] Reject button — increments leakage prevented counter, returns to queue
- [ ] After action: auto-select next flagged claim in queue

---

## Phase 4 — Savings Counter (Hr 2–4)

- [ ] Build persistent header component visible on both views
- [ ] Display "Claims reviewed" — count of all actions taken
- [ ] Display "Flags caught" — rejected claims where `groundTruth` is violation/anomaly
- [ ] Display "Leakage prevented" — sum of `claimAmount` for rejected flagged claims
- [ ] Display "Accuracy" — flags caught / total flagged processed (as %)
- [ ] Update all metrics in real time on each reviewer decision

---

## Phase 5 — State Management

- [ ] Load `claims.json` into `claims` state in `App.jsx`
- [ ] Implement `activeClaimId` state for queue selection and detail routing
- [ ] Implement `agentResults` state keyed by `claimId`
- [ ] Implement `decisions` state keyed by `claimId` (approve | reject | escalate | null)
- [ ] Implement `filter` state in `ClaimQueue.jsx`
- [ ] Implement `isLoading` state in `useAgents.js` keyed by `claimId`

---

## Phase 6 — Agent Integration (Hr 4–5)

- [ ] Wire `useAgents.js` to call `validateClaim(claim, rules)` from Engineer C
- [ ] Wire `useAgents.js` to call `summarizeClaim(claim, validation)` after validation completes
- [ ] Pre-run agents against all 5 hero claims on app load
- [ ] Populate `agentResults` state with validation and summary outputs
- [ ] Connect `AISummaryPanel` to real agent summary output
- [ ] Connect `PolicyFlagsPanel` to real agent validation output

---

## Phase 7 — Hero Claims Verification (Hr 4–5)

- [ ] CLM-00001: Clean — green status, approve recommendation, all rules pass
- [ ] CLM-00002: Labor hours 4× over — red FAIL on R-01, high severity, reject recommendation
- [ ] CLM-00003: Out-of-warranty mileage — red FAIL on R-06, flag looks surprising
- [ ] CLM-00004: Dealer pattern anomaly — anomaly badge, summary explains statistical pattern
- [ ] CLM-00005: Borderline ECM — medium severity, escalate recommendation, R-10 visible

---

## Phase 8 — Demo Polish (Hr 5–6)

- [ ] Confirm loading states display correctly during agent processing
- [ ] Verify all 5 hero claims tell their story without verbal explanation
- [ ] Confirm savings counter updates correctly after each decision
- [ ] Verify filter tabs work correctly
- [ ] Rehearse full demo flow end-to-end (twice)

---

## Acceptance Criteria (Final Checklist)

- [ ] Claim queue loads all claims from `claims.json` without errors
- [ ] Flagged and Anomaly claims sort above clean claims by default
- [ ] Filter tabs correctly show only matching claims
- [ ] Clicking any claim opens detail view without page refresh
- [ ] AI summary panel shows loading state while agents run
- [ ] Policy flags panel renders pass/fail per rule with correct severity badges
- [ ] Approve action marks claim green and returns to queue
- [ ] Reject action increments leakage prevented in savings counter
- [ ] Escalate action marks claim with amber badge
- [ ] All 5 hero claims render their story clearly
- [ ] Savings counter updates correctly after each decision
