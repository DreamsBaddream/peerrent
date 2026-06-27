import ItemCard from "@/components/ItemCard"
import { Listing } from "@/lib/types"

async function getListings(): Promise<Listing[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/listings`,
      { cache: "no-store" }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.listings ?? data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const listings = await getListings()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Borrow Anything, From Anyone
        </h1>
        <p className="mt-3 text-gray-400 text-lg">
          Rent cameras, bikes, tools, and more — secured by Casper Network.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-gray-500 text-lg">No items listed yet.</p>
          <p className="text-gray-600 text-sm mt-1">Be the first!</p>
          <a
            href="/list"
            className="mt-6 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors"
          >
            List an Item
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ItemCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              photos={listing.photos}
              price_per_day={listing.price_per_day}
              deposit_amount={listing.deposit_amount}
            />
          ))}
        </div>
      )}
    </div>
  )
}
