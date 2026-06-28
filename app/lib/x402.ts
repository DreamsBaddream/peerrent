import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server"
import type { RouteConfig } from "@x402/core/server"
import { withX402 } from "@x402/next"

function buildServer() {
  const facilitator = new HTTPFacilitatorClient({
    url: process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator",
  })
  return new x402ResourceServer(facilitator)
}

export const x402Server = buildServer()

// 1 CSPR expressed in motes (1 CSPR = 1,000,000,000 motes)
// network format is "scheme:network" per x402 v2 spec
export const rentalPaymentConfig: RouteConfig = {
  accepts: {
    scheme: "exact",
    network: "cspr:testnet" as `${string}:${string}`,
    price: "1000000000",
    payTo: process.env.CASPER_WALLET_ADDRESS || "",
  },
  description: "Pay 1 CSPR to initiate rental via Casper Network",
}

export { withX402 }
