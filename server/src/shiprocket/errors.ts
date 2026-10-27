export type ShiprocketErrorCategory =
  | 'invalid_request'
  | 'authentication'
  | 'authorization'
  | 'rate_limit'
  | 'timeout'
  | 'network'
  | 'provider_server'
  | 'invalid_response'
  | 'unknown_outcome'
  | 'not_configured';

export class ShiprocketError extends Error {
  readonly category: ShiprocketErrorCategory;
  readonly status?: number;
  readonly retryable: boolean;
  readonly details?: unknown;

  constructor(
    category: ShiprocketErrorCategory,
    message: string,
    options?: { status?: number; retryable?: boolean; details?: unknown; cause?: unknown },
  ) {
    super(message);
    this.name = 'ShiprocketError';
    this.category = category;
    this.status = options?.status;
    this.retryable = options?.retryable ?? false;
    this.details = options?.details;
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export function classifyHttpStatus(status: number): { category: ShiprocketErrorCategory; retryable: boolean } {
  if (status === 401) return { category: 'authentication', retryable: false };
  if (status === 403) return { category: 'authorization', retryable: false };
  if (status === 429) return { category: 'rate_limit', retryable: true };
  if (status === 400 || status === 404 || status === 405 || status === 422) {
    return { category: 'invalid_request', retryable: false };
  }
  if (status >= 500) return { category: 'provider_server', retryable: true };
  return { category: 'invalid_response', retryable: false };
}
