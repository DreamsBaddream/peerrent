use odra::host::{HostEnv, NoArgs};
use odra_cli::{
    deploy::DeployScript,
    CommandArg, DeployedContractsContainer, DeployerExt,
    OdraCli,
};
use peerrent_contract::PeerRent;

pub struct PeerRentDeployScript;

impl DeployScript for PeerRentDeployScript {
    fn deploy(
        &self,
        env: &HostEnv,
        container: &mut DeployedContractsContainer,
    ) -> Result<(), odra_cli::deploy::Error> {
        let _contract = PeerRent::load_or_deploy(env, NoArgs, container, 300_000_000_000)?;
        Ok(())
    }
}

pub fn main() {
    OdraCli::new()
        .about("CLI tool for PeerRent smart contract")
        .deploy(PeerRentDeployScript)
        .contract::<PeerRent>()
        .build()
        .run();
}
