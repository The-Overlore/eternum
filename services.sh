#!/bin/bash
set -e

PERSISTENT_STATE=false
RESET_KATANA=false

COMMAND=$1
shift 1

start_services() {
	while getopts ':prh' opt; do
	case "$opt" in
		p)
		PERSISTENT_STATE=true
		;;

		r)
		RESET_KATANA=true
		;;

		h)
		echo -e "Usage: $(basename $0) <command> [-p]\n-p: activate persistent state for katana\ncommand:\n  -start: starts all services\n  -stop: stops all services\n  -restart: restarts all services"
		exit 0
		;;

		?)
		echo -e "Usage: $(basename $0) <command> [-p]\n-p: activate persistent state for katana\ncommand:\n  -start: starts all services\n  -stop: stops all services\n  -restart: restarts all services"
		exit 1
		;;
	esac
	done
	shift "$(($OPTIND -1))"

	rm -rf node_modules && rm -rf ./client/node_modules
	rm -rf bun.lockb
	if [ ! -d "./client/tmp/" ]; then
		mkdir ./client/tmp
	fi
	cp package.json ./client/tmp/

	docker-compose build --build-arg PERSISTENT_STATE=${PERSISTENT_STATE} --build-arg  RESET_KATANA=${RESET_KATANA}
	docker compose up -d
}

stop_services() {
	pids=($(docker-compose exec -T katana pgrep -f katana))
	docker-compose exec -T katana kill -2 ${pids[2]}
	docker-compose down
	rm -rf ./client/tmp
}

if [ $COMMAND = "start" ]; then
	start_services $@
elif [ $COMMAND = "stop" ]; then
	stop_services $@
elif [ $COMMAND = "restart" ]; then
	start_services 
	stop_services
else
	echo -e "Usage: $(basename $0) <command>\ncommand:\n  -start: starts all services\n  -stop: stops all services\n  -restart: restarts all services"
fi


