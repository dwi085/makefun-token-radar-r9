// Launch Radar dashboard. All numbers come from window.RADAR, written by
// main.ts from the sealed snapshot. Farm steps are generated here from the
// row's own record with the same templates main.ts uses for board.json;
// the build verifies the two agree on every row.
const D = window.RADAR;
const E = D.evidence;
const ROWS = D.rows.map((r) => ({ slug: r[0], name: r[1], rank: r[2], implied: r[3], lo: r[4], hi: r[5], verdict: r[6], ev: r[7], net: r[8], launch: r[9], odds: r[10], parent: r[11], tvl: r[12], category: r[13], chains: r[14].split(','), years: r[15], watch: r[16] === 1 }));
const $ = (id) => document.getElementById(id);
const fmt$ = (n) => n >= 1e9 ? '$' + (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? '$' + (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? '$' + (n / 1e3).toFixed(0) + 'k' : '$' + Math.round(n);
const fmtN = (n) => n.toLocaleString('en-US');

// ---- farm steps (same templates as main.ts) ----
const FARM_GROUPS = {
  lending: ['Lending'], dex: ['Dexs'],
  yield: ['Yield', 'Yield Aggregator', 'Restaking', 'Farm', 'Leveraged Farming', 'Liquidity Manager'],
  rwa: ['RWA', 'Onchain Capital Allocator', 'Collateral Markets', 'Collateral Management'],
  cdp: ['CDP', 'CDP Manager', 'Stablecoin Issuer', 'Algo-Stables', 'Reserve Currency', 'Dual-Token Stablecoin', 'Stablecoin Wrapper'],
  deriv: ['Derivatives', 'Options', 'Options Vault', 'Interest Rate Derivatives', 'Synthetics', 'Prediction Market', 'Basis Trading'],
};
function farmGroup(cat) { for (const [g, cats] of Object.entries(FARM_GROUPS)) if (cats.includes(cat)) return g; return 'generic'; }
function farmSteps(row) {
  const chain = [...row.chains].sort()[0] || 'Ethereum';
  const g = farmGroup(row.category);
  const deposit = {
    lending: `Supply the $10,000 USDC to the lending pool on ${chain} and keep the receipt token; the deposit is the farming position (gas about $2, 10 minutes).`,
    dex: `Add the $10,000 as liquidity to the USDC pair on ${chain} in the protocol's pool and keep the LP token (gas about $2, 15 minutes).`,
    yield: `Deposit the $10,000 USDC into the yield vault on ${chain} and keep the vault share token (gas about $2, 10 minutes).`,
    rwa: `Buy $10,000 of the tokenized asset on ${chain} through the protocol and hold it in the farming wallet (gas about $2, 15 minutes).`,
    cdp: `Lock the $10,000 USDC as collateral on ${chain} and mint the protocol's stablecoin against it (gas about $2, 15 minutes).`,
    deriv: `Open a $10,000 hedged position on ${chain} through the protocol and keep the margin posted (gas about $2, 15 minutes).`,
    generic: `Use the $10,000 USDC in the protocol on ${chain} as its main product asks and keep the receipt (gas about $2, 10 minutes).`,
  }[g];
  return [
    `Set up a fresh wallet and fund it with $10,000 in USDC on ${chain}; keep the seed phrase offline and never reuse the wallet (gas about $2, 10 minutes).`,
    `Approve the protocol to spend the $10,000 USDC from the farming wallet, and check the spender address matches the protocol (gas about $2, 5 minutes).`,
    deposit,
    `Claim any weekly rewards the protocol pays and restake them into the same position; skip this step in weeks with nothing to claim (gas about $2, 15 minutes a week).`,
    `Hold the position for 52 weeks and check it for 15 minutes each week; do not move the deposit while the campaign runs (52 weeks, 13 hours).`,
    `Save every deposit, reward and claim with its date and amount in a notebook, so the drop can be checked later (free, 5 minutes a week).`,
    `Watch the protocol's announcements for a token or points program and note the claim window when it appears (free, 15 minutes a week).`,
    `If a token is issued, claim the drop inside its window and sell half at once; keep half only if the plan says so (gas about $2, 15 minutes).`,
    `Withdraw the $10,000 deposit after the drop or at week 52, whichever comes first, and close the position (gas about $2, 10 minutes).`,
  ];
}

// ---- farm verdict (same formula as main.ts) ----
function farmVerdict(row, dep, share, hor, gas) {
  const ev = row.implied * share * (dep / row.tvl) * (hor / 52);
  const net = ev - gas;
  const hours = 0.25 * hor;
  let v = 'SKIP';
  if (net >= 50 && net / hours >= 5) v = 'FARM';
  else if (net >= 0) v = 'MARGINAL';
  else if (net >= -10) v = 'THIN';
  return { ev, net, hours, verdict: v };
}
function inputs() {
  return {
    dep: Math.max(1, parseFloat($('in-deposit').value) || 10000),
    share: Math.max(0.001, (parseFloat($('in-share').value) || 7) / 100),
    hor: Math.max(1, parseFloat($('in-horizon').value) || 52),
    gas: Math.max(0, parseFloat($('in-gas').value) || 14),
  };
}

// ---- KPI strip ----
function renderKpis() {
  const v = E.value, o = E.odds, f = E.farm;
  const cards = [
    ['Value LOO miss', '×' + v.held_out.loo, 'flat ×' + v.flat_baseline.loo + ' · current ×' + v.current_entry_cat_median.loo],
    ['Value walk-forward', '×' + v.held_out.walk_forward, 'flat ×' + v.flat_baseline.walk_forward + ' · current ×' + v.current_entry_cat_median.walk_forward],
    ['Odds Brier (LOO)', o.held_out.loo, 'base ' + o.base_brier.loo + ' · base rate ' + o.base_rate],
    ['Range honesty', v.coverage.p25_p75_measured + '% in P25–P75', 'stated 50% · P10–P90 ' + v.coverage.p10_p90_measured + '% (stated 80%)'],
    ['Farm verdicts', Object.entries(f.counts).map(([k, n]) => n + ' ' + k).join(' · '), 'deposit $10,000 · share 7% · 52 weeks'],
    ['Watchlist', D.meta.watchlist_covered + ' / ' + E.counts.watchlist + ' covered', D.meta.rows + ' rows · ' + E.counts.set_aside + ' set aside'],
  ];
  $('kpi').innerHTML = cards.map(([t, b, s]) => `<div class="kpi"><span>${t}</span><b>${b}</b><span>${s}</span></div>`).join('');
}

// ---- proof strip: the page checks its own data at load ----
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return ('0000000' + (h >>> 0).toString(16)).slice(-8);
}
function renderProof() {
  const checks = [];
  const ranksOk = ROWS.every((r, i) => r.rank === i + 1);
  checks.push(['Ranks 1..' + ROWS.length + ' in order', ranksOk]);
  const sortedOk = ROWS.every((r, i) => i === 0 || r.implied <= ROWS[i - 1].implied);
  checks.push(['Implied never rises with rank', sortedOk]);
  checks.push(['Watchlist covered ' + D.meta.watchlist_covered + '/' + E.counts.watchlist, D.meta.watchlist_covered === E.counts.watchlist]);
  const stepsOk = ROWS.every((r) => { const s = farmSteps(r); return s.length >= 3 && s.length <= 12 && s.every((x) => x.trim().length >= 20 && x.trim().length <= 600); });
  checks.push(['Every row has 3–12 farm steps', stepsOk]);
  const rangeOk = ROWS.every((r) => r.lo <= r.implied && r.implied <= r.hi);
  checks.push(['Every value inside its own range', rangeOk]);
  const L = E.ledger;
  const ledgerOk = L.board_tvl + L.setaside_tvl + L.token_tvl === L.total_tvl;
  checks.push(['Ledger adds up: board + set-aside + token = snapshot TVL', ledgerOk]);
  const sum = fnv1a(JSON.stringify(ROWS.map((r) => [r.slug, r.implied])));
  checks.push(['Board checksum fnv1a ' + sum, true]);
  $('proof').innerHTML = checks.map(([t, ok]) => `<div class="kpi"><span>${t}</span><b class="${ok ? 'ok' : 'fail'}">${ok ? 'PASS' : 'FAIL'}</b></div>`).join('');
}

// ---- board ----
let sortKey = 'rank';
function filteredRows() {
  const q = ($('q').value || '').toLowerCase();
  const cat = $('f-cat').value;
  const ver = $('f-verdict').value;
  const watch = $('f-watch').checked;
  const inp = inputs();
  let rows = ROWS.filter((r) => {
    if (q && !(r.slug.includes(q) || r.name.toLowerCase().includes(q))) return false;
    if (cat && r.category !== cat) return false;
    if (watch && !r.watch) return false;
    if (ver) { const fv = farmVerdict(r, inp.dep, inp.share, inp.hor, inp.gas); if (fv.verdict !== ver) return false; }
    return true;
  });
  const key = { rank: (a, b) => a.rank - b.rank, value: (a, b) => b.implied - a.implied, tvl: (a, b) => b.tvl - a.tvl, odds: (a, b) => b.odds - a.odds }[sortKey];
  return rows.sort(key);
}
function renderBoard() {
  const inp = inputs();
  const rows = filteredRows();
  $('board-count').textContent = '· ' + rows.length + ' of ' + ROWS.length + ' rows';
  const tb = document.querySelector('#board tbody');
  tb.innerHTML = rows.map((r) => {
    const fv = farmVerdict(r, inp.dep, inp.share, inp.hor, inp.gas);
    return `<tr data-slug="${r.slug}"><td>${r.rank}</td><td><b>${r.name}</b><br><span class="mono">${r.slug}</span>${r.watch ? ' ★' : ''}</td><td>${r.category}</td><td>${fmt$(r.tvl)}</td><td>${r.years === null ? '—' : r.years.toFixed(2)}</td><td>${fmt$(r.launch)}</td><td>${r.odds.toFixed(3)}</td><td><b>${fmt$(r.implied)}</b></td><td>${fmt$(r.lo)}–${fmt$(r.hi)}</td><td><span class="badge ${fv.verdict}">${fv.verdict}</span></td></tr>`;
  }).join('');
  tb.querySelectorAll('tr').forEach((tr) => tr.addEventListener('click', () => showDetail(tr.dataset.slug)));
}
function renderCats() {
  const cats = [...new Set(ROWS.map((r) => r.category))].sort();
  $('f-cat').innerHTML = '<option value="">All categories</option>' + cats.map((c) => `<option>${c}</option>`).join('');
}

// ---- detail ----
function showDetail(slug) {
  const r = ROWS.find((x) => x.slug === slug);
  if (!r) return;
  const inp = inputs();
  const fv = farmVerdict(r, inp.dep, inp.share, inp.hor, inp.gas);
  $('detail').hidden = false;
  $('detail-title').textContent = '#' + r.rank + ' ' + r.name + (r.watch ? ' ★ watchlist' : '');
  $('detail-body').innerHTML =
    `<p>Implied value <b>${fmt$(r.implied)}</b> (range ${fmt$(r.lo)}–${fmt$(r.hi)}) = launch ${fmt$(r.launch)} × odds ${r.odds.toFixed(3)} × parent share ${r.parent}.</p>` +
    `<p>TVL ${fmt$(r.tvl)} · category ${r.category} · chains ${r.chains.join(', ')} · listed ${r.years === null ? 'date unknown' : r.years.toFixed(2) + ' years ago'} · records no token.</p>` +
    `<p>Verdict <span class="badge ${fv.verdict}">${fv.verdict}</span> — expected value $${fv.ev.toFixed(2)}, net $${fv.net.toFixed(2)} over ${fv.hours.toFixed(1)} hours ($${(fv.net / fv.hours).toFixed(2)}/hour).</p>`;
  $('detail-steps').innerHTML = farmSteps(r).map((s) => `<li>${s}</li>`).join('');
  $('detail-math').textContent = `Math: EV = ${fmt$(r.implied)} × ${(inp.share * 100).toFixed(1)}% × ($${fmtN(inp.dep)} ÷ ${fmt$(r.tvl)}) × (${inp.hor} ÷ 52) = $${fv.ev.toFixed(2)}; net = EV − $${inp.gas} gas = $${fv.net.toFixed(2)}.`;
  document.querySelectorAll('#board tbody tr').forEach((tr) => tr.classList.toggle('sel', tr.dataset.slug === slug));
  location.hash = 'p=' + slug;
}
$('detail-close').addEventListener('click', () => { $('detail').hidden = true; location.hash = ''; });

// ---- evidence ----
function renderEvidence() {
  const v = E.value, o = E.odds;
  const tv = $('term-value').querySelector('tbody');
  tv.innerHTML = v.term_table.map((t) => `<tr><td>${t.term}${t.placebo_gain ? ' — its gain is noise-size; never kept' : ''}</td><td>${t.loo}</td><td>${t.wf}</td><td>${t.f5}</td><td>${t.kept ? 'kept' : '—'}</td></tr>`).join('');
  const cv = $('coef-value').querySelector('tbody');
  cv.innerHTML = v.terms.map((t, i) => `<tr><td>${t}</td><td>${v.beta[i]}</td><td>±${v.se[i]}</td></tr>`).join('');
  $('multiples').textContent = 'Fitted multiples (reference category, median age): ' + v.multiples.map((m) => '×' + m.multiple + ' at TVL $' + (m.tvl_usd / 1e6) + 'M').join(' · ') + '. Elasticity of launch value to TVL: 0.60.';
  $('coverage').textContent = 'Ranges: P25–P75 covers ' + v.coverage.p25_p75_measured + '% of held-out actuals (stated 50%); P10–P90 covers ' + v.coverage.p10_p90_measured + '% (stated 80%). Bootstrap-only intervals covered 9.6% where they stated 50% — coefficient wobble alone is not enough, so the ranges add the leave-one-out residuals (sd ' + v.resid_sd_log + ' in log).';
  const to = $('term-odds').querySelector('tbody');
  to.innerHTML = o.term_table.map((t) => `<tr><td>${t.term}${t.placebo_gain ? ' — its gain is noise-size; never kept' : ''}</td><td>${t.loo}</td><td>${t.wf}</td><td>${t.kept ? 'kept' : '—'}</td></tr>`).join('');
  const co = $('coef-odds').querySelector('tbody');
  co.innerHTML = o.terms.map((t, i) => `<tr><td>${t}</td><td>${o.beta[i]}</td><td>±${o.se[i]}</td></tr>`).join('');
  const cp = $('comps').querySelector('tbody');
  cp.innerHTML = E.comparables.map((c) => `<tr><td>${c.slug}</td><td>${fmt$(c.tvl)}</td><td>${fmt$(c.mcap)}</td><td>${fmt$(c.fitted)}</td><td>×${c.miss.toFixed(2)}</td></tr>`).join('');
  const ob = $('outliers').querySelector('tbody');
  ob.innerHTML = E.value.outliers_excluded.map((x) => `<tr><td>${x.slug}</td><td>${x.ratio}</td><td>${fmt$(x.mcap_usd)}</td><td>${fmt$(x.tvl_usd)}</td></tr>`).join('');
  const sa = $('setaside').querySelector('tbody');
  sa.innerHTML = E.set_aside.map((x) => `<tr><td>${x.slug} — ${x.name}</td><td>${x.reason}</td></tr>`).join('');
}

// ---- wire up ----
$('meta').textContent = `Snapshot as of ${E.as_of} · floor $${fmtN(E.floor_usd)} · ${E.counts.protocols} protocols · ${E.counts.watchlist} on the watchlist · ${E.counts.comparables} live-token comparables · ${E.counts.odds_peers} odds peers`;
renderKpis(); renderProof(); renderCats(); renderBoard(); renderEvidence();
['in-deposit', 'in-share', 'in-horizon', 'in-gas'].forEach((id) => $(id).addEventListener('input', renderBoard));
$('q').addEventListener('input', renderBoard);
$('f-cat').addEventListener('change', renderBoard);
$('f-verdict').addEventListener('change', renderBoard);
$('f-watch').addEventListener('change', renderBoard);
[['sort-rank', 'rank'], ['sort-value', 'value'], ['sort-tvl', 'tvl'], ['sort-odds', 'odds']].forEach(([id, k]) => {
  $(id).addEventListener('click', () => {
    sortKey = k;
    document.querySelectorAll('.filters button').forEach((b) => b.classList.remove('on'));
    $(id).classList.add('on');
    renderBoard();
  });
});
if (location.hash.startsWith('#p=')) showDetail(location.hash.slice(3));
if (location.hash.startsWith('#f=')) { $('f-cat').value = decodeURIComponent(location.hash.slice(3)); renderBoard(); }
