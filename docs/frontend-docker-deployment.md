# Frontend Docker deployment

The production host can reach the npm registry, while Docker bridge networking may time out during dependency installation. For that environment, `docker-compose.yml` sets `build.network: host`. This applies only to Docker build steps. The nginx runtime container still uses the normal Compose network and the external `iam-crm-backend_default` network; runtime host networking is not enabled.

The Dockerfile copies the root manifests, `.npmrc`, `apps/web/package.json`, and `packages/ui/package.json` before running `npm ci`. Docker can therefore reuse the dependency layer when only TypeScript, TSX, styles, or other application source changes. Any package manifest, lockfile, or npm configuration change correctly invalidates that layer.

Normal deployment remains:

```sh
git pull --ff-only origin main
docker compose build frontend-shadcn
docker compose up -d frontend-shadcn
```

The Compose file uses the current Compose Specification `build.network` field and requires Docker Compose v2 on a Linux production host. Confirm with `docker compose config` after upgrading Docker/Compose.

To diagnose registry access through host networking:

```sh
docker run --rm --network=host node:22-bookworm-slim \
  node -e "fetch('https://registry.npmjs.org/').then(r => console.log(r.status)).catch(e => { console.error(e); process.exit(1) })"
```

If Docker bridge connectivity becomes reliable in the future, remove only `build.network: host` after confirming the registry test and a clean `docker compose build frontend-shadcn` both succeed without it.
