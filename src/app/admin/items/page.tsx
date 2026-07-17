import Link from "next/link";
import { catalogStats } from "@/lib/items/catalog";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { PRICE_CONFIG_VERSION } from "@/lib/items/pricing";
import { itemDisclosures } from "@/lib/items/disclosures";

export const metadata = { title: "Admin · Items" };

const sections = [
  "Item definitions",
  "Rarity settings",
  "Prices",
  "Supply",
  "Shop availability",
  "Crafting recipes",
  "Marketplace fees",
  "Artwork",
  "Purchases",
  "Inventory adjustments",
  "Payment reconciliation",
  "Suspicious activity",
];

export default function AdminItemsPage() {
  const stats = catalogStats();
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">Admin · Items</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Catalog shell. Mutations require admin identity, reason, timestamp, and audit log.
            Historical orders are never rewritten by price changes.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/assets/equipment-aligner" className="btn-secondary focus-ring text-sm">
            Equipment aligner
          </Link>
          <Link href="/shop" className="btn-secondary focus-ring text-sm">
            Public shop
          </Link>
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Admin home
          </Link>
        </div>
      </div>

      <section className="panel p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Catalog snapshot</h2>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          <li>Weapons: {stats.weapons}</li>
          <li>Armor: {stats.armor}</li>
          <li>Potions/care: {stats.potions}</li>
          <li>Materials: {stats.materials}</li>
          <li>Abilities: {stats.abilities}</li>
          <li>Price config version: {PRICE_CONFIG_VERSION}</li>
        </ul>
        <ul className="mt-4 space-y-1">
          <li>SOL_ITEM_PURCHASES_ENABLED: {String(featureFlagDefaults.SOL_ITEM_PURCHASES_ENABLED)}</li>
          <li>PAID_RANDOM_REWARDS_ENABLED: {String(featureFlagDefaults.PAID_RANDOM_REWARDS_ENABLED)}</li>
          <li>ITEM_MARKETPLACE_ENABLED: {String(featureFlagDefaults.ITEM_MARKETPLACE_ENABLED)}</li>
          <li>
            RANKED_EQUIPMENT_NORMALIZATION_ENABLED:{" "}
            {String(featureFlagDefaults.RANKED_EQUIPMENT_NORMALIZATION_ENABLED)}
          </li>
        </ul>
        <p className="mt-4 text-xs">{itemDisclosures.shop}</p>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {sections.map((s) => (
          <div key={s} className="panel p-4 text-sm text-[var(--text-muted)]">
            {s}
            <p className="mt-1 text-[10px]">Requires reason + audit log</p>
          </div>
        ))}
      </section>
    </main>
  );
}
