"use client"

import { x402Client } from "@x402/core/client"
import { wrapFetchWithPayment } from "@x402/fetch"
import { makeCsprTransferDeploy, Deploy } from "casper-js-sdk"

interface PaymentAccept {
  maxAmountRequired: string
  payTo: string
  scheme?: string
  network?: string
}

// Casper-specific x402 scheme client: signs a CSPR transfer via Casper Wallet
const casperSchemeClient = {
  async createPaymentPayload(requirements: { accepts?: PaymentAccept[] } & PaymentAccept) {
    const publicKeyHex = localStorage.getItem("casper_public_key")
    if (!publicKeyHex) throw new Error("Casper Wallet not connected")
    if (!window.casperWallet) throw new Error("Casper Wallet extension not found")

    const accept: PaymentAccept = Array.isArray(requirements.accepts)
      ? requirements.accepts[0]
      : requirements

    const amountMotes = accept.maxAmountRequired
    const payTo = accept.payTo

    // Build a native CSPR transfer deploy using the SDK helper
    const deploy: Deploy = makeCsprTransferDeploy({
      senderPublicKeyHex: publicKeyHex,
      recipientPublicKeyHex: payTo,
      transferAmount: amountMotes,
      paymentAmount: "100000000", // 0.1 CSPR gas
      chainName: "casper-test",
    })

    const deployJson = JSON.stringify(Deploy.toJSON(deploy))
    const { signature, cancelled } = await window.casperWallet.sign(deployJson, publicKeyHex)

    if (cancelled) throw new Error("User cancelled the Casper Wallet payment")

    return {
      x402Version: 1 as const,
      scheme: "exact",
      network: "casper-testnet",
      payload: {
        deployHash: deploy.hash,
        signature,
        senderPublicKey: publicKeyHex,
        recipientAddress: payTo,
        amountMotes,
      },
    }
  },
}

// Build a v1 x402 client with Casper testnet scheme registered
export function createCasperX402Client() {
  const client = new x402Client()
  client.registerV1("casper-testnet", casperSchemeClient as never)
  return client
}

// Drop-in fetch replacement: catches 402 → triggers Casper Wallet → retries
export function createPaymentFetch() {
  const client = createCasperX402Client()
  return wrapFetchWithPayment(fetch, client)
}
