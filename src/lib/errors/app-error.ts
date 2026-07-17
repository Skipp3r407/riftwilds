export type AppErrorBody = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
};

export class AppError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(params: {
    code: string;
    message: string;
    requestId: string;
    retryable?: boolean;
    status?: number;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(params.message);
    this.name = "AppError";
    this.code = params.code;
    this.requestId = params.requestId;
    this.retryable = params.retryable ?? false;
    this.status = params.status ?? 400;
    this.fieldErrors = params.fieldErrors;
  }

  toJSON(): AppErrorBody {
    return {
      code: this.code,
      message: this.message,
      requestId: this.requestId,
      retryable: this.retryable,
      fieldErrors: this.fieldErrors,
    };
  }
}

export const ErrorCodes = {
  WALLET_DISCONNECTED: "WALLET_DISCONNECTED",
  WRONG_NETWORK: "WRONG_NETWORK",
  SIGNATURE_REJECTED: "SIGNATURE_REJECTED",
  RPC_UNAVAILABLE: "RPC_UNAVAILABLE",
  TOKEN_BALANCE_UNAVAILABLE: "TOKEN_BALANCE_UNAVAILABLE",
  INSUFFICIENT_TOKEN_BALANCE: "INSUFFICIENT_TOKEN_BALANCE",
  EGG_ALREADY_CLAIMED: "EGG_ALREADY_CLAIMED",
  EGG_NOT_READY: "EGG_NOT_READY",
  CREATURE_UNAVAILABLE: "CREATURE_UNAVAILABLE",
  COOLDOWN_ACTIVE: "COOLDOWN_ACTIVE",
  INSUFFICIENT_ITEM: "INSUFFICIENT_ITEM",
  BATTLE_STATE_CHANGED: "BATTLE_STATE_CHANGED",
  LISTING_SOLD: "LISTING_SOLD",
  MARKETPLACE_PAUSED: "MARKETPLACE_PAUSED",
  FEATURE_NOT_LAUNCHED: "FEATURE_NOT_LAUNCHED",
  MAINTENANCE: "MAINTENANCE",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION: "VALIDATION",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL: "INTERNAL",
} as const;
