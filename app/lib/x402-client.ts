"use client"

import { x402Client } from "@x402/core/client"
import { wrapFetchWithPayment } from "@x402/fetch"
import { NativeTransferBuilder, PublicKey, AccountHash } from "casper-js-sdk"

interface PaymentAccept {
  maxAmountRequired: string
  payTo: string // "00" + 64-hex account hash (Casper x402 format)
  scheme?: string
  network?: string
}

const casperSchemeClient = {
  async createPaymentPayload(requirements: { accepts?: PaymentAccept[] } & PaymentAccept) {
    const publicKeyHex = localStorage.getItem("casper_public_key")
    if (!publicKeyHex) throw new Error("Casper Wallet not connected")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).casperWallet) throw new Error("Casper Wallet extension not found")

    const accept: PaymentAccept = Array.isArray(requirements.accepts)
      ? requirements.accepts[0]
      : requirements

    const amountMotes = accept.maxAmountRequired
    const payTo = accept.payTo

    const senderPublicKey = PublicKey.fromHex(publicKeyHex)

    // payTo is "00" + 64-hex — strip the "00" prefix for AccountHash.fromString
    const rawHash = payTo.startsWith("00") ? payTo.slice(2) : payTo
    const recipientAccountHash = AccountHash.fromString(`account-hash-${rawHash}`)

    const transaction = new NativeTransferBuilder()
      .from(senderPublicKey)
      .targetAccountHash(recipientAccountHash)
      .amount(amountMotes)
      .id(Date.now())
      .chainName("casper-test")
      .payment(100_000_000) // 0.1 CSPR gas
      .build()

    const txJson = JSON.stringify(transaction.toJSON())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { signature, cancelled } = await (window as any).casperWallet.sign(txJson, publicKeyHex)

    if (cancelled) throw new Error("User cancelled the Casper Wallet payment")

    return {
      x402Version: 1 as const,
      scheme: "exact",
      network: "casper:casper-test",
      payload: {
        transactionHash: transaction.hash.toHex(),
        signature,
        senderPublicKey: publicKeyHex,
        recipientAddress: payTo,
        amountMotes,
      },
    }
  },
}

export function createCasperX402Client() {
  const client = new x402Client()
  client.registerV1("casper:casper-test", casperSchemeClient as never)
  return client
}

export function createPaymentFetch() {
  const client = createCasperX402Client()
  return wrapFetchWithPayment(fetch, client)
}
