# Docker on This Machine

All agents must use the WSL prefix for every Docker command. Never run bare `docker` or
`docker compose` from bash — Docker runs natively in WSL2 Ubuntu-22.04 via systemd.

**Docker Desktop is not installed.** Docker Engine runs purely inside Ubuntu-22.04.

## Command patterns

Always set `MSYS_NO_PATHCONV=1` to prevent Git Bash from mangling WSL paths:

```bash
# Docker CLI
MSYS_NO_PATHCONV=1 wsl -d Ubuntu-22.04 -- docker <args>

# Docker Compose (always pass the full path)
MSYS_NO_PATHCONV=1 wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml <args>

# Admin operations (systemd, root)
MSYS_NO_PATHCONV=1 wsl -d Ubuntu-22.04 -u root -- systemctl <args>
```

The project root inside WSL is `/mnt/c/Data/Projects/code/Atlas`.

## Stack topology

| Service | Container | Port | Health endpoint |
|---------|-----------|------|-----------------|
| Atlas webapp | `atlas-webapp` | 3456 | `http://localhost:3456/api/health` → `{"status":"ok"}` |
| Prometheus | `atlas-prometheus` | 9090 | `http://localhost:9090/-/healthy` → 200 |
| Grafana | `atlas-grafana` | 3000 | `http://localhost:3000/api/health` → 200 |

## Reliable health check

Use `docker inspect` — not curl — as the primary health signal.

```bash
MSYS_NO_PATHCONV=1 wsl -d Ubuntu-22.04 -- docker inspect atlas-webapp --format '{{.State.Health.Status}}'
# returns: healthy | starting | unhealthy | (empty = container missing)
```

## If the Docker socket is broken

Symptom: `docker ps` returns "Cannot connect to the Docker daemon".
Cause: Docker service stopped or hit systemd start-limit.

Fix:
```bash
MSYS_NO_PATHCONV=1 wsl -d Ubuntu-22.04 -u root -- systemctl reset-failed docker.service
MSYS_NO_PATHCONV=1 wsl -d Ubuntu-22.04 -u root -- systemctl start docker.service
```

Verify: `MSYS_NO_PATHCONV=1 wsl -d Ubuntu-22.04 -- docker info` should succeed.

## Auto-start on Windows login

A systemd service `atlas-stack.service` and a Windows Task Scheduler task "Atlas Stack Startup"
are configured to start the stack automatically at login:

```bash
# Manual start via systemd
MSYS_NO_PATHCONV=1 wsl -d Ubuntu-22.04 -u root -- systemctl start atlas-stack.service
```

## After any config change

Environment variables and volume mounts are only applied at container creation — not on
restart. Always use `--force-recreate` after changing `docker-compose.yml`:

```bash
MSYS_NO_PATHCONV=1 wsl -d Ubuntu-22.04 -- docker compose -f /mnt/c/Data/Projects/code/Atlas/docker-compose.yml up -d --force-recreate
```
