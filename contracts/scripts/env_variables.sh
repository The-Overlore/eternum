#!/bin/bash

# Default values (dev)
STARKNET_RPC_URL="http://localhost:5050"
DOJO_ACCOUNT_ADDRESS="0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973"
DOJO_PRIVATE_KEY="0x1800000000300000180000000000030000000000003006001800006600"
SOZO_WORLD="0x5cb4ce060de62a7b6bfd4cb70fd4ae3196bfe399c372cb0863e632ba8cc73ef"

# Check if the first argument is provided and set it to "dev" or "prod"
if [[ ! -z "$1" ]]; then
    if [[ "$1" == "prod" ]]; then
        echo "is prod"
        STARKNET_RPC_URL="https://api.cartridge.gg/x/eternum2/katana"
        DOJO_ACCOUNT_ADDRESS="0x178af2a04c0c16ad688ebac1c826b4be27b440979296b50947400691dcc4e7a"
        DOJO_PRIVATE_KEY="0x22b6155e4cf0748ac40306efa1a42520705c956d0ce6331d72bc1579f7f9918"
    elif [[ "$1" != "dev" ]]; then
        echo "Invalid argument. Use 'dev' or 'prod'."
        exit 1
    fi
fi

# Set the environment variables
export STARKNET_RPC_URL
export DOJO_ACCOUNT_ADDRESS
export DOJO_PRIVATE_KEY
export SOZO_WORLD

# Optional: Display the chosen configuration
echo "Selected configuration:"
echo "STARKNET_RPC_URL: $STARKNET_RPC_URL"
echo "DOJO_ACCOUNT_ADDRESS: $DOJO_ACCOUNT_ADDRESS"
echo "DOJO_PRIVATE_KEY: $DOJO_PRIVATE_KEY"
echo "SOZO_WORLD: $SOZO_WORLD"