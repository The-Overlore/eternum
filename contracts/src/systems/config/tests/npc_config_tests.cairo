use eternum::utils::testing::{spawn_eternum, deploy_system};

use eternum::systems::config::contracts::config_systems;
use eternum::systems::config::interface::{INpcConfigDispatcher, INpcConfigDispatcherTrait};

use dojo::world::{IWorldDispatcherTrait, IWorldDispatcher};

use eternum::models::config::WorldConfig;
use eternum::models::config::NpcConfig;
use eternum::systems::npc::tests::npc_spawn_tests::{PUB_KEY, SPAWN_DELAY};

const NEW_PUB_KEY: felt252 = 0x111111111111111111111111111111111111111111111111111111111111111;

#[test]
#[available_gas(3000000000)]
fn test_set_new_pub_key() {
    let world = spawn_eternum();
    let config_systems_address = deploy_system(config_systems::TEST_CLASS_HASH);
    let npc_config_dispatcher = INpcConfigDispatcher { contract_address: config_systems_address };

    npc_config_dispatcher.set_npc_config(world, SPAWN_DELAY, PUB_KEY);
    world.grant_owner(starknet::get_caller_address(), PUB_KEY);
    npc_config_dispatcher.set_npc_config(world, SPAWN_DELAY, NEW_PUB_KEY);
}

#[test]
#[available_gas(3000000000)]
#[should_panic(expected: ('Not owner', 'ENTRYPOINT_FAILED'))]
fn test_set_new_pub_key_panic() {
    let world = spawn_eternum();
    let config_systems_address = deploy_system(config_systems::TEST_CLASS_HASH);
    let npc_config_dispatcher = INpcConfigDispatcher { contract_address: config_systems_address };

    npc_config_dispatcher.set_npc_config(world, SPAWN_DELAY, PUB_KEY);
    npc_config_dispatcher.set_npc_config(world, SPAWN_DELAY, NEW_PUB_KEY);
}

#[test]
#[available_gas(3000000000)]
#[should_panic(expected: ('Empty SPAWN_DELAY received', 'ENTRYPOINT_FAILED'))]
fn test_set_spawn_delay_panic() {
    let world = spawn_eternum();
    let config_systems_address = deploy_system(config_systems::TEST_CLASS_HASH);
    let npc_config_dispatcher = INpcConfigDispatcher { contract_address: config_systems_address };

    npc_config_dispatcher.set_npc_config(world, 0, PUB_KEY);
}

#[test]
#[available_gas(3000000000)]
#[should_panic(expected: ('Empty PUB_KEY received', 'ENTRYPOINT_FAILED'))]
fn test_set_0_pub_key_panic() {
    let world = spawn_eternum();
    let config_systems_address = deploy_system(config_systems::TEST_CLASS_HASH);
    let npc_config_dispatcher = INpcConfigDispatcher { contract_address: config_systems_address };

    npc_config_dispatcher.set_npc_config(world, SPAWN_DELAY, 0);
}
