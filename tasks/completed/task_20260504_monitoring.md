---
id: task_20260504_monitoring
title: Enhanced Atlas monitoring — page health checks, Docker status, Grafana dashboard
status: completed
priority: high
created: 2026-05-04T23:00:00Z
assigned_to: orchestrator
---

## Goal

Make the Atlas monitoring stack reliable enough to be the primary signal for "is everything running?" — without needing to manually open pages or check containers. Covers three layers:

1. **Page health checks** — Prometheus probes every Atlas webapp route and alerts on non-200 or latency spikes
2. **Docker container status** — surface container state (running/stopped/unhealthy) and resource usage (CPU, RAM, restarts) in Prometheus
3. **Grafana dashboard** — single pane of glass for all the above

---

## Scope

### Routes to probe (Blackbox Exporter)

| Route | Expected status |
|-------|----------------|
| `http://atlas-webapp:3456/` | 200 |
| `http://atlas-webapp:3456/training` | 200 |
| `http://atlas-webapp:3456/organizer` | 200 |
| `http://atlas-webapp:3456/budget` | 200 |
| `http://atlas-webapp:3456/agents` | 200 |
| `http://atlas-webapp:3456/tasks` | 200 |
| `http://atlas-webapp:3456/docs` | 200 |
| `http://atlas-webapp:3456/calendar` | 200 |
| `http://atlas-webapp:3456/api/health` | 200 + body contains `"status":"ok"` |

### Docker / container metrics (cAdvisor)

- Container running state (`container_last_seen`, `container_tasks_state`)
- CPU usage per container
- Memory usage per container
- Restart count per container
- Docker socket availability (probe `unix:///var/run/docker.sock`)

### Grafana dashboard panels

1. **Page UP/DOWN** — stat panels per route, green/red
2. **HTTP response time** — time-series per route (p50, p95)
3. **Container status** — table: name | state | CPU% | RAM | restarts
4. **Container CPU** — time-series per container
5. **Container RAM** — time-series per container
6. **Prometheus self-health** — target scrape success rate

---

## Specialist agents needed

- `infra-agent` — add Blackbox Exporter + cAdvisor to docker-compose.yml; wire Prometheus scrape configs
- `coder` — add Grafana dashboard JSON provisioning file; update any prometheus.yml
- `reviewer` — review all config changes before apply

---

## Implementation plan

### Step 1 — Add Blackbox Exporter to docker-compose.yml

```yaml
blackbox-exporter:
  image: prom/blackbox-exporter:latest
  container_name: atlas-blackbox
  volumes:
    - ./config/blackbox.yml:/config/blackbox.yml:ro
  command: --config.file=/config/blackbox.yml
  networks:
    - atlas-net
```

### Step 2 — Create `config/blackbox.yml`

```yaml
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: [200]
      method: GET
      preferred_ip_protocol: ip4
```

### Step 3 — Add cAdvisor for Docker metrics

```yaml
cadvisor:
  image: gcr.io/cadvisor/cadvisor:latest
  container_name: atlas-cadvisor
  volumes:
    - /:/rootfs:ro
    - /var/run:/var/run:ro
    - /sys:/sys:ro
    - /var/lib/docker/:/var/lib/docker:ro
  networks:
    - atlas-net
```

### Step 4 — Update `config/prometheus.yml` scrape configs

Add:
- `blackbox_http` job scraping all 6 routes via relabel
- `cadvisor` job scraping `atlas-cadvisor:8080/metrics`

### Step 5 — Grafana dashboard provisioning

Create `config/grafana/dashboards/atlas-monitoring.json` with all 6 panels listed above.
Reference datasource uid `atlas-prometheus` (already provisioned).

### Step 6 — Recreate stack

```bash
wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml up -d --force-recreate
```

---

## Verification

- [ ] `http://localhost:9090/targets` — all blackbox and cadvisor targets show UP
- [ ] Grafana dashboard loads with all 6 panels populated
- [ ] Stopping `atlas-webapp` → page UP panels turn red within 15s
- [ ] Restarting `atlas-webapp` → panels turn green within 15s
- [ ] Container CPU/RAM panels show live data for all 3 services

## Risks

- cAdvisor requires `/var/run/docker.sock` mount inside WSL — check socket path vs Windows Docker Desktop interaction
- Grafana dashboard provisioning requires matching the existing datasource UID; verify with `GET /api/datasources` before writing JSON
