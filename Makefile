.PHONY: up down build logs shell check add health

# Start price tracker in the background (builds image if needed)
up:
	docker compose up -d --build

# Stop and remove containers (data is preserved — bind mounts)
down:
	docker compose down

# Rebuild image from scratch without cache
build:
	docker compose build --no-cache

# Stream live server logs
logs:
	docker compose logs -f price-tracker

# Open a shell inside the running container
shell:
	docker exec -it atlas-price-tracker sh

# Run a full price check inside the container
check:
	docker exec atlas-price-tracker node index.js check-all

# Add a product: make add URL="https://..." NAME="My Product" CATEGORY=electronics
add:
	docker exec atlas-price-tracker node index.js add-product \
	  --url "$(URL)" \
	  $(if $(NAME),--name "$(NAME)",) \
	  $(if $(CATEGORY),--category "$(CATEGORY)",) \
	  $(if $(WEIGHT),--weight "$(WEIGHT)",)

# Show container health status
health:
	docker inspect --format='{{.State.Health.Status}}' atlas-price-tracker 2>/dev/null || echo "container not running"
