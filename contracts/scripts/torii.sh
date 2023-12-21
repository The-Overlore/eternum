#!/bin/bash
set -e

source /root/.bashrc

sozo() {
	/root/.dojo/bin/sozo "$@"
}

echo "Sleeping 5... Need to wait for Katana to start"
sleep 5



/root/.dojo/bin/sozo migrate --name eternum --rpc-url http://katana:5050

if [ ! -e "/volume/katana_db" ]; then
	source ./scripts/env_variables.sh dev
	export STARKNET_RPC_URL=http://katana:5050
	export -f sozo
	printf '\n' | source ./scripts/set_config.sh
fi

# TODO: Get world address from migrate
/root/.dojo/bin/torii --world 0x4d79c99ce9b489b77461e3491970ea5ede1f1966f4d2ff65ee76cd8701d6dad --rpc http://katana:5050