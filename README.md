# Launch Radar — token-radar-01 candidate

[![make.fun](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/dwi085/makefun-token-radar-r9/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard)
[![reward](https://make.fun/badge/token-radar-01/dwi085/makefun-token-radar-r9/reward.svg)](https://make.fun/bounty/token-radar-01)

A pre-token launch radar for [token-radar-01 on make.fun](https://make.fun/bounty/token-radar-01): it reads a sealed snapshot of every protocol and writes a web dashboard ranking the protocols with no token yet by what their launch would be worth, each with the steps to farm it.

## What it does

`main.ts` (Node 22, standard library only) reads `/input/snapshot.json` and:

- fits launch value on the 83 live-token comparables: ridge (λ=5) of ln(market cap) on ln(TVL) plus a category block — miss **×2.96 leave-one-out / ×3.11 walk-forward / ×2.92 5-fold**, against ×3.54 / ×3.46 / ×3.54 for a flat global multiple and ×3.94 / ×3.60 / ×3.99 for the current entry's flat category multiples, on the same held-out protocols and splits;
- fits token odds on 381 peers: logistic (IRLS, ridge λ=5) on years listed plus a category block — Brier **0.152 leave-one-out / 0.138 walk-forward** against a 0.171 / 0.163 constant base;
- keeps a term only when it beats a SHA-256-draw placebo's gain on all three held-out tests at once;
- reports honest P25–P75 ranges from bootstrap refits plus leave-one-out residuals (measured coverage 51.8% where 50% is stated; P10–P90 80.7% where 80% is stated);
- writes a 198-row board covering all 40 watchlist slugs, each row with a 9-step farm plan and a netted verdict (16 FARM / 147 MARGINAL / 34 THIN / 1 SKIP);
- writes the dashboard (`dashboard/`, 4 files) with a KPI strip, a proof strip that checks its own data at load, working filters and per-row detail, live comparables, outliers and the set-aside list — plus three screenshots of the real rendered page and a `dossier.json` built with the kit's `buildDossier`.

Two runs write byte-identical output. No network, no clock, no filesystem-order dependence.

## Run it

```sh
MAKEFUN_BOT_DIR=$PWD MAKEFUN_OUTPUT_DIR=out node main.ts --input <snapshot.json>
```

## Results

See [RESULTS.md](RESULTS.md) for the full comparison table, the verdict, and every honest caveat.

## License

MIT — see [LICENSE](LICENSE).
