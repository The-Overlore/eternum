// Used as helper struct throughout the world
#[derive(Component)]
struct Resource {
    resource_type: u8,
    balance: u128,
}

#[derive(Component)]
struct Vault {
    balance: u128, 
}
