import { Prisma } from "@prisma/client";
import { ErrorCodes } from "@/lib/errors/app-error";

export type RegistrationFailure = {
  message: string;
  status: number;
  code: string;
  fieldErrors?: Record<string, string[]>;
  retryable: boolean;
};

function targetFields(meta: unknown): string[] {
  const target = (meta as { target?: unknown } | undefined)?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];
  return [];
}

/** Map Prisma / DB failures to actionable signup messages (never leak secrets). */
export function mapRegistrationFailure(error: unknown): RegistrationFailure {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const fields = targetFields(error.meta).map((f) => f.toLowerCase());
      if (fields.some((f) => f.includes("email"))) {
        return {
          code: ErrorCodes.VALIDATION,
          message: "An account with this email already exists.",
          status: 400,
          fieldErrors: { email: ["Already registered"] },
          retryable: false,
        };
      }
      if (fields.some((f) => f.includes("username"))) {
        return {
          code: ErrorCodes.VALIDATION,
          message: "That username is taken.",
          status: 400,
          fieldErrors: { username: ["Taken"] },
          retryable: false,
        };
      }
      return {
        code: ErrorCodes.VALIDATION,
        message: "That account already exists.",
        status: 400,
        retryable: false,
      };
    }
    if (error.code === "P2022") {
      return {
        code: ErrorCodes.INTERNAL,
        message: "Database schema is out of date. Run migrations, then try again.",
        status: 503,
        retryable: true,
      };
    }
  }

  const message = error instanceof Error ? error.message : String(error);
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    /can't reach database server/i.test(message) ||
    /timed out fetching a new connection/i.test(message) ||
    /connection.*(refused|reset|closed)/i.test(message)
  ) {
    return {
      code: ErrorCodes.INTERNAL,
      message:
        "Database is unreachable. Confirm Neon DATABASE_URL is loaded, then restart the local server.",
      status: 503,
      retryable: true,
    };
  }

  return {
    code: ErrorCodes.INTERNAL,
    message: "Registration failed due to a server error. Try again in a moment.",
    status: 500,
    retryable: true,
  };
}
