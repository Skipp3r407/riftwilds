import { NextResponse } from "next/server";
import { getDemoPriceHistory } from "@/lib/marketplace/demo-listings";
import { LISTING_RULES } from "@/lib/marketplace/listing-rules";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const publicId = searchParams.get("publicId") ?? "pet_demo_cinder_01";
  const history = getDemoPriceHistory(publicId);

  return NextResponse.json({
    publicId,
    history,
    languageRules: {
      allowedExample: history.summaryLine,
      forbidden: [
        "This pet is worth X",
        "Guaranteed value",
        "Will sell for X",
      ],
      disclaimer: LISTING_RULES.disclosures.noGuaranteedValue,
    },
  });
}
