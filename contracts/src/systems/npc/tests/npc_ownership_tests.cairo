use eternum::alias::ID;
use eternum::constants::ResourceTypes;
use eternum::models::resources::Resource;
use eternum::models::labor::Labor;
use eternum::models::position::Position;
use eternum::models::npc::{Npc, Npcs, Characteristics};
use eternum::systems::npc::utils::{pedersen_hash_many, pack_characs};

use eternum::utils::testing::{spawn_eternum, deploy_system};
use starknet::contract_address_const;

use core::traits::Into;
use core::option::OptionTrait;

use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

use eternum::systems::realm::contracts::realm_systems;
use eternum::systems::realm::interface::{IRealmSystemsDispatcher, IRealmSystemsDispatcherTrait,};


use eternum::systems::config::contracts::config_systems;
use eternum::systems::config::interface::{INpcConfigDispatcher, INpcConfigDispatcherTrait};

use eternum::systems::npc::contracts::npc_systems;
use eternum::systems::npc::interface::{INpcDispatcher, INpcDispatcherTrait,};
use eternum::systems::npc::tests::npc_spawn_tests::{spawn_npc, PUB_KEY, SPAWN_DELAY};


#[test]
#[should_panic(expected: ('Realm does not belong to player', 'ENTRYPOINT_FAILED',))]
#[available_gas(3000000000)]
fn test_spawn_ownership() {
    let world = spawn_eternum();
    let config_systems_address = deploy_system(config_systems::TEST_CLASS_HASH);
    let npc_config_dispatcher = INpcConfigDispatcher { contract_address: config_systems_address };

    // first argument is the spawn delay
    npc_config_dispatcher.set_npc_config(world, SPAWN_DELAY, PUB_KEY);

    // set realm entity
    let realm_systems_address = deploy_system(realm_systems::TEST_CLASS_HASH);
    let realm_systems_dispatcher = IRealmSystemsDispatcher {
        contract_address: realm_systems_address
    };

    // create realm
    let realm_entity_id = realm_systems_dispatcher
        .create(
            world,
            1, // realm id
            0x209, // resource_types_packed // 2,9 // stone and gold
            2, // resource_types_count
            5, // cities
            5, // harbors
            5, // rivers
            5, // regions
            1, // wonder
            1, // order
            Position { x: 1, y: 1, entity_id: 1_u128 }, // position  
        // x needs to be > 470200 to get zone
        );

    let npc_address = deploy_system(npc_systems::TEST_CLASS_HASH);
    let npc_dispatcher = INpcDispatcher { contract_address: npc_address };

    let (npc_0, npcs) = spawn_npc(world, realm_entity_id, npc_dispatcher, 0, 0);
    assert(npcs.npc_0 == npc_0.entity_id, 'wrond index of npc in struct');

    starknet::testing::set_contract_address(contract_address_const::<'entity'>());
    // call should not work

    let (npc_1, npcs) = spawn_npc(world, realm_entity_id, npc_dispatcher, 0, 0);
    assert(npcs.npc_0 == npc_0.entity_id, 'wrond index of npc in struct');
}

#[test]
#[available_gas(3000000000)]
fn test_pedersen_many() {
    let data = array!['John', 'brave', 1];
    let hash = pedersen_hash_many(data.span());
    assert(hash == 0x7cb6a9b994128df852f2ae08a6d7c1b0f570bc749b5f40e7d85bce44e0cdf3a, 'wrong hash');
    let data = array!['John', 'brave'];
    let hash = pedersen_hash_many(data.span());
    assert(hash == 0x43f3ad5517d8743d71b73c7fde3b85800cccd7623acd0af411a6b1d3128b018, 'wrong hash');
    let data = array![0, 1, 2];
    let hash = pedersen_hash_many(data.span());
    assert(hash == 0x19a8a65406fe866c6e53b0c5002e50b3cba62a836f41e75e15303ad2dd1ce5c, 'wrong hash');

    let data = array![];
    let hash = pedersen_hash_many(data.span());
    assert(
        hash == 0x49ee3eba8c1600700ee1b87eb599f16716b0b1022947733551fde4050ca6804,
        'wrong hash empty'
    );
}
