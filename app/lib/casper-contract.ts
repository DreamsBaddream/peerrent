import {
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
  StoredVersionedContractByHash,
  ContractHash,
} from "casper-js-sdk"
import * as fs from "fs"
import * as path from "path"

const NODE_URL = process.env.CASPER_NODE_URL!
const CONTRACT_HASH = process.env.CASPER_CONTRACT_HASH! // package hash hex
const KEY_PATH = path.join(
  process.cwd(),
  "..",
  "peerrent-contract",
  "keys",
  "secret_key.pem"
)

function getPrivateKey(): PrivateKey {
  const pem = fs.readFileSync(KEY_PATH, "utf8")
  return PrivateKey.fromPem(pem, KeyAlgorithm.ED25519)
}

async function callContract(
  entryPoint: string,
  args: Record<string, CLValue>,
  paymentMotes: string = "3000000000"
): Promise<string> {
  const privateKey = getPrivateKey()

  const session = new ExecutableDeployItem()
  session.storedVersionedContractByHash = new StoredVersionedContractByHash(
    ContractHash.newContract(`hash-${CONTRACT_HASH}`),
    entryPoint,
    Args.fromMap(args)
  )

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

export async function listItemOnChain(
  itemId: string,
  depositMotes: string,
  dailyRateMotes: string
): Promise<string | null> {
  try {
    const hash = await callContract(
      "list_item",
      {
        item_id: CLValue.newCLString(itemId),
        deposit_amount: CLValue.newCLUInt512(depositMotes),
        daily_rate: CLValue.newCLUInt512(dailyRateMotes),
        amount: CLValue.newCLUInt512("1000000000"), // 1 CSPR stake
      },
      "5000000000" // 5 CSPR covers gas + stake
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
      "3000000000"
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
    const gasPlusDep = (BigInt(depositMotes) + BigInt(5_000_000_000)).toString()
    const hash = await callContract(
      "rent_item",
      {
        item_id: CLValue.newCLString(itemId),
        days: CLValue.newCLUint64(days),
        amount: CLValue.newCLUInt512(depositMotes),
      },
      gasPlusDep
    )
    console.log(`[casper] rent_item deploy: ${hash}`)
    return hash
  } catch (e) {
    console.error("[casper] rent_item failed:", e)
    return null
  }
}
