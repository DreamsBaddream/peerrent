use odra::prelude::*;

/// PeerRent smart contract — peer-to-peer rental marketplace on Casper Network.
///
/// # Flow
/// 1. Owner calls `list_item` with a deposit amount and daily rate, attaching ≥1 CSPR stake.
/// 2. Renter calls `rent_item`, attaching the full deposit amount.
/// 3. After AI damage detection, `return_item` is called:
///    - No damage → deposit refunded to renter.
///    - Damage detected → deposit sent to owner.
/// 4. Either party can call `rate_user` after a completed rental.
#[odra::module]
pub struct PeerRent {
    // --- Item storage (keyed by item_id: String) ---
    item_owners: Mapping<String, Address>,
    item_deposit_amounts: Mapping<String, U512>,
    item_daily_rates: Mapping<String, U512>,
    item_is_rented: Mapping<String, bool>,

    // --- Active rental data (keyed by item_id: String) ---
    rental_renters: Mapping<String, Address>,
    rental_days: Mapping<String, u64>,
    rental_deposits: Mapping<String, U512>,

    // --- Reputation (keyed by user Address) ---
    rating_totals: Mapping<Address, u64>,
    rating_counts: Mapping<Address, u64>,
}

#[odra::module]
impl PeerRent {
    /// Constructor — no initial state needed; mappings default to empty.
    pub fn init(&mut self) {}

    // -----------------------------------------------------------------------
    // Listing
    // -----------------------------------------------------------------------

    /// List an item for rent.
    ///
    /// The caller (owner) must attach ≥ 1 CSPR (1_000_000_000 motes) as a legitimacy
    /// stake. The stake is held by the contract.
    ///
    /// # Arguments
    /// * `item_id`        — Unique string identifier chosen by the owner.
    /// * `deposit_amount` — Deposit in motes that a renter must lock.
    /// * `daily_rate`     — Daily rental rate in motes (informational; not enforced on-chain).
    pub fn list_item(&mut self, item_id: String, deposit_amount: U512, daily_rate: U512) {
        let caller = self.env().caller();
        let stake = self.env().attached_value();

        // Require at least 1 CSPR (= 1_000_000_000 motes) as owner stake.
        if stake < U512::from(1_000_000_000u64) {
            self.env().revert(ExecutionError::User(1)); // insufficient owner stake
        }

        self.item_owners.set(&item_id, caller);
        self.item_deposit_amounts.set(&item_id, deposit_amount);
        self.item_daily_rates.set(&item_id, daily_rate);
        self.item_is_rented.set(&item_id, false);
    }

    // -----------------------------------------------------------------------
    // Renting
    // -----------------------------------------------------------------------

    /// Rent a listed item.
    ///
    /// The caller (renter) must attach the full `deposit_amount` specified by the owner.
    ///
    /// # Arguments
    /// * `item_id` — The unique identifier of the item to rent.
    /// * `days`    — Number of days the renter intends to keep the item (informational).
    pub fn rent_item(&mut self, item_id: String, days: u64) {
        let is_rented = self.item_is_rented.get(&item_id).unwrap_or(false);
        if is_rented {
            self.env().revert(ExecutionError::User(2)); // item already rented
        }

        let deposit_amount = self
            .item_deposit_amounts
            .get(&item_id)
            .unwrap_or_default();
        let attached = self.env().attached_value();

        if attached < deposit_amount {
            self.env().revert(ExecutionError::User(3)); // insufficient deposit
        }

        let renter = self.env().caller();
        self.rental_renters.set(&item_id, renter);
        self.rental_days.set(&item_id, days);
        self.rental_deposits.set(&item_id, attached);
        self.item_is_rented.set(&item_id, true);
    }

    // -----------------------------------------------------------------------
    // Return
    // -----------------------------------------------------------------------

    /// Process an item return after AI damage inspection.
    ///
    /// If `damage` is `false` the locked deposit is refunded to the renter.
    /// If `damage` is `true`  the locked deposit is transferred to the owner.
    ///
    /// **Note:** In production this entrypoint should be restricted to an
    /// authorised oracle / AI agent address. For the buildathon demo the
    /// caller is unrestricted.
    ///
    /// # Arguments
    /// * `item_id` — The item being returned.
    /// * `damage`  — `true` if the AI detected damage, `false` otherwise.
    pub fn return_item(&mut self, item_id: String, damage: bool) {
        let is_rented = self.item_is_rented.get(&item_id).unwrap_or(false);
        if !is_rented {
            self.env().revert(ExecutionError::User(4)); // item is not currently rented
        }

        let deposit = self
            .rental_deposits
            .get(&item_id)
            .unwrap_or_default();

        if damage {
            let owner = self
                .item_owners
                .get(&item_id)
                .unwrap_or_revert_with(&self.env(), ExecutionError::User(10));
            self.env().transfer_tokens(&owner, &deposit);
        } else {
            let renter = self
                .rental_renters
                .get(&item_id)
                .unwrap_or_revert_with(&self.env(), ExecutionError::User(11));
            self.env().transfer_tokens(&renter, &deposit);
        }

        // Reset rental state.
        self.item_is_rented.set(&item_id, false);
        self.rental_deposits.set(&item_id, U512::from(0u64));
    }

    // -----------------------------------------------------------------------
    // Reputation
    // -----------------------------------------------------------------------

    /// Rate a user after a completed rental. Score must be 1–5.
    pub fn rate_user(&mut self, user: Address, score: u8) {
        if score < 1 || score > 5 {
            self.env().revert(ExecutionError::User(5)); // invalid score
        }

        let current_total = self.rating_totals.get(&user).unwrap_or(0);
        let current_count = self.rating_counts.get(&user).unwrap_or(0);
        self.rating_totals.set(&user, current_total + score as u64);
        self.rating_counts.set(&user, current_count + 1);
    }

    /// Returns the average rating multiplied by 10 (e.g. 45 means 4.5 stars).
    /// Returns 0 if the user has received no ratings yet.
    pub fn get_rating(&self, user: Address) -> u64 {
        let total = self.rating_totals.get(&user).unwrap_or(0);
        let count = self.rating_counts.get(&user).unwrap_or(0);
        if count == 0 {
            return 0;
        }
        (total * 10) / count
    }

    // -----------------------------------------------------------------------
    // View helpers
    // -----------------------------------------------------------------------

    /// Returns the owner address of an item, or `None` if it is not listed.
    pub fn get_item_owner(&self, item_id: String) -> Option<Address> {
        self.item_owners.get(&item_id)
    }

    /// Returns the required deposit amount for an item in motes.
    pub fn get_deposit_amount(&self, item_id: String) -> U512 {
        self.item_deposit_amounts.get(&item_id).unwrap_or_default()
    }

    /// Returns the daily rental rate for an item in motes.
    pub fn get_daily_rate(&self, item_id: String) -> U512 {
        self.item_daily_rates.get(&item_id).unwrap_or_default()
    }

    /// Returns `true` if the item is currently rented out.
    pub fn is_rented(&self, item_id: String) -> bool {
        self.item_is_rented.get(&item_id).unwrap_or(false)
    }

    /// Returns the current renter address, or `None` if the item is not rented.
    pub fn get_renter(&self, item_id: String) -> Option<Address> {
        self.rental_renters.get(&item_id)
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, HostEnv, NoArgs};

    fn setup() -> (HostEnv, PeerRentHostRef) {
        let env = odra_test::env();
        let contract = PeerRent::deploy(&env, NoArgs);
        (env, contract)
    }

    #[test]
    fn test_item_not_rented_initially() {
        let (_env, contract) = setup();
        assert!(!contract.is_rented("camera-01".to_string()));
    }

    #[test]
    fn test_list_item() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        env.set_caller(owner);

        // Attach 1 CSPR (1_000_000_000 motes) as stake.
        env.attached_value()
            .set(U512::from(1_000_000_000u64));

        contract.list_item(
            "camera-01".to_string(),
            U512::from(5_000_000_000u64),  // 5 CSPR deposit
            U512::from(500_000_000u64),    // 0.5 CSPR / day
        );

        assert_eq!(
            contract.get_item_owner("camera-01".to_string()),
            Some(owner)
        );
        assert!(!contract.is_rented("camera-01".to_string()));
    }

    #[test]
    fn test_rent_and_return_no_damage() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        let renter = env.get_account(1);

        // Owner lists the item.
        env.set_caller(owner);
        env.attached_value().set(U512::from(1_000_000_000u64));
        contract.list_item(
            "bike-01".to_string(),
            U512::from(3_000_000_000u64),
            U512::from(300_000_000u64),
        );

        // Renter locks the deposit.
        env.set_caller(renter);
        env.attached_value().set(U512::from(3_000_000_000u64));
        contract.rent_item("bike-01".to_string(), 3);
        assert!(contract.is_rented("bike-01".to_string()));

        // Return with no damage → deposit goes back to renter.
        contract.return_item("bike-01".to_string(), false);
        assert!(!contract.is_rented("bike-01".to_string()));
    }

    #[test]
    fn test_rent_and_return_with_damage() {
        let (env, mut contract) = setup();
        let owner = env.get_account(0);
        let renter = env.get_account(1);

        env.set_caller(owner);
        env.attached_value().set(U512::from(1_000_000_000u64));
        contract.list_item(
            "drill-01".to_string(),
            U512::from(2_000_000_000u64),
            U512::from(200_000_000u64),
        );

        env.set_caller(renter);
        env.attached_value().set(U512::from(2_000_000_000u64));
        contract.rent_item("drill-01".to_string(), 1);

        // Return with damage → deposit goes to owner.
        contract.return_item("drill-01".to_string(), true);
        assert!(!contract.is_rented("drill-01".to_string()));
    }

    #[test]
    fn test_rating_system() {
        let (env, mut contract) = setup();
        let user = env.get_account(0);

        // 0 ratings initially.
        assert_eq!(contract.get_rating(user), 0);

        // Two ratings: 5 and 3 → average = 4.0 → 40 when * 10.
        contract.rate_user(user, 5);
        contract.rate_user(user, 3);
        assert_eq!(contract.get_rating(user), 40);

        // Third rating: 4 → total = 12, count = 3 → 12/3 = 4.0 → 40.
        contract.rate_user(user, 4);
        assert_eq!(contract.get_rating(user), 40);
    }
}
