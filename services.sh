#!/bin/bash
set -e

help() {
	echo -e "Usage: $(basename $0) <command>\ncommand:\n  -start: starts all services (builds contracts as well)\n  -stop: stops all services\n  -restart_service <service>: rebuilds and restarts a particular service\n  -restart: restarts all services\n  -prune: clear the system of all images, volumes, networks, containers, etc. (!this will remove ALL docker data)"
	exit 22
}

start_services() {
	# Build contracts
	cd contracts && sozo build
	cd ..
	docker compose up -d --no-deps --build
}

stop_services() {
	docker-compose down
}


restart_service() {
	if [ ! -n $1 ]; then
		help "restart_service"
	fi

	docker compose up -d ${service} --no-deps --build
}

prune_services() {
	docker system prune --all
}

COMMAND=$1
shift 1

if [ $COMMAND = "start" ]; then
	start_services $@
elif [ $COMMAND = "stop" ]; then
	stop_services
elif [ $COMMAND = "restart" ]; then
	stop_services
	start_services $@
elif [ $COMMAND = "prune" ]; then
	prune_services
elif [ $COMMAND = "restart_service" ]; then
	restart_service $2
else
	help ${COMMAND}
fi
