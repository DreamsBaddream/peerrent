use odra::{casper_types::U512, prelude::*};

#[odra::odra_error]
pub enum Error {
    AlreadyRented = 1,
    InsufficientDeposit = 2,
    NotRented = 3,
    InvalidScore = 4,
    InsufficientStake = 5,
    ItemNotFound = 6,
}

#[odra::module]
pub struct PeerRent {
    item_owners: Mapping<String, Address>,
    item_deposit_amounts: Mapping<String, U512>,
    item_daily_rates: Mapping<String, U512>,
    item_is_rented: Mapping<String, bool>,
    rental_renters: Mapping<String, Address>,
    rental_deposits: Mapping<String, U512>,
    rating_totals: Mapping<Address, u64>,
    rating_counts: Mapping<Address, u64>,
}

#[odra::module]
impl PeerRent {
    pub fn init(&mut self) {}

    /// Owner lists an item. Must attach at least 1 CSPR as stake.
    #[odra(payable)]
    pub fn list_item(&mut self, item_id: String, deposit_amount: U512, daily_rate: U512) {
        let stake = self.env().attached_value();
        if stake.is_zero() {
            self.env().revert(Error::InsufficientStake);
        }
        let caller = self.env().caller();
        self.item_owners.set(&item_id, caller);
        self.item_deposit_amounts.set(&item_id, deposit_amount);
        self.item_daily_rates.set(&item_id, daily_rate);
        self.item_is_rented.set(&item_id, false);
    }

    /// Renter calls this, attaching the exact deposit amount in CSPR.
    #[odra(payable)]
    pub fn rent_item(&mut self, item_id: String, days: u64) {
        let is_rented = self.item_is_rented.get(&item_id).unwrap_or_default();
        if is_rented {
            self.env().revert(Error::AlreadyRented);
        }
        let required_deposit = self.item_deposit_amounts.get(&item_id).unwrap_or_default();
        let attached = self.env().attached_value();
        if attached < required_deposit {
            self.env().revert(Error::InsufficientDeposit);
        }
        let renter = self.env().caller();
        self.rental_renters.set(&item_id, renter);
        self.rental_deposits.set(&item_id, attached);
        self.item_is_rented.set(&item_id, true);
        let _ = days;
    }

    /// Called after AI damage check. No damage = refund renter. Damage = send to owner.
    pub fn return_item(&mut self, item_id: String, damage: bool) {
        let is_rented = self.item_is_rented.get(&item_id).unwrap_or_default();
        if !is_rented {
            self.env().revert(Error::NotRented);
        }
        let deposit = self.rental_deposits.get(&item_id).unwrap_or_default();
        if damage {
            let owner = self.item_owners.get(&item_id).unwrap();
            self.env().transfer_tokens(&owner, &deposit);
        } else {
            let renter = self.rental_renters.get(&item_id).unwrap();
            self.env().transfer_tokens(&renter, &deposit);
        }
        self.item_is_rented.set(&item_id, false);
        self.rental_deposits.set(&item_id, U512::zero());
    }

    /// Either party rates the other. Score must be 1-5.
    pub fn rate_user(&mut self, user: Address, score: u8) {
        if score < 1 || score > 5 {
            self.env().revert(Error::InvalidScore);
        }
        let total = self.rating_totals.get(&user).unwrap_or(0u64);
        let count = self.rating_counts.get(&user).unwrap_or(0u64);
        self.rating_totals.set(&user, total + score as u64);
        self.rating_counts.set(&user, count + 1);
    }

    /// Returns average rating * 10 (e.g. 45 = 4.5 stars). Returns 0 if unrated.
    pub fn get_rating(&self, user: Address) -> u64 {
        let total = self.rating_totals.get(&user).unwrap_or(0u64);
        let count = self.rating_counts.get(&user).unwrap_or(0u64);
        if count == 0 {
            return 0;
        }
        (total * 10) / count
    }

    pub fn is_rented(&self, item_id: String) -> bool {
        self.item_is_rented.get(&item_id).unwrap_or_default()
    }

    pub fn get_item_owner(&self, item_id: String) -> Option<Address> {
        self.item_owners.get(&item_id)
    }

    pub fn get_daily_rate(&self, item_id: String) -> U512 {
        self.item_daily_rates.get(&item_id).unwrap_or_default()
    }

    pub fn get_deposit_amount(&self, item_id: String) -> U512 {
        self.item_deposit_amounts.get(&item_id).unwrap_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, HostRef, NoArgs};

    #[test]
    fn test_list_item() {
        let env = odra_test::env();
        let mut contract = PeerRent::deploy(&env, NoArgs);

        let item_id = "camera-01".to_string();
        let deposit = U512::from(50_000_000_000u64); // 50 CSPR
        let daily_rate = U512::from(10_000_000_000u64); // 10 CSPR
        let stake = U512::from(1_000_000_000u64); // 1 CSPR

        contract
            .with_tokens(stake)
            .list_item(item_id.clone(), deposit, daily_rate);

        assert!(!contract.is_rented(item_id.clone()));
        let owner = contract.get_item_owner(item_id.clone()).unwrap();
        assert_eq!(owner, env.get_account(0));
    }

    #[test]
    fn test_rent_and_return_no_damage() {
        let env = odra_test::env();
        let mut contract = PeerRent::deploy(&env, NoArgs);

        let item_id = "bike-01".to_string();
        let deposit = U512::from(30_000_000_000u64);
        let daily_rate = U512::from(5_000_000_000u64);
        let stake = U512::from(1_000_000_000u64);

        contract
            .with_tokens(stake)
            .list_item(item_id.clone(), deposit, daily_rate);

        contract
            .with_tokens(deposit)
            .rent_item(item_id.clone(), 3);

        assert!(contract.is_rented(item_id.clone()));

        contract.return_item(item_id.clone(), false);
        assert!(!contract.is_rented(item_id.clone()));
    }

    #[test]
    fn test_return_with_damage() {
        let env = odra_test::env();
        let mut contract = PeerRent::deploy(&env, NoArgs);

        let item_id = "drill-01".to_string();
        let deposit = U512::from(20_000_000_000u64);
        let stake = U512::from(1_000_000_000u64);

        contract
            .with_tokens(stake)
            .list_item(item_id.clone(), deposit, U512::from(5_000_000_000u64));

        contract
            .with_tokens(deposit)
            .rent_item(item_id.clone(), 1);

        contract.return_item(item_id.clone(), true);
        assert!(!contract.is_rented(item_id));
    }

    #[test]
    fn test_rating() {
        let env = odra_test::env();
        let mut contract = PeerRent::deploy(&env, NoArgs);

        let user = env.get_account(1);
        assert_eq!(contract.get_rating(user), 0);

        contract.rate_user(user, 5);
        contract.rate_user(user, 3);
        // (5 + 3) / 2 * 10 = 40
        assert_eq!(contract.get_rating(user), 40);
    }
}
