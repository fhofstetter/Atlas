# /stack-restart

Force-recreate one or all services in the Atlas monitoring stack and verify health after.

Usage:
- `/stack-restart` — recreate all three services
- `/stack-restart grafana` — recreate only Grafana
- `/stack-restart prometheus` — recreate only Prometheus
- `/stack-restart atlas-webapp` — rebuild and recreate the Atlas webapp

## Service name mapping

| Arg | docker-compose service name |
|-----|-----------------------------|
| `grafana` | `grafana` |
| `prometheus` | `prometheus` |
| `atlas-webapp` | `atlas-webapp` |
| (none) | all services |

## Steps

1. If restarting `atlas-webapp`, rebuild the image first:
   ```bash
   wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml build atlas-webapp
   ```

2. Force-recreate the target service(s):
   ```bash
   wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml up -d --force-recreate [service]
   ```

3. Poll health endpoints every 5 s, up to 60 s, for the affected service(s):
   - atlas-webapp: `curl -s http://localhost:3456/api/health` → `{"status":"ok"}`
   - prometheus: `curl -s http://localhost:9090/-/healthy` → HTTP 200
   - grafana: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health` → 200

4. Report the result: service name, new container uptime, health status.

## Common uses

- After changing `docker-compose.yml` env vars or volumes → `/stack-restart`
- After editing `config/grafana/grafana.ini` → `/stack-restart grafana`
- After editing `config/prometheus.yml` → `/stack-restart prometheus`
- After changing server.js or views → `/stack-restart atlas-webapp`
