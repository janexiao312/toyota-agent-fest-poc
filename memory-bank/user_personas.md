# User Personas — Agentic Warranty Claims Engine

**Product:** Agentic Warranty Claims Engine — POC Sprint
**Last updated:** May 2025 — v1

---

## Persona 1 — The Warranty Analyst

> "I need to know *why* it was flagged, not just *that* it was flagged. Give me that and I can move fast."

### Who they are

A mid-senior Toyota operations employee who owns warranty claims end to end — from first-pass queue review through to contested claim resolution. They are not a specialist who only sees escalations, and they are not a rubber stamp on AI output. They are the decision-maker. The AI is their preparation layer.

They currently work through a manual queue, reading raw repair orders and technician notes, cross-referencing policy rules in a separate document, and making calls largely from pattern recognition built up over years. They are accurate but slow. The backlog is always present.

### Goals

- Get through the queue without sacrificing decision quality
- Make every reject or escalate defensible — to their manager, to a customer, to an auditor
- Trust the AI brief enough to act on it quickly without needing to verify everything from scratch
- Handle contested claims without having to re-learn a claim they already reviewed

### Frustrations with the current state

- Manual cross-referencing of rules against claim data is slow and error-prone
- No pattern recognition support — a dealer submitting fraudulent batches looks like individual clean claims
- Decisions are hard to document consistently; the audit trail is whatever they typed in a notes field
- Contested claims land with a different person who has no context, causing delays and inconsistency

### How they use the product

The analyst touches the same claim at up to three points in its lifecycle. The product must feel coherent across all three.

**First-pass review**
Opens the queue to find Flagged and Anomaly claims already sorted to the top. Reads the AI narrative — if it's specific and cites the exact threshold breached, they make the call in seconds. Checks the policy flags panel to confirm. Clicks Reject, Approve, or Escalate. Counter increments. Moves on.

**Escalation return**
A claim they previously escalated comes back because it needs a final decision before it can be contested or closed. They return to it with memory of the original review — the claim detail shows the timeline so they can see what they decided and why. The AI brief has been updated if anything changed.

**Contest resolution**
A claim they rejected comes back because the customer pushed back. The resolution brief shows them exactly what is new: what the customer submitted, what the re-validation found, how that changes the picture. Precedents are cited. Gaps are named. They enter their ruling notes — required, because those notes become the customer's explanation — and close the case.

### What builds trust

- **Specificity in the AI narrative.** "8.5 labor hours against a 2.0-hour policy limit — a 325% overage" earns trust. "Labor hours appear elevated" does not.
- **Explainability at every step.** Recommendation badge plus confidence level plus the per-rule breakdown means they can always reconstruct the reasoning without relying on the AI being right.
- **Stable UI across claim states.** One surface that adapts — not two different interfaces to learn. The action bar changes based on claim state; the overall layout does not.
- **Final authority is unambiguous.** The brief reads like a prepared dossier. The action buttons are theirs to press. Nothing should feel like the machine already decided.

### What erodes trust

- Vague or hedged narrative output that requires them to go back to raw data anyway
- The amber "Unable to analyse — review manually" state appearing unpredictably mid-session
- Any design pattern that implies the AI recommendation is the decision rather than an input to their decision

### Metrics they care about

- Claims reviewed per session
- Accuracy of their decisions (flags caught vs. false positives over time)
- Time to clear the contested queue

### Key touchpoints

`ClaimQueue` · `ClaimDetail` · `AISummaryPanel` · `PolicyFlagsPanel` · `ActionBar` · `ResolutionBriefPanel` · savings counter

---

## Persona 2 — The Claims Operations Manager

> "I don't need to open every claim. I need to know if the system is catching what it should — and I need a number I can take upstairs."

### Who they are

A senior Toyota operations leader accountable for leakage metrics, throughput rates, and escalation volumes across the claims function. They are not in the queue all day. They are in the queue when something looks wrong, when they need to report results, or when they are evaluating whether the system is performing.

They think in patterns, not individual cases. A single fraudulent claim is an analyst's problem. A dealer submitting 14 ECM claims in 30 days against a regional average of 2 is their problem.

### Goals

- Know whether the AI is catching leakage the old rules engine was missing
- Have a number — leakage prevented, accuracy percentage — that is defensible in a leadership review
- Spot dealer-level patterns before they become systemic
- Maintain oversight without becoming a bottleneck in the daily review process

### Frustrations with the current state

- Leakage reports are retrospective — by the time the data is aggregated, the damage is already approved
- Anomalies that don't trip explicit policy rules pass through undetected; the rules engine is rule-bound by design
- No aggregate view of dealer behaviour — everything is claim-by-claim
- Metrics are manually assembled; there is no live counter

### How they use the product

The ops manager primarily uses two surfaces: the Anomaly tab and the savings counter. They rarely open individual claims unless a pattern demands it.

**Morning queue review**
Opens the app to check the savings counter totals. Leakage prevented and accuracy percentage tell them at a glance whether the overnight batch processed cleanly. If accuracy has dropped, they drill in.

**Anomaly investigation**
Filters to the Anomaly tab. Amber-badged claims visible; dealer IDs clustered. Clicks into a pattern anomaly — the AI brief explains the statistical signal in plain language, not a score. They read it, understand the dealer behaviour, and either action it directly or assign it to an analyst.

**Reporting**
Pulls the savings counter metrics — claims reviewed, flags caught, leakage prevented, accuracy — to build the weekly or monthly leadership report. The numbers are already there; no export needed for the POC.

### What builds trust

- **Pattern-level language in the anomaly brief.** "This dealer has submitted 14 ECM-related claims in 30 days against a regional average of 2" is actionable. A fraud score is not.
- **Live metrics that are always visible.** The savings counter needs to be present on every view, updating in real time as analysts work. It is the ops manager's primary instrument even when they are not actively using the product.
- **Anomaly detection that goes beyond the rules engine.** The whole value proposition for this persona is claims that passed all rules but the agent still flagged. If the anomaly tab only shows claims that failed a rule, it is redundant.

### What erodes trust

- Accuracy percentage that drops without explanation
- Anomaly flags that turn out to be false positives at high rates — this persona will pull the feature if it creates noise
- Metrics that don't match what they can independently verify in their existing reporting

### Metrics they care about

- Leakage prevented (total dollar value)
- Flags caught vs. total flagged claims (accuracy %)
- Anomaly detection rate: claims the agent flagged that the rules engine passed
- Escalation rate and resolution time

### Key touchpoints

`SavingsCounter` · `ClaimQueue` (Anomaly tab) · `AISummaryPanel` (pattern narrative) · `ClaimDetail` (drill-in only)

---

## Persona 3 — The Customer

> "I just need to understand why my claim was denied. And if I think they got it wrong, I want a real way to push back."

### Who they are

A Toyota vehicle owner who submitted a warranty claim through a dealer. They are not a warranty expert. They do not know what R-10 means. They trusted that their vehicle was covered and they are now dealing with the outcome of a process they had no visibility into.

Their relationship with Toyota is long-term — they own a Toyota, they service it at a Toyota dealer, they expect the brand to treat them fairly. A warranty denial that feels arbitrary or unexplained does not just resolve a single claim; it affects how they feel about the brand.

### Goals

- Understand what was decided and why, in plain language
- Know whether they have a path to push back, and how to use it
- Feel that the system took their situation seriously, not just processed them
- Get a resolution that they understand — even if it doesn't go their way

### Frustrations with the current state

- Denial letters written in policy language that requires a lawyer to interpret
- No clear path to contest — or a path that feels designed to discourage
- No visibility into what is happening after they submit a contest
- Final rulings that arrive without explanation, as if the decision was always going to be the same

### How they use the product

The customer touches the product at three points. Each one is a moment where trust can be built or lost.

**Receiving the result**
Reads the decision notification. The plain-language explanation — generated by the customer explanation agent — names the specific rule and threshold that the claim failed. Not "your claim did not meet policy requirements" but "your claim submitted 8.5 labor hours for this repair; the policy limit is 2.0 hours." They either accept it and move on, or they believe the explanation is wrong and they want to contest.

**Contesting the decision**
Clicks "I disagree with this decision." The contest form asks for their reason and lets them attach supporting evidence — in the CLM-00005 demo case, a diagnostic report that changes the picture. They submit and immediately see confirmation that their contest has been received. The status tracker moves to step one.

**Receiving the resolution**
The status tracker advances. Eventually it lands on resolved. The resolution panel shows the outcome — in the CLM-00005 demo, "Overturned" in green — alongside the specialist's plain-language ruling. The case is closed with an explanation they can read and understand, regardless of the outcome.

### What builds trust

- **Specific language, not policy boilerplate.** The customer explanation must cite the actual number — the labor hours, the mileage, the specific threshold — so the denial feels grounded in fact rather than policy convenience.
- **A contest path that feels real.** The "I disagree" button must be visible without hunting for it. The form must be simple. The submission must be confirmed immediately.
- **Status visibility during the wait.** The three-step tracker is the only thing standing between "I submitted something and heard nothing" and "I know where my case is." It must advance and it must be accurate.
- **A final ruling that explains itself.** Even an upheld decision — where the original denial stands — must come with a plain-language explanation of why the new evidence did not change the outcome. Silence is the worst resolution.

### What erodes trust

- Explanation language that requires policy knowledge to interpret
- A contest CTA that is hard to find or visually de-emphasised
- The status tracker not advancing — or advancing to "resolved" before a ruling text is available
- An overturned decision with no explanation of what changed

### Metrics they care about

*(from Toyota's perspective, not the customer's own)*

- Contest submission rate (are customers finding and using the path?)
- Resolution time from contest submitted to resolved
- Overturn rate (signals whether re-validation is adding genuine value)
- Customer satisfaction proxy: did the resolution notification render with a complete explanation?

### Key touchpoints

`CustomerPortal` · `ContestForm` · `ContestStatusTracker` · resolution notification panel

---

## Persona comparison at a glance

| | Warranty Analyst | Ops Manager | Customer |
|---|---|---|---|
| **Primary goal** | Close claims accurately and fast | Detect leakage patterns and report results | Understand the decision and contest if needed |
| **Primary surface** | Claim queue + claim detail | Anomaly tab + savings counter | Customer portal |
| **Relationship with AI** | Trusts it when it's specific; verifies before acting | Trusts patterns; sceptical of individual scores | Unaware of AI; experiences only the output |
| **Decision authority** | Full — Approve / Escalate / Reject / Overturn | None — observes and assigns | None — submits and waits |
| **Trust is built by** | Specificity, explainability, stable UI | Pattern language, live metrics, anomaly precision | Plain language, contest path visibility, tracker accuracy |
| **Trust is broken by** | Vague output, unpredictable errors | High false positive rate, metric inconsistency | Boilerplate denials, no response, unexplained rulings |
| **Volume of interaction** | High — daily, all-day queue work | Low to medium — monitoring and spot checks | One-time or rare — per claim lifecycle |

---

*These personas should be revisited after the first stakeholder demo. The warranty analyst persona in particular will need refinement once real reviewers interact with the POC and report where the AI brief earns or loses their trust.*
