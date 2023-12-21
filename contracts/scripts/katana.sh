#!/bin/bash
set -e

if [ $RESET_KATANA = true ]; then
	rm -rf /volume/katana_db
fi
if [ $PERSISTENT_STATE = true ]; then
	load_state=""
	if [ -e "/volume/katana_db" ]; then
		load_state="--load-state /volume/katana_db"
	fi
	/root/.dojo/bin/katana --disable-fee --dump-state /volume/katana_db $load_state
else 
	/root/.dojo/bin/katana --disable-fee
fi
