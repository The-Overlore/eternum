#!/bin/bash
set -e

set_config() {
	source ./scripts/env_variables.sh dev
	export STARKNET_RPC_URL=http://katana:5050
	printf '0.1\n' | ./scripts/set_config.sh
}

sozo migrate --rpc-url http://katana:5050

# TODO: Get world address from migrate
torii --world 0x5cb4ce060de62a7b6bfd4cb70fd4ae3196bfe399c372cb0863e632ba8cc73ef --rpc http://katana:5050 &

# echo "Waiting for torii to boot..."
sleep 5

if [ -z "$RESTART_TORII" ]; then
	set_config
fi

sleep 1000000000000