use core::traits::Into;
use core::option::OptionTrait;

use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

use eternum::{
    models::{
        position::{Position, Coord, PositionImpl, PositionIntoCoord,},
        npc::{Npc, RealmRegistry, Characteristics}
    },
    systems::{
        npc::{
            utils::{pack_characs}, contracts::{npc_systems},
            interface::{INpcDispatcher, INpcDispatcherTrait}
        },
        realm::{
            contracts::realm_systems,
            interface::{IRealmSystemsDispatcher, IRealmSystemsDispatcherTrait,}
        },
        config::{
            contracts::config_systems, interface::{INpcConfigDispatcher, INpcConfigDispatcherTrait},
            tests::npc_config_tests::{MAX_NUM_RESIDENT_NPCS, MAX_NUM_NATIVE_NPCS}
        }
    },
    utils::testing::{spawn_eternum, deploy_system},
};


const PUB_KEY: felt252 = 0x141a26313bd3355fe4c4f3dda7e40dfb77ce54aea5f62578b4ec5aad8dd63b1;
const SPAWN_DELAY: u64 = 100;


#[test]
#[available_gas(3000000000)]
fn test_spawn_single() {
    let world = spawn_eternum();

    let config_systems_address = deploy_system(config_systems::TEST_CLASS_HASH);
    let npc_config_dispatcher = INpcConfigDispatcher { contract_address: config_systems_address };

    let realm_systems_address = deploy_system(realm_systems::TEST_CLASS_HASH);
    let realm_systems_dispatcher = IRealmSystemsDispatcher {
        contract_address: realm_systems_address
    };

    let npc_systems_address = deploy_system(npc_systems::TEST_CLASS_HASH);
    let npc_dispatcher = INpcDispatcher { contract_address: npc_systems_address };

    npc_config_dispatcher
        .set_npc_config(world, SPAWN_DELAY, PUB_KEY, MAX_NUM_RESIDENT_NPCS, MAX_NUM_NATIVE_NPCS);

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
    let npc = spawn_npc(world, realm_entity_id, npc_dispatcher, SPAWN_DELAY, 0);
}

#[test]
#[available_gas(3000000000)]
#[should_panic(expected: ('too early to spawn', 'ENTRYPOINT_FAILED'))]
fn test_spawn_too_early() {
    let world = spawn_eternum();

    let config_systems_address = deploy_system(config_systems::TEST_CLASS_HASH);
    let npc_config_dispatcher = INpcConfigDispatcher { contract_address: config_systems_address };

    let realm_systems_address = deploy_system(realm_systems::TEST_CLASS_HASH);
    let realm_systems_dispatcher = IRealmSystemsDispatcher {
        contract_address: realm_systems_address
    };

    let npc_systems_address = deploy_system(npc_systems::TEST_CLASS_HASH);
    let npc_dispatcher = INpcDispatcher { contract_address: npc_systems_address };

    npc_config_dispatcher
        .set_npc_config(world, SPAWN_DELAY, PUB_KEY, MAX_NUM_RESIDENT_NPCS, MAX_NUM_NATIVE_NPCS);

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

    let npc = spawn_npc(world, realm_entity_id, npc_dispatcher, SPAWN_DELAY, 0);

    let npc = spawn_npc(world, realm_entity_id, npc_dispatcher, 10, 1);
}

#[test]
#[available_gas(3000000000)]
fn test_spawn_multiple() {
    let world = spawn_eternum();

    let config_systems_address = deploy_system(config_systems::TEST_CLASS_HASH);
    let npc_config_dispatcher = INpcConfigDispatcher { contract_address: config_systems_address };

    let realm_systems_address = deploy_system(realm_systems::TEST_CLASS_HASH);
    let realm_systems_dispatcher = IRealmSystemsDispatcher {
        contract_address: realm_systems_address
    };

    let npc_systems_address = deploy_system(npc_systems::TEST_CLASS_HASH);
    let npc_dispatcher = INpcDispatcher { contract_address: npc_systems_address };

    npc_config_dispatcher
        .set_npc_config(world, SPAWN_DELAY, PUB_KEY, MAX_NUM_RESIDENT_NPCS, MAX_NUM_NATIVE_NPCS);

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

    let npc_0 = spawn_npc(world, realm_entity_id, npc_dispatcher, SPAWN_DELAY, 0);

    let npc_1 = spawn_npc(world, realm_entity_id, npc_dispatcher, SPAWN_DELAY, 1);

    let npc_2 = spawn_npc(world, realm_entity_id, npc_dispatcher, SPAWN_DELAY, 2);

    let npc_3 = spawn_npc(world, realm_entity_id, npc_dispatcher, SPAWN_DELAY, 3);

    let npc_4 = spawn_npc(world, realm_entity_id, npc_dispatcher, SPAWN_DELAY, 4);

    assert(npc_0.entity_id != npc_1.entity_id, 'same entity_id 0 1');
    assert(npc_0.entity_id != npc_2.entity_id, 'same entity_id 0 2');
    assert(npc_0.entity_id != npc_3.entity_id, 'same entity_id 0 3');
    assert(npc_0.entity_id != npc_4.entity_id, 'same entity_id 0 4');
    assert(npc_1.entity_id != npc_2.entity_id, 'same entity_id 1 2');
    assert(npc_1.entity_id != npc_3.entity_id, 'same entity_id 1 3');
    assert(npc_1.entity_id != npc_4.entity_id, 'same entity_id 1 4');
    assert(npc_2.entity_id != npc_3.entity_id, 'same entity_id 2 3');
    assert(npc_2.entity_id != npc_4.entity_id, 'same entity_id 2 4');
    assert(npc_3.entity_id != npc_4.entity_id, 'same entity_id 3 4');
}


#[test]
#[available_gas(3000000000)]
#[should_panic(expected: ('max num npcs spawned', 'ENTRYPOINT_FAILED'))]
fn test_spawn_more_than_five() {
    let world = spawn_eternum();

    let config_systems_address = deploy_system(config_systems::TEST_CLASS_HASH);
    let npc_config_dispatcher = INpcConfigDispatcher { contract_address: config_systems_address };

    let realm_systems_address = deploy_system(realm_systems::TEST_CLASS_HASH);
    let realm_systems_dispatcher = IRealmSystemsDispatcher {
        contract_address: realm_systems_address
    };

    let npc_systems_address = deploy_system(npc_systems::TEST_CLASS_HASH);
    let npc_dispatcher = INpcDispatcher { contract_address: npc_systems_address };

    npc_config_dispatcher
        .set_npc_config(world, SPAWN_DELAY, PUB_KEY, MAX_NUM_RESIDENT_NPCS, MAX_NUM_NATIVE_NPCS);

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

    let characs = pack_characs(Characteristics { age: 30, role: 10, sex: 1, });
    let r_sign = 0x6a43f62142ac80f794378d1298d429b77c068cba42f884b1856f2087cdaf0c6;
    let s_sign = 0x1171a4553f2b9d6a053f4e60c35b5c329931c7b353324f03f7ec5055f48f1ec;

    let mut i = 0;
    loop {
        if (i == 10) {
            break;
        }

        let npc = spawn_npc(world, realm_entity_id, npc_dispatcher, 100, i);
        i += 1;
    }
}


#[test]
#[available_gas(3000000000)]
#[should_panic(expected: ('Invalid signature', 'ENTRYPOINT_FAILED'))]
fn test_invalid_trait() {
    let world = spawn_eternum();
    let config_systems_address = deploy_system(config_systems::TEST_CLASS_HASH);
    let npc_config_dispatcher = INpcConfigDispatcher { contract_address: config_systems_address };

    // first argument is the spawn delay
    npc_config_dispatcher
        .set_npc_config(world, SPAWN_DELAY, PUB_KEY, MAX_NUM_RESIDENT_NPCS, MAX_NUM_NATIVE_NPCS);

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

    let npc_systems_address = deploy_system(npc_systems::TEST_CLASS_HASH);
    let npc_dispatcher = INpcDispatcher { contract_address: npc_systems_address };

    let characs = pack_characs(Characteristics { age: 30, role: 10, sex: 1, });
    let r_sign = 0x6a43f62142ac80f794378d1298d429b77c068cba42f884b1856f2087cdaf0c6;
    let s_sign = 0x1171a4553f2b9d6a053f4e60c35b5c329931c7b353324f03f7ec5055f48f1ec;

    // 'brave' -> 'Brave'
    npc_dispatcher
        .spawn_npc(world, realm_entity_id, characs, 'Brave', 'John', array![r_sign, s_sign].span());
}


fn spawn_npc(
    world: IWorldDispatcher,
    realm_entity_id: u128,
    npc_dispatcher: INpcDispatcher,
    time_increment: u64,
    current_num_of_npcs: u8
) -> Npc {
    let current_time = starknet::get_block_timestamp();
    starknet::testing::set_block_timestamp(current_time + time_increment);

    let characs = pack_characs(Characteristics { age: 30, role: 10, sex: 1, });
    let r_sign = 0x6a43f62142ac80f794378d1298d429b77c068cba42f884b1856f2087cdaf0c6;
    let s_sign = 0x1171a4553f2b9d6a053f4e60c35b5c329931c7b353324f03f7ec5055f48f1ec;

    let entity_id = npc_dispatcher
        .spawn_npc(world, realm_entity_id, characs, 'brave', 'John', array![r_sign, s_sign].span());

    assert(entity_id != 0, 'entity id is zero');

    let npc = get!(world, entity_id, (Npc));

    assert(npc.entity_id != 0, 'npc.entity_id is zero');

    let realm_registry = get!(world, realm_entity_id, (RealmRegistry));
    assert(
        realm_registry.num_resident_npcs == current_num_of_npcs + 1, 'wrong number of residents'
    );
    assert(realm_registry.num_native_npcs == current_num_of_npcs + 1, 'wrong number of natives');

    let npc_position = get!(world, npc.entity_id, (Position));
    let npc_coords: Coord = npc_position.into();
    let realm_position = get!(world, realm_entity_id, (Position));

    assert(npc_coords == realm_position.into(), 'npc at wrong position');

    npc
}

