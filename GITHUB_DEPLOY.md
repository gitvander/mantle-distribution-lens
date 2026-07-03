# GitHub deploy guide

This folder is ready to be used as the root of a GitHub Pages repository.

## What runs online

- GitHub Pages serves `index.html`, `app.js`, `styles.css`, `assets/`, and `data/`.
- The public site does not run `server.js`.
- The public site reads the published JSON files in `data/`.
- GitHub Actions runs `.github/workflows/refresh-published-data.yml` every 15 minutes and can also be started manually.
- The updater refreshes the xStocks catalog, published snapshots, verified routes, monitored TVL, and route quotes, then commits changed `data/` files back to the repository.

## Recommended repository setup

1. Create a new GitHub repository, for example:
   `mantle-distribution-lens`
2. Upload or push the contents of this folder as the repository root.
   `index.html` must be at the top level of the repository.
3. In GitHub, open:
   `Settings -> Pages`
4. Set Pages source to:
   `GitHub Actions`
6. In GitHub, open:
   `Settings -> Actions -> General`
7. Under workflow permissions, allow:
   `Read and write permissions`
8. Open:
   `Actions -> Refresh published Lens data`
9. Click:
   `Run workflow`
10. After it finishes, open the GitHub Pages URL.

## Expected behavior

- Visitors only open the website.
- Visitors do not run updaters.
- The data age shown in the Lens should decrease after the scheduled workflow completes.
- If public RPC providers are slow or rate-limited, the workflow may finish with non-blocking warnings and keep the last good published data.

## Important limits

GitHub Pages is static hosting. It cannot run a live server, private backend, or hidden API key.
For this project, that is acceptable because the Lens publishes refreshed public JSON files through GitHub Actions.

The scheduled updater is designed for public infrastructure, but it is not a paid realtime data feed. It can be delayed by GitHub scheduling, public RPC limits, or third-party dapp availability.

## If Pages deploys fail

Use `Settings -> Pages -> Source -> GitHub Actions`.

This repository includes two Pages workflows:

- `Deploy static Lens site`: publishes the current site after normal pushes.
- `Refresh published Lens data`: refreshes `data/`, commits changes, and publishes the refreshed site.

This avoids relying on the older branch-based Pages builder after every bot commit.
