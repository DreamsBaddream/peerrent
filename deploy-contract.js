const fs = require('fs');
const path = require('path');

const {
  PrivateKey,
  KeyAlgorithm,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  Args,
  CLValue,
  Timestamp,
  Duration,
  RpcClient,
  HttpHandler,
} = require('./app/node_modules/casper-js-sdk');

const WASM_PATH = path.join(__dirname, 'peerrent-contract', 'wasm', 'PeerRent_opt.wasm');
const KEY_PATH = path.join(__dirname, 'peerrent-contract', 'keys', 'secret_key.pem');
const NODE_URL = 'https://node.testnet.casper.network/rpc';
const CHAIN_NAME = 'casper-test';
const PAYMENT_AMOUNT = '500000000000'; // 500 CSPR — storage alone needs ~326 CSPR for 292KB WASM

async function main() {
  // Load private key (Ed25519 — public key prefix 01)
  const pemContent = fs.readFileSync(KEY_PATH, 'utf8');
  const privateKey = PrivateKey.fromPem(pemContent, KeyAlgorithm.ED25519);
  console.log('Deployer public key:', privateKey.publicKey.toHex());

  // Load WASM
  const wasmBuffer = fs.readFileSync(WASM_PATH);
  const wasmBytes = new Uint8Array(wasmBuffer);
  console.log('WASM size:', wasmBytes.length, 'bytes');

  // Odra required install args
  const sessionArgs = Args.fromMap({
    'odra_cfg_package_hash_key_name': CLValue.newCLString('peerrent_package_hash'),
    'odra_cfg_allow_key_override':    CLValue.newCLValueBool(false),
    'odra_cfg_is_upgradable':         CLValue.newCLValueBool(false),
    'odra_cfg_is_upgrade':            CLValue.newCLValueBool(false),
  });

  const session = ExecutableDeployItem.newModuleBytes(wasmBytes, sessionArgs);
  const payment = ExecutableDeployItem.standardPayment(PAYMENT_AMOUNT);

  const header = new DeployHeader(
    CHAIN_NAME,
    [],                                   // no dependencies
    1,                                    // gasPrice
    new Timestamp(new Date()),
    new Duration(30 * 60 * 1000),         // 30 min TTL
    privateKey.publicKey
  );

  const deploy = Deploy.makeDeploy(header, payment, session);
  deploy.sign(privateKey);

  const deployHash = deploy.hash.toHex();
  console.log('Deploy hash:', deployHash);

  const handler = new HttpHandler(NODE_URL);
  const client = new RpcClient(handler);

  console.log('Submitting deploy...');
  const result = await client.putDeploy(deploy);
  console.log('RPC result:', JSON.stringify(result, null, 2));

  // Poll for result
  console.log('\nWaiting for deploy to be processed (up to 3 minutes)...');
  try {
    const deployResult = await client.waitForDeploy(deploy, 180000);
    const execResults = deployResult?.deploy?.execution_results || deployResult?.execution_results || [];
    console.log('\nExecution results:', JSON.stringify(execResults, null, 2));

    // Fetch named keys to extract contract hash
    console.log('\nFetching account named keys...');
    const accountInfo = await client.getAccountInfo(null, {
      publicKey: privateKey.publicKey,
    });
    const namedKeys = accountInfo?.account?.named_keys || accountInfo?.named_keys || [];
    console.log('\nNamed keys:', JSON.stringify(namedKeys, null, 2));

    const packageKey = namedKeys.find(k => k.name === 'peerrent_package_hash');
    const contractKey = namedKeys.find(k => k.name === 'peerrent_contract_hash');
    if (packageKey) console.log('\n>>> CONTRACT PACKAGE HASH:', packageKey.key);
    if (contractKey) console.log('>>> CONTRACT HASH:', contractKey.key);
  } catch (e) {
    console.error('Error waiting for deploy:', e.message);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message || err);
  process.exit(1);
});
