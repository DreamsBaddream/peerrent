import {
  PrivateKey,
  KeyAlgorithm,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  Args,
  CLValue,
  CLTypeUInt8,
  Timestamp,
  Duration,
  RpcClient,
  HttpHandler,
  StoredVersionedContractByHash,
  ContractHash,
} from "casper-js-sdk"
import * as fs from "fs"
import * as path from "path"

const NODE_URL = process.env.CASPER_NODE_URL!
const CONTRACT_HASH = process.env.CASPER_CONTRACT_HASH!
const KEY_PATH = path.join(
  process.cwd(),
  "..",
  "peerrent-contract",
  "keys",
  "secret_key.pem"
)
const PROXY_WASM_PATH = path.join(
  process.cwd(),
  "..",
  "peerrent-contract",
  "wasm",
  "proxy_caller_with_return.wasm"
)

function getPrivateKey(): PrivateKey {
  const pem = fs.readFileSync(KEY_PATH, "utf8")
  return PrivateKey.fromPem(pem, KeyAlgorithm.ED25519)
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16)
  return out
}

function bytesToCLList(bytes: Uint8Array): CLValue {
  return CLValue.newCLList(
    CLTypeUInt8,
    Array.from(bytes).map((b) => CLValue.newCLUint8(b))
  )
}

async function submitDeploy(
  session: ExecutableDeployItem,
  paymentMotes: string
): Promise<string> {
  const privateKey = getPrivateKey()
  const payment = ExecutableDeployItem.standardPayment(paymentMotes)
  const header = new DeployHeader(
    "casper-test",
    [],
    1,
    new Timestamp(new Date()),
    new Duration(30 * 60 * 1000),
    privateKey.publicKey
  )
  const deploy = Deploy.makeDeploy(header, payment, session)
  deploy.sign(privateKey)
  const handler = new HttpHandler(NODE_URL)
  const client = new RpcClient(handler)
  const result = await client.putDeploy(deploy)
  return result.deployHash?.toHex() ?? ""
}

async function callContract(
  entryPoint: string,
  args: Record<string, CLValue>,
  paymentMotes: string = "3000000000"
): Promise<string> {
  const session = new ExecutableDeployItem()
  session.storedVersionedContractByHash = new StoredVersionedContractByHash(
    ContractHash.newContract(CONTRACT_HASH),
    entryPoint,
    Args.fromMap(args),
    1
  )
  return submitDeploy(session, paymentMotes)
}

async function callPayable(
  entryPoint: string,
  args: Record<string, CLValue>,
  attachedMotes: string,
  paymentMotes: string = "15000000000"
): Promise<string> {
  const innerBytes = Args.fromMap(args).toBytes()
  const proxyArgs = Args.fromMap({
    package_hash: CLValue.newCLByteArray(hexToBytes(CONTRACT_HASH)),
    entry_point: CLValue.newCLString(entryPoint),
    args: bytesToCLList(innerBytes),
    attached_value: CLValue.newCLUInt512(attachedMotes),
    amount: CLValue.newCLUInt512(attachedMotes),
  })
  const wasm = new Uint8Array(fs.readFileSync(PROXY_WASM_PATH))
  const session = ExecutableDeployItem.newModuleBytes(wasm, proxyArgs)
  return submitDeploy(session, paymentMotes)
}

export async function listItemOnChain(
  itemId: string,
  depositMotes: string,
  dailyRateMotes: string
): Promise<string | null> {
  try {
    const hash = await callPayable(
      "list_item",
      {
        item_id: CLValue.newCLString(itemId),
        deposit_amount: CLValue.newCLUInt512(depositMotes),
        daily_rate: CLValue.newCLUInt512(dailyRateMotes),
      },
      "1000000000"
    )
    console.log(`[casper] list_item deploy: ${hash}`)
    return hash
  } catch (e) {
    console.error("[casper] list_item failed:", e)
    return null
  }
}

export async function returnItemOnChain(
  itemId: string,
  damage: boolean
): Promise<string | null> {
  try {
    const hash = await callContract(
      "return_item",
      {
        item_id: CLValue.newCLString(itemId),
        damage: CLValue.newCLValueBool(damage),
      },
      "5000000000"
    )
    console.log(`[casper] return_item deploy: ${hash}`)
    return hash
  } catch (e) {
    console.error("[casper] return_item failed:", e)
    return null
  }
}

export async function rentItemOnChain(
  itemId: string,
  days: number,
  depositMotes: string
): Promise<string | null> {
  try {
    const hash = await callPayable(
      "rent_item",
      {
        item_id: CLValue.newCLString(itemId),
        days: CLValue.newCLUint64(days),
      },
      depositMotes
    )
    console.log(`[casper] rent_item deploy: ${hash}`)
    return hash
  } catch (e) {
    console.error("[casper] rent_item failed:", e)
    return null
  }
}
