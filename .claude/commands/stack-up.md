# /stack-up

Start the Atlas monitoring stack (atlas-webapp + Prometheus + Grafana) and verify
all three services are healthy. Optionally pass `--build` to rebuild the image first.

## Steps

1. Check args: if `--build` was passed, rebuild the atlas-webapp image first:
   ```bash
   wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml build atlas-webapp
   ```

2. Start all services:
   ```bash
   wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml up -d
   ```

3. Poll health endpoints every 5 s, up to 90 s total, until all three pass:
   - `http://localhost:3456/api/health` → `{"status":"ok"}`
   - `http://localhost:9090/-/healthy` → HTTP 200
   - `http://localhost:3000/api/health` → HTTP 200

4. Report final status — container names, uptime, which endpoints are up.

## If Docker CLI fails

If `wsl -d Ubuntu-22.04 -- docker ps` returns an error:
- "Cannot connect" or "Internal Server Error" → Docker Desktop is not running or still starting.
  Tell the user to open Docker Desktop and wait for it to finish starting, then rerun `/stack-up`.
- Do NOT retry indefinitely — tell the user what's needed and stop.

## Success output format

```
Stack is up.
  atlas-webapp  healthy  http://localhost:3456
  atlas-prometheus     healthy  http://localhost:9090
  atlas-grafana        healthy  http://localhost:3000
```
