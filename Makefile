APP_NAME=crm-platform-fe
IMAGE_NAME=$(APP_NAME)
CONTAINER_NAME=$(APP_NAME)
PORT=3000

.PHONY: docker/build docker/run docker/start docker/stop docker/restart docker/logs docker/clean

## Build the Docker image
docker/build:
	docker build -t $(IMAGE_NAME) .

## Run the container (requires .env.local)
docker/run:
	docker run -d \
		--name $(CONTAINER_NAME) \
		--env-file .env.local \
		-p $(PORT):$(PORT) \
		$(IMAGE_NAME)

## Build and run the container
docker/start: docker/build docker/run

## Stop and remove the container
docker/stop:
	docker stop $(CONTAINER_NAME) && docker rm $(CONTAINER_NAME)

## Restart the container
docker/restart: docker/stop docker/run

## Follow container logs
docker/logs:
	docker logs -f $(CONTAINER_NAME)

## Remove container and image
docker/clean:
	docker stop $(CONTAINER_NAME) 2>/dev/null || true
	docker rm $(CONTAINER_NAME) 2>/dev/null || true
	docker rmi $(IMAGE_NAME) 2>/dev/null || true
