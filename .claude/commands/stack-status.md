# /stack-status

Report the current health of the Atlas monitoring stack in one shot.

## Steps

Run all checks in parallel and report combined results:

1. **Docker container state:**
   ```bash
   wsl -d Ubuntu-22.04 -- docker ps --filter "name=atlas-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
   ```
   If docker CLI fails, note it and continue to HTTP checks (containers may still be alive).

2. **HTTP health endpoints** (check all three regardless of docker ps result):
   ```bash
   curl -s http://localhost:3456/api/health
   curl -s http://localhost:9090/-/healthy
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health
   ```

3. **Prometheus scrape status** (confirms metrics are flowing):
   ```bash
   curl -s "http://localhost:9090/api/v1/query?query=up" 
   ```
   Check that `atlas-webapp` target shows value `1`.

## Output format

Report as a table:

```
SERVICE               CONTAINER     HTTP    NOTES
atlas-webapp   Up 2h (healthy)  200  uptime: 7200s, 4 products tracked
atlas-prometheus      Up 2h            200  scraping price-tracker every 15s
atlas-grafana         Up 2h            200  dashboard: /d/atlas-webapp
```

Flag any service that is down, unhealthy, or not scraping.
If all are healthy, end with: "Stack fully operational."
If Docker CLI is broken but HTTP works, note: "Docker CLI unavailable (Docker Desktop issue) — services running."
