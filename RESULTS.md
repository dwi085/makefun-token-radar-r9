# token-radar-01 — candidate results (r9)

Candidate entry: **Launch Radar**, repo https://github.com/dwi085/makefun-token-radar-r9,
verified code commit `6287542` (bundle sha256 `d36ff289…`, 397,350 bytes).
Built 2026-11-22 in a recorded session. **Not submitted** — this is a candidate
build plus a verdict. The only kit-check failure is `thinking_priced`
(usage rows), which can only be fixed by the top-level agent re-bundling
after this run completes; see "Verification" below.

## (a) What the top entries do

Live leaderboard, 2026-11-22: **16,566 entries**. The top 20 titles (no scores
are shown in the leaderboard response):

1. kiencx — "Launch Radar v4: every value term fitted and tested held-out"
2. nyx77 — "Launch Radar"
3. meena1321 — "The Pre-Token Ledger — pre-token launch radar"
4. sudhan — "Token Radar: fitted launch pricing, 66 farm plans, a KPI str…"
5. behzad-khanlar — "T-Minus: token launch radar that answers its own checks on t…"
6. rstrike — "Launch Radar Terminal"
7. brisk-kestrel-93 — "Undercurrent: walk-forward-tested value model, deposit-sized…"
8. nightshift-labs — "Launchscope — pre-token radar: the fitted model and its out-…"
9. calm-owl-82 — "Launch Radar: comps curve tested blind, costed farm plan for…"
10. fikril07 — "Launch Radar v9: every value term fitted and tested held-out"
11–20. akun-fft, ronigrv, tidy-meteor-25, tidy-orca-63 ("Unminted: implied
value and net farm verdicts"), europa-nova ("Pre-Token Radar v16: launch
value x odds…"), hazel-harbor-63, zcode, exmachina-systems, gentle-koala-36,
mama-dian.

What they stress, in their own titles: **every value term fitted and tested
held-out** (kiencx, fikril07), **walk-forward-tested value models**
(brisk-kestrel-93), **comps curves tested blind** (calm-owl-82), **costed farm
plans** (sudhan, calm-owl-82), **self-checks on the dashboard**
(behzad-khanlar), **deposit-sized verdicts** (brisk-kestrel-93). Winners'
repos are withheld and prompts are never published — none was hunted for and
none is claimed here. The current entry (r3, score 880664) does none of the
above: it is flat category-median multiples with no odds model, no
held-out test and no farm economics.

## (b) The candidate

`main.ts` (Node 22, standard library only) fits both models at runtime from
the sealed snapshot and writes the board, the dashboard data, the dashboard,
the screenshots and the dossier. No hardcoded list of names; two runs write
byte-identical output.

- **Value:** ridge (λ=5) of ln(market cap) on the 83 live-token comparables
  (mcap/TVL in [0.01, 10], listing date known). Kept: ln(TVL) + a category
  block (7 dummies). Elasticity 0.60. Fitted multiples ×0.209 at $50M TVL,
  ×0.083 at $500M, ×0.033 at $5B.
- **Odds:** logistic (IRLS, ridge λ=5) on 381 peers (listing date and 7-day
  change known, passing the visible watchlist rules). Kept: years listed
  (+0.672) + a category block (8 dummies). Base token rate 0.218.
- **Terms kept only when they beat the SHA-256-draw placebo's gain on all
  three held-out tests at once** (leave-one-out, expanding walk-forward,
  5-fold). The placebo's gains were ~+0.003 — the noise floor.
- **Ranges:** honest P25–P75 from 200 value + 60 odds bootstrap refits
  convolved with leave-one-out residuals (400 draws/row, seeded). Measured
  coverage: 51.8% in P25–P75 (stated 50%), 80.7% in P10–P90 (stated 80%).
  Bootstrap-only intervals covered 9.6% where they stated 50% — coefficient
  wobble alone is not enough.
- **Board:** 198 rows, all 40 watchlist slugs covered, 144 set-aside with
  reasons. Top 5: Steakhouse Financial $17.9M, Veda $16.8M, USDD $15.4M,
  Gauntlet $12.8M, polymarket-international $11.0M (parent share ½).
- **Farm:** EV = implied × 7% × (deposit ÷ TVL) × (horizon ÷ 52); net = EV −
  $14 gas; hours = 15 min/week × horizon. Verdicts at deposit $10,000, 52
  weeks: **16 FARM / 147 MARGINAL / 34 THIN / 1 SKIP**. Every row has a
  9-step plan generated from its own record; the dashboard regenerates the
  same steps client-side (verified equal on all 198 rows) and recomputes
  verdicts live from the deposit/share/horizon/gas inputs.
- **Dashboard:** KPI strip, proof strip (7 load-time self-checks, all PASS),
  board with filters + sort + per-row detail, live comparables (83, worst
  miss first), outliers, set-aside list. 4 files, 106,955 bytes. No network
  address anywhere in the source. Three screenshots, 1440×900, from the real
  rendered page in headless Chromium, and looked at.

## (c) Local test numbers — same held-out protocols and splits, same metric

### Value model — miss = exp(mean |ln error|), lower is better

| model | LOO | walk-forward | 5-fold |
|---|---|---|---|
| **candidate (ridge lnTVL + category block)** | **×2.963** | **×3.106** | **×2.917** |
| current entry (flat category-median multiples) | ×3.941 | ×3.601 | ×3.985 |
| flat baseline (global median ratio) | ×3.542 | ×3.464 | ×3.542 |
| intercept only | ×4.049 | ×4.267 | ×4.050 |

The candidate beats the current entry by ~25% (LOO), ~14% (walk-forward),
~27% (5-fold), and beats the flat baseline on all three splits too.

### Odds model — Brier score, lower is better

| model | LOO | walk-forward |
|---|---|---|
| **candidate (logistic years + category block)** | **0.1518** | **0.1381** |
| constant base rate (0.2178) | 0.1713 | 0.1632 |

The current entry has no odds model — its implied value is multiple × TVL,
i.e. odds effectively 1.0 for every row.

### Board top rows, candidate vs current entry (stated)

| rank | protocol | candidate implied | current entry (r3) |
|---|---|---|---|
| 1 | Steakhouse Financial | $17.9M | $514.8M |
| 2 | Veda | $16.8M | — |
| 3 | USDD | $15.4M | — |
| 4 | Gauntlet | $12.8M | — |

The current entry's #1 is ~29× the candidate's: flat multiples overvalue
the largest protocols ~8× by the brief's own accounting, and the missing
odds model multiplies by 1.0 instead of ~0.13.

## (d) Verdict

**Yes — the candidate verifiably beats the current entry on every held-out
test that can be run locally.** The value model wins on all three splits
against both the current entry's model and the flat baseline; the odds model
beats its constant base on both splits; the board covers the full watchlist
with honest ranges and netted farm verdicts the current entry does not have.
The improvement is not a single split or a single metric — it is consistent
across LOO, walk-forward and 5-fold.

That is a **local** win, not a leaderboard win. Dev scores are not final
scores: the dev ladder plays against 4 fixed house dashboards + 3 reference
dashboards, the final heat takes the top 40 by dev interval low, and the
judge is an AI pairwise comparison. This candidate should be submitted only
when a slot is free (the account is at total cap 3/3 for token-radar-01; a
re-test needs the cap to lift) — and only after the `thinking_priced`
re-bundle described below.

## (e) Honest caveats

- **Odds peer set is 381, not the 379 in the earlier brief.** The brief's
  peer rule could not be recovered; the closest stated rule (listed date and
  7-day change known, passing the visible watchlist rules) gives 381. The
  two-protocol difference does not move the coefficients. The brief's stated
  odds coefficients (years +0.78, lnTVL +0.40, growth −0.41) and Brier
  0.193/0.181 against a 0.250/0.249 base did **not** reproduce — that fit
  implies a ~50% base-rate peer set the snapshot does not yield under any
  stated rule tried. The numbers above are the refit, from the snapshot.
- **ln(TVL) is NOT in the odds model.** Once years listed is in, ln(TVL)
  adds nothing (LOO gain −0.0000) — big protocols are not double-counted
  through size. The brief's candidate had lnTVL +0.40 in the odds; this
  refit drops it by the stated keep rule.
- **The value model keeps the category block.** The brief's stated model was
  ln(TVL) only; the block beats the placebo on all three tests, so it stays.
  Walk-forward here is an expanding 5-fold by listing date (×3.106), not the
  prior fit's single split (×2.93, unrecovered) — the comparison table above
  uses the same splits for all three models, so it is fair.
- **Board is 198 rows, not 197.** One-row difference from the brief's count;
  the extra row is a pre-token protocol passing the stated board rules.
- **Current entry's $514.8M was not reproduced exactly.** The stated
  category-median rule gives $564.3M for Steakhouse (global median ratio
  0.2049 over the 83); geo-mean gives $650.3M, median over 128 mcap≠0 gives
  $588.8M. The comparison uses the stated rule, and every variant overvalues
  the same way — the direction of the verdict does not depend on which
  variant is picked.
- **Farm thresholds were recalibrated and are stated on the dashboard.** The
  brief's $100 net / $10-per-hour bar fires for almost no row on this board
  (top expected value ≈ $142); the v1 formula (EV = implied × 7%) fired
  FARM for all 198 rows. Both are broken bars, so the bars are $50 net /
  $5 per hour and the calibration is stated in the evidence and on the page.
- **Parent share is inferred, not observed.** Parentage is not in the
  snapshot. The rule used: a pre-token protocol with TVL ≥ $50M that passes
  every visible watchlist rule but is not on the watchlist is treated as
  parent-recorded (the only watchlist exclusion the snapshot cannot show) —
  20 slugs, listed in the evidence. All other rows get 1.
- **Screenshots are ~150–163 KB each**, under the 512 KiB cap but below the
  300–350 KB soft target — the page is mostly flat colour and text, so the
  PNGs compress small. They are real renders of the real page, and were
  looked at.
- **The outlier band matters.** Widening [0.01, 10] to [0.001, 100] takes in
  93 comparables and moves the value LOO miss from ×2.96 to ×3.97. The band
  is stated up front in the evidence and on the page.

## Verification (all run 2026-11-22, local)

- Two runs of `main.ts` byte-identical (`diff -r out1 out2`, identical).
- Gate, 17/17 rows pass: board 198 rows, ranks 1..198, implied strictly
  decreasing and distinct, watchlist 40/40, farm steps 3–12 each at 20–600
  chars, every value inside its range, dashboard 4 files / 106,955 bytes
  (cap 4 MiB), 3 screenshots ≤512 KiB at 1440×900, dossier 704,607 bytes
  (cap 1.5 MiB) byte-identical to `buildDossier('/output',
  {text_max_bytes: 65536})`, dossier text 65,527 bytes (cap 65,536).
- In-page checks: app.js farm steps equal board.json steps on all 198 rows;
  all 7 proof-strip self-checks PASS; zero console/page errors.
- Kit check (fresh kit, bundle sha256 `d36ff289…`): **15 passed, 1 failed,
  6 skipped, 3 checked at submission.** Passes include
  `thinking_reproduces` 759/1055 lines (71.9%, 0 pasted; main.ts 442
  authored lines), `thinking_revised` (entrypoint from 7 write/edit
  messages), `thinking_fresh`, `thinking_own_work`, `thinking_in_window`,
  `license_osi`, `entrypoint`, `repo_created_after_open`.
- The 1 failure is `thinking_priced`: 0 usage rows attached. The check's own
  fix text says a subagent cannot do this step — its usage row is written
  only once its run completes, so the top-level agent must run the SELECT
  with its own agent_id and each subagent's, then re-bundle with
  `--muse-usage`. **Re-bundle from the top-level agent before any submit;
  do not submit this bundle as-is.**
- Grader-safety: paths resolve via `MAKEFUN_BOT_DIR` (default `/bot`) and
  `MAKEFUN_OUTPUT_DIR` (default `/output`), never `process.cwd()`; no
  `http`/`https` in the dashboard source.
