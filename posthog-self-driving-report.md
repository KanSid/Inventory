# PostHog Self-driving Setup Report

_Generated 2026-08-25 — D'Aisle Inventory_

## Summary

PostHog Self-driving is now configured for this project. Session Replay, Error Tracking, and Support were enabled server-side; six native signal sources were wired to the inbox; a five-scout troop was activated; and two Replay Vision scanners were created to push findings from session recordings directly into the inbox. Findings should start appearing in the [Self-driving inbox](https://us.posthog.com/project/575765/inbox) within approximately 30 minutes.

---

## AI data processing

**Approved.** Organization-level AI data processing consent was enforced by the wizard before this run started.

---

## GitHub

**Connected during this run.** Integration id: `248110`, account: KanSid. Signals can now research findings against the repository and open fix PRs.

---

## Products enabled

| Product | Result | Notes |
|---|---|---|
| Session Replay | **already enabled** | Server-side recording was on before this run. No `disable_session_recording` override found in `instrumentation-client.ts`. |
| Error Tracking | **enabled** | `capture_exceptions: true` is already set in `instrumentation-client.ts` — no code change needed. |
| Support (Conversations) | **enabled** | Tickets only arrive once an inbound channel is connected — see Follow-ups. |

---

## Signal sources

| source_product | source_type | Action | Config ID |
|---|---|---|---|
| `signals_scout` | `cross_source_issue` | **on by default** — no row needed | — |
| `health_checks` | `health_issue` | **enabled** | `01a03805-15b1-7ddd-806e-29a4e53ec9c5` |
| `error_tracking` | `issue_created` | **enabled** | `01a03805-1775-7810-98b6-649e95fbcdd9` |
| `error_tracking` | `issue_reopened` | **enabled** | `01a03805-1ce8-7646-89e6-2b8938317763` |
| `error_tracking` | `issue_spiking` | **enabled** | `01a03805-2083-7310-9146-60701b50151b` |
| `session_replay` | `session_analysis_cluster` | **enabled** (sample_rate: 0.1) | `01a03805-24f0-7c27-acb6-fcf670ac8de4` |
| `conversations` | `ticket` | **enabled** (dormant until a channel is connected) | `01a03805-26bb-7346-8f4c-203ba8106bb1` |
| `replay_vision` | _(any)_ | **self-authorizing** — `emits_signals: true` on each scanner is the config | — |
| `llm_analytics` | — | **skipped** — no LLM/AI usage detected | — |
| `logs` | — | **skipped** — not a v1 responder | — |

---

## Connected tools

No external tools selected. The connected-tools question was declined (cancelled).

---

## Scout troop

**Run budget:** 100 runs/day (early access default), 0 used today. Banner: _"Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more."_

### Enabled (5 scouts)

| Scout | What it watches |
|---|---|
| `signals-scout-general` | Cross-product correlations and surfaces no specialist covers. Already enabled before this run. |
| `signals-scout-health-checks` | PostHog setup health issues weighted by blast radius — finds misconfigured SDKs and missing events. |
| `signals-scout-observability-gaps` | Events with significant volume but no insight, dashboard, or alert coverage — recommends what to build. |
| `signals-scout-product-analytics` | Saved funnels, retention, and lifecycle flows — fires when a derived rate regresses while entrants hold. |
| `signals-scout-web-analytics` | Per-channel session volume, attribution breakage, and landing-page health vs the site's own baseline. |

### Disabled (22 scouts)

| Scout | Reason |
|---|---|
| `signals-scout-error-tracking` | **Covered by the native error_tracking source** — disabling is intentional, not a gap. |
| `signals-scout-session-replay` | **Covered by the native session_replay source** — disabling is intentional, not a gap. |
| `signals-scout-ai-observability` | No LLM/AI usage detected in this project. Enable if you add AI features. |
| `signals-scout-anomaly-detection` | Deferred — enable once the project has accumulated baseline data. |
| `signals-scout-apm` | No distributed tracing / OpenTelemetry spans in this project. |
| `signals-scout-conversations` | Support product just enabled, no data yet. Enable once tickets are flowing. |
| `signals-scout-csp-violations` | No Content-Security-Policy reporting configured. |
| `signals-scout-customer-analytics` | No group/accounts analytics (B2B) in use. |
| `signals-scout-data-pipelines` | No CDP destinations, batch exports, or hog flows configured. |
| `signals-scout-data-warehouse` | No external warehouse sources connected. |
| `signals-scout-experiments` | No active A/B experiments. Enable if you start running experiments. |
| `signals-scout-feature-flags` | No feature flag usage detected in the codebase. |
| `signals-scout-inbox-validation` | Fresh setup — no shipped fixes to validate yet. Enable after the first resolved reports. |
| `signals-scout-insight-alerts` | No insight alerts configured. |
| `signals-scout-logs` | PostHog logs product not in use. |
| `signals-scout-mcp-tool-calls` | No `$mcp_tool_call` telemetry. |
| `signals-scout-replay-vision` | No pre-existing scanner observations to trend across yet. Enable once recordings accumulate. |
| `signals-scout-revenue-analytics` | No payment SDK detected (no Stripe, Paddle, etc.). |
| `signals-scout-skills-store` | Not relevant to this project's operational needs. |
| `signals-scout-surveys` | Zero surveys exist. Enable if you add PostHog surveys. |
| `signals-scout-tasks` | Not relevant to this project's operational needs. |
| `signals-scout-web-vitals` | No `$web_vitals` data yet. Enable once the app is capturing Core Web Vitals. |

---

## Custom scouts

**3 proposed, all declined by user.** The built-in troop was kept as-is.

Surfaces analysed and proposed:

| Candidate | Surface | Filter that killed it |
|---|---|---|
| `signals-scout-shipment-pipeline` | `shipment_created` → `shipment_received` / `shipment_cancelled` lifecycle | User declined |
| `signals-scout-stock-usage` | `stock_usage_logged` consumption volume changes | User declined |
| `signals-scout-stock-adjustments` | `stock_adjustment_made` frequency and quantity spikes | User declined |

These can be added later by re-running the Self-driving setup skill. If a custom scout turns noisy after creation, set `emit: false` on its config in PostHog to switch it to dry-run without disabling it.

---

## Replay Vision scanners

Scanners are LLMs that watch individual session recordings on a schedule and push findings straight into the Self-driving inbox. Findings arrive at **half weight** — a single scanner finding cannot reach the inbox alone; it needs corroboration from a second scan of the same defect. Both scanners were created with `emits_signals: true`.

The `creating-replay-vision-scanners` in-product skill was not available on this deploy (404), so monthly credit spend was not formally verified. Both scanners show **0 estimated monthly credits** as no recordings exist yet — they cost nothing until recordings begin.

This project has no recordings yet. The scanners are armed and will start working the day recordings begin, with no further setup.

### Breakage monitor — "Shipment receive flow breakage"

| Field | Value |
|---|---|
| Scanner ID | `01a0380d-1bda-7193-8b82-eb7999032df1` |
| What it watches | Sessions on any `/shipments` URL — the list (`/shipments`), detail (`/shipments/[id]`), and the receive step (`/shipments/[id]/receive`) |
| Why this flow | Receiving a shipment is the core operational completion step: it transitions fabric from in-transit to in-stock and updates product quantities. Breakage here is directly operationally costly. |
| Sampling rate | 0.5 (50% of matching sessions) |
| Credits/observation | 5 |
| Estimated monthly credits | 0 (no recordings yet) |
| Status | **Created** |

### Frustration monitor — "Inventory staff workflow frustration"

| Field | Value |
|---|---|
| Scanner ID | `01a0380d-51ec-7705-84dd-80a83575eb84` |
| What it watches | Sessions with at least one `$rageclick` event (project-wide — disjoint from the breakage monitor by design) |
| Sampling rate | 1.0 (100% of rage-click sessions) |
| Credits/observation | 5 |
| Estimated monthly credits | 0 (no recordings yet) |
| Status | **Created** |

---

## Follow-ups

- [ ] **Connect a Conversations inbound channel** — Go to PostHog Support settings and connect an email inbox, a Slack channel, or another inbound channel so the `conversations / ticket` source starts receiving tickets. Until then the responder row is enabled but silent.
- [ ] **Verify recordings are arriving** — Once the app receives real user sessions, confirm recordings appear at [Replay](https://us.posthog.com/project/575765/replay). The Replay Vision scanners and the session_replay signal source both depend on recordings existing.
- [ ] **Enable `signals-scout-anomaly-detection`** after a few weeks of data, once the project has accumulated enough baseline to make anomaly detection meaningful.
- [ ] **Enable `signals-scout-replay-vision`** once the Replay Vision scanners have accumulated observations to trend across.
- [ ] **Verify monthly credit spend** for the Replay Vision scanners once recordings start arriving — the `creating-replay-vision-scanners` in-product skill was not available on this deploy so the estimate step was skipped.
- [ ] **Consider custom scouts** for the shipment pipeline, stock usage patterns, and stock adjustment anomalies — all three surfaces passed the gap-analysis filters and were proposed but declined. Re-run the Self-driving setup skill to add them later.

---

## What happens next

- The scout coordinator picks up freshly-enabled configs within **~30 minutes** — the first scout runs fire on the next coordinator tick.
- Each enabled scout uses approximately one run from the project's daily budget of 100 runs/day (early access).
- Scout findings cluster into reports in the inbox; immediately-actionable ones can start coding tasks automatically.
- Replay Vision scanners sweep matching recordings every 5 minutes once recordings exist. Findings arrive at half weight and are promoted to full reports when corroborated.
- Check your inbox at: https://us.posthog.com/project/575765/inbox
