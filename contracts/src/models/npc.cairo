use debug::PrintTrait;
use integer::{u64_wrapping_sub, u128_wrapping_sub};
use core::traits::Into;

const TWO_POW_2: u256 = 0x4;
const TWO_POW_4: u256 = 0x10;
const TWO_POW_8: u256 = 0x100;
const TWO_POW_12: u256 = 0x1000;
const TWO_POW_16: u256 = 0x10000;
const TWO_POW_20: u256 = 0x100000;
const TWO_POW_24: u256 = 0x1000000;

fn flip(source: u128) -> bool {
    let source_as_felt = source % 2;
    source_as_felt == 0
}

fn random_sex(source: u128) -> u8 {
    let random = flip(source);
    if random {
        0 // read as male
    } else {
        1 // read as female
    }
}

fn random_mood(block_number: u64) -> felt252 {
    let mut mood = 0;
    let mood_hunger: felt252 = (block_number % 10).into();
    let mood_happiness: felt252 = (u64_wrapping_sub(block_number, 3) % 10).into();
    let mood_beligerent: felt252 = (u64_wrapping_sub(block_number, 16) % 10).into();
    mood += mood_hunger;
    mood += mood_happiness * TWO_POW_8.try_into().unwrap();
    mood += mood_beligerent * TWO_POW_16.try_into().unwrap();
    mood
}

fn random_role(source: u128) -> u8 {
    let random = flip(source);
    if random {
        0 // read as Farmer
    } else {
        1 // read as Miner
    }
}

#[derive(Serde, Copy, Drop, Print)]
struct Characteristics {
    age: u8,
    role: u8,
    sex: u8,
}

fn random_characteristics(randomness: @Span<u128>) -> Characteristics {
    Characteristics { age: 1, role: random_role(*randomness[0]), sex: random_sex(*randomness[1]), }
}

fn pack_characs(value: Characteristics) -> felt252 {
    (value.age.into() + (value.role.into() * TWO_POW_8) + (value.sex.into() * TWO_POW_16))
        .try_into()
        .unwrap()
}

fn unpack_characs(value: felt252) -> Characteristics {
    let packed = value.into();
    let (packed, age) = integer::U256DivRem::div_rem(packed, TWO_POW_8.try_into().unwrap());
    let (packed, role) = integer::U256DivRem::div_rem(packed, TWO_POW_8.try_into().unwrap());
    let (packed, sex) = integer::U256DivRem::div_rem(packed, TWO_POW_2.try_into().unwrap());
    Characteristics {
        age: age.try_into().unwrap(), role: role.try_into().unwrap(), sex: sex.try_into().unwrap()
    }
}

#[derive(Model, Serde, Copy, Drop, Print)]
struct Npc {
    #[key]
    entity_id: u128,
    realm_id: u128,
    characteristics: felt252,
    character_trait: felt252,
    name: felt252,
}
