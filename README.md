# Mantle Distribution Lens - V17: fresh market data

V17 keeps the public multi-RPC foundation and refreshes published market evidence every fifteen minutes.

## What is new

- each asset receives a preferred provider from the three-provider pool
- if one endpoint fails, the updater tries the next healthy provider automatically
- checkpoints are still saved after each successful chunk
- the updater now processes up to 2 assets at the same time
- the local browser server still uses the same RPC pool idea

## New config file

- `data/catalog/rpc-pool.json`

The initial pool is Mantle Public RPC, PublicNode, and dRPC. All are public services; they may change availability or rate limits over time. You can disable any endpoint by changing its `enabled` value to `false`.

## Why this matters

The first historical snapshot of a new asset may still take a long time.
V12 does not pretend to make Mantle history tiny, but it improves throughput in a controlled way:

- it resumes from checkpoints instead of restarting from zero
- it can fail over to another provider instead of depending on only one endpoint
- it can keep two assets moving at the same time, each with its own preferred provider

## Testing flow

1. Open `Abrir-Mantle-Distribution-Lens.cmd`
2. In Chrome, use `http://127.0.0.1:4189`
3. Close the site
4. Run `Atualizar-Visao-Recente-30d.cmd` after the V12 historical updater is no longer running.
5. Confirm the updater reports `Research window: last 30 days` and `Parallel workers: 2`.
6. Confirm Fluxion routes report verification and quote simulations after the recent snapshots finish.
7. If the process is interrupted, run it again and confirm each asset resumes from its saved checkpoint

## Fluxion quote test

Run `Atualizar-Cotacoes-Fluxion.cmd` to refresh only Fluxion route validation and read-only USDC quote simulations. This does not scan blocks and does not execute a trade. It verifies the SPCXx direct route separately from the ranked Fluxion basket.

## Platform TVL view

Run `Atualizar-TVL-Plataformas.cmd` after refreshing a monitored source. The main card sums only platforms with a recorded pool observation. Fluxion values start as the public UI snapshot captured for the reviewed basket; Merchant Moe values are verified from pool reserves. A simulated purchase quote is never included in TVL.

## Final user flow

Visitors only open the Lens. They never run an updater and always see the most recently published data.

For a local maintainer refresh, run `Atualizar-Dados-Publicados.cmd`. It refreshes Fluxion route evidence, Merchant Moe pool TVL, and the compiled platform-TVL view without scanning block history.

For GitHub Pages, enable the included `.github/workflows/refresh-published-data.yml`. It runs the same refresh every fifteen minutes, commits changed `data/` files, and lets Pages publish the newest snapshot automatically. The TVL card shows the market-data age and warns when it is older than thirty minutes.

## Later UX roadmap (not part of the current release)

- Main card: show a simple **TVL total across monitored platforms**, with one short coverage disclaimer.
- Details area: show the split by platform, capture times, source type, executable quote, and later pool-depth treatment.
- Keep depth, price impact, and source methodology out of the first-screen summary so the Lens remains clear for beginner and intermediate investors.
- Do not treat a simulated quote as TVL; only include an amount in the total when it is a platform TVL observation or an independently verified pool-reserve valuation.

## Main files

- `scripts/update-snapshots.js`
- `server.js`
- `data/checkpoints/`
- `data/catalog/rpc-pool.json`

## Later roadmap (not part of the current release)

### Pool liquidity flow monitor

For a verified pool, inspect public on-chain transfers and Liquidity Book events to surface probable liquidity additions and withdrawals. The interface should show public wallet/contract addresses, transaction links, timestamps, amounts, and an explicit confidence label. It must never infer a real-world identity or present a swap as a confirmed liquidity withdrawal without corroborating evidence.

This is intentionally deferred until the core Lens is stable: asset snapshots, verified market routes, pool TVL, methodology, and beginner-friendly presentation come first.
