# Published data

This folder is the lightweight, shared data layer for the static site.

- `registry.json` lists tracked Mantle assets and their snapshot paths.
- `snapshots/<asset>.json` contains a compact, precomputed lifetime summary.

The updater records only aggregates and public identifiers needed by the site. It does not publish private data, wallet keys, or raw user information.

The first snapshot is created by running `node scripts/update-snapshots.js`. Later runs read each snapshot's `lastIndexedBlock` and fetch only newly produced blocks.
