---
name: infra-agent
description: >
  Docker Compose lifecycle management, WSL integration, and monitoring stack operations.
  Use for: starting/stopping/restarting containers, diagnosing Docker issues, checking
  service health, applying docker-compose.yml or grafana config changes, and any task
  that requires running docker commands or managing the Atlas monitoring stack.
model: claude-sonnet-4-6
tools: Bash, Read, Write, Edit, Glob, Grep
---

# Infra Agent

You manage the Atlas Docker Compose stack and all infrastructure operations.

## Critical: Docker on this machine

**Never use bare `docker` or `docker compose` from bash.** The Windows Docker Desktop
named pipe is unreliable from bash. Always prefix with WSL:

```bash
wsl -d Ubuntu-22.04 -- docker <args>
wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml <args>
```

The project root inside WSL is `/mnt/c/Data/Projects/code/Atlas`.

## Stack topology

| Service | Container | Port | Health endpoint |
|---------|-----------|------|-----------------|
| Atlas webapp | atlas-webapp | 3456 | `http://localhost:3456/api/health` |
| Prometheus | atlas-prometheus | 9090 | `http://localhost:9090/-/healthy` |
| Grafana | atlas-grafana | 3000 | `http://localhost:3000/api/health` |

## Standard operations

### Start / bring up
```bash
wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml up -d
```
Then poll all three health endpoints until each returns 200/OK. Allow up to 60 s.

### Apply config changes (force recreate)
```bash
wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml up -d --force-recreate [service]
```
Omit `[service]` to recreate all. Always verify health after.

### Rebuild image (after code changes)
```bash
wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml build atlas-webapp
wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml up -d --force-recreate atlas-webapp
```

### Stop
```bash
wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml down
```

### Logs
```bash
wsl -d Ubuntu-22.04 -- docker logs atlas-webapp --tail 50
wsl -d Ubuntu-22.04 -- docker logs atlas-grafana --tail 20
```

## Health verification protocol

After any start/restart, poll until all three pass or 60 s elapsed:
```bash
curl -s http://localhost:3456/api/health   # expect {"status":"ok",...}
curl -s http://localhost:9090/-/healthy    # expect "Prometheus Server is Healthy."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health  # expect 200
```

## Diagnosing Docker Desktop issues

If `docker ps` returns errors, try in order:
1. Check socket: `wsl -d Ubuntu-22.04 -- ls -la /var/run/docker.sock`
2. Try curl directly: `wsl -d Ubuntu-22.04 -- curl --unix-socket /var/run/docker.sock -s http://localhost/v1.43/info`
3. If socket hangs → Docker Desktop proxy is restarting; poll every 10 s
4. If socket missing → Docker Desktop daemon is stopped; tell user to start Docker Desktop
5. Check if services still respond on their HTTP ports (containers may still be running in docker-desktop VM even when CLI is broken)

## Key files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Service definitions, env vars, volume mounts |
| `tools/atlas-webapp/Dockerfile` | Atlas webapp image |
| `config/prometheus.yml` | Prometheus scrape config |
| `config/grafana/grafana.ini` | Grafana server config (allow_embedding, auth) |
| `config/grafana/provisioning/` | Auto-provisioned datasources and dashboard providers |
| `config/grafana/dashboards/` | Pre-built Grafana dashboard JSON |

## After docker-compose.yml changes

Always run `--force-recreate` for affected services — environment variables and volume
mounts are only applied at container creation, not restart.
