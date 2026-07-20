import { prisma } from "@/lib/db/prisma";
import { isValidUsername } from "@/lib/auth/password";
import { LEGAL_PRIVACY_VERSION, LEGAL_TERMS_VERSION } from "@/lib/auth/legal-versions";
import { writeSecurityAudit } from "@/lib/auth/security-audit";

export type OnboardingStepId =
  | "verify_email"
  | "display_name"
  | "username"
  | "age"
  | "legal"
  | "region"
  | "starter_keeper"
  | "starter_egg"
  | "tutorial";

export type OnboardingState = {
  complete: boolean;
  steps: Array<{
    id: OnboardingStepId;
    required: boolean;
    done: boolean;
    label: string;
  }>;
  nextStep: OnboardingStepId | null;
};

export async function getOnboardingState(userId: string): Promise<OnboardingState> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) {
    return { complete: false, steps: [], nextStep: null };
  }

  const ageRequired = Boolean(user.region && ["US", "KR", "EU"].includes(user.region));
  const steps: OnboardingState["steps"] = [
    {
      id: "verify_email",
      required: Boolean(user.email) && !user.emailVerifiedAt,
      done: !user.email || Boolean(user.emailVerifiedAt),
      label: "Verify email",
    },
    {
      id: "display_name",
      required: true,
      done: Boolean(user.profile?.displayName?.trim()),
      label: "Display name",
    },
    {
      id: "username",
      required: true,
      done: Boolean(user.profile?.username),
      label: "Username",
    },
    {
      id: "age",
      required: ageRequired || !user.dateOfBirth,
      done: Boolean(user.dateOfBirth) && user.accountStatus !== "PARENTAL_CONSENT_REQUIRED",
      label: "Date of birth",
    },
    {
      id: "legal",
      required: true,
      done: Boolean(user.termsAcceptedAt && user.privacyAcceptedAt),
      label: "Terms & Privacy",
    },
    {
      id: "region",
      required: true,
      done: Boolean(user.region),
      label: "Region",
    },
    {
      id: "starter_keeper",
      required: true,
      done: Boolean(user.profile?.starterKeeperChosen),
      label: "Starter Keeper",
    },
    {
      id: "starter_egg",
      required: true,
      done: Boolean(user.profile?.starterEggClaimed),
      label: "Starter Egg",
    },
    {
      id: "tutorial",
      required: true,
      done: Boolean(user.profile?.tutorialIntroSeen),
      label: "Tutorial intro",
    },
  ];

  const next = steps.find((s) => s.required && !s.done)?.id ?? null;
  const complete = Boolean(user.onboardingCompletedAt) || next === null;

  if (complete && !user.onboardingCompletedAt) {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompletedAt: new Date() },
    });
  }

  return { complete, steps, nextStep: complete ? null : next };
}

export async function applyOnboardingProgress(
  userId: string,
  input: {
    displayName?: string;
    username?: string;
    dateOfBirth?: string;
    region?: string;
    acceptTerms?: boolean;
    acceptPrivacy?: boolean;
    starterKeeperId?: string;
    claimStarterEgg?: boolean;
    tutorialIntroSeen?: boolean;
    parentalConsent?: boolean;
  },
): Promise<{ ok: true; state: OnboardingState } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) return { ok: false, error: "Account not found." };

  if (input.username !== undefined) {
    if (!isValidUsername(input.username)) {
      return {
        ok: false,
        error: "Username must be 3–24 chars, start with a letter, and use only letters, numbers, underscore.",
      };
    }
    const taken = await prisma.playerProfile.findFirst({
      where: { username: input.username, NOT: { userId } },
    });
    if (taken) return { ok: false, error: "Username is taken." };
  }

  let accountStatus = user.accountStatus;
  let parentalConsentAt = user.parentalConsentAt;
  let dateOfBirth = user.dateOfBirth;

  if (input.dateOfBirth) {
    const dob = new Date(input.dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      return { ok: false, error: "Invalid date of birth." };
    }
    dateOfBirth = dob;
    const ageMs = Date.now() - dob.getTime();
    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
    if (ageYears < 13) {
      accountStatus = "PARENTAL_CONSENT_REQUIRED";
      if (!input.parentalConsent && !user.parentalConsentAt) {
        // Keep blocked until consent flag provided by guardian flow.
      }
    } else if (accountStatus === "PARENTAL_CONSENT_REQUIRED" && ageYears >= 13) {
      accountStatus = user.emailVerifiedAt ? "ACTIVE" : "PENDING_VERIFICATION";
    }
  }

  if (input.parentalConsent && accountStatus === "PARENTAL_CONSENT_REQUIRED") {
    parentalConsentAt = new Date();
    accountStatus = user.emailVerifiedAt ? "ACTIVE" : "PENDING_VERIFICATION";
  }

  if (input.acceptTerms === false || input.acceptPrivacy === false) {
    return { ok: false, error: "Terms and Privacy acceptance are required." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        dateOfBirth: dateOfBirth ?? undefined,
        region: input.region ?? undefined,
        accountStatus,
        parentalConsentAt: parentalConsentAt ?? undefined,
        termsAcceptedAt:
          input.acceptTerms === true ? new Date() : user.termsAcceptedAt,
        privacyAcceptedAt:
          input.acceptPrivacy === true ? new Date() : user.privacyAcceptedAt,
      },
    });

    await tx.playerProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: input.displayName?.trim() || undefined,
        username: input.username,
        starterKeeperChosen: Boolean(input.starterKeeperId),
        starterEggClaimed: Boolean(input.claimStarterEgg),
        tutorialIntroSeen: Boolean(input.tutorialIntroSeen),
      },
      update: {
        displayName: input.displayName?.trim() || undefined,
        username: input.username,
        starterKeeperChosen: input.starterKeeperId
          ? true
          : undefined,
        starterEggClaimed: input.claimStarterEgg ? true : undefined,
        tutorialIntroSeen: input.tutorialIntroSeen ? true : undefined,
      },
    });

    if (input.acceptTerms) {
      await tx.termsAcceptance.upsert({
        where: {
          userId_version: { userId, version: LEGAL_TERMS_VERSION },
        },
        create: { userId, version: LEGAL_TERMS_VERSION },
        update: { acceptedAt: new Date() },
      });
    }
    if (input.acceptPrivacy) {
      await tx.privacyAcceptance.upsert({
        where: {
          userId_version: { userId, version: LEGAL_PRIVACY_VERSION },
        },
        create: { userId, version: LEGAL_PRIVACY_VERSION },
        update: { acceptedAt: new Date() },
      });
    }
  });

  const state = await getOnboardingState(userId);
  if (state.complete) {
    await writeSecurityAudit({
      userId,
      action: "onboarding.completed",
    });
  }

  return { ok: true, state };
}
