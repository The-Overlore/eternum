#!/bin/sh

set -e

cp /package.json /app

cd /app

/root/.bun/bin/bun install 

cd /app/client

/root/.bun/bin/bun dev