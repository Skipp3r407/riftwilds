import { NextResponse } from "next/server";

type Body = {
  email?: string;
  source?: string;
};

/**
 * Newsletter interest stub — validates email and acknowledges signup.
 * No external ESP wired yet; responses stay honest about "coming soon."
 */
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Send a JSON body with an email." },
      { status: 400 },
    );
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valid) {
    return NextResponse.json(
      { ok: false, message: "That doesn’t look like a valid email." },
      { status: 400 },
    );
  }

  // Stub persistence: log for local/dev visibility only.
  console.info("[newsletter-stub]", {
    email: email.replace(/(^.).*(@.*$)/, "$1***$2"),
    source: body.source ?? "unknown",
    at: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    message:
      "You’re on the interest list. Keeper Dispatch emails aren’t sending yet — coming soon.",
    comingSoon: true,
  });
}
