#[dojo::contract]
mod npc_systems {
    
    use starknet::ContractAddress;
    use eternum::constants::NPC_CONFIG_ID;    

    use eternum::models::realm::{Realm, RealmTrait};
    use eternum::models::npc::{Npc, random_mood, random_sex, random_role};
    use eternum::models::last_spawned::{LastSpawned, ShouldSpawnImpl};
    use eternum::systems::npc::utils::assert_ownership;
    use eternum::models::config::NpcConfig;
    use starknet::info::BlockInfo;

    use eternum::systems::npc::interface::INpc;
    use debug::PrintTrait;
    
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
    }

    #[external(v0)]
    impl NpcImpl of INpc<ContractState> {
        fn spawn_npc(self: @ContractState, world: IWorldDispatcher, realm_id: felt252) -> felt252 {
            assert_ownership(world, realm_id);
            
            let last_spawned = get!(world, realm_id, (LastSpawned));

            let npc_config = get!(world, NPC_CONFIG_ID, (NpcConfig));

            let should_spawn = last_spawned.should_spawn(npc_config.spawn_delay);

            if should_spawn {
                let block: BlockInfo = starknet::get_block_info().unbox();
                let last_spawned_ts: u128 = starknet::get_block_timestamp().into();
                let uuid = world.uuid().into();                
                let sex = random_sex(last_spawned_ts);
                let mood = random_mood(block.block_number);
                let role = random_role(uuid);
                let entity_id: felt252 = uuid.into();

                set!(world, (Npc { entity_id, realm_id, mood, sex, role}));
                set!(world, (LastSpawned {realm_id, last_spawned_ts}));

                entity_id
            } else {
                0
            }
        }
        // trigger the mood changes based on when the user clicks on the harvest weat/fish
        fn change_mood(self: @ContractState, world: IWorldDispatcher, realm_id: felt252, npc_id: felt252, mood: felt252) {
            assert_ownership(world, realm_id);

            let old_npc = get!(world, (npc_id), (Npc));
            // otherwise seeing this error on compilation
            // let __set_macro_value__ = Npc { entity_id: npc_id, realm_id, mood, role: old_role.sex, sex: old_sex.role};
            let old_sex = old_npc.sex;
			      let old_role = old_npc.role;
            set!(world, (Npc { entity_id: npc_id, realm_id, mood, role: old_role, sex: old_sex}));
        }
        
    }
}
