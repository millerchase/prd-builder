import { AppError, ErrorType } from './types';

export function getErrorFromStatus(status: number): AppError {
  switch (status) {
    case 429:
      return {
        type: 'rate_limit',
        message: 'Too many requests. Wait a moment and try again.',
        retryable: true,
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: 'server_error',
        message: 'The service had an issue. Please try again shortly.',
        retryable: true,
      };
    default:
      return {
        type: 'unknown',
        message: 'Something went wrong. Please try again.',
        retryable: true,
      };
  }
}

export function getTimeoutError(): AppError {
  return {
    type: 'timeout',
    message: 'Request timed out. Please try again.',
    retryable: true,
  };
}

export function getNetworkError(): AppError {
  return {
    type: 'network',
    message: 'Unable to connect. Check your internet and try again.',
    retryable: true,
  };
}

export function getParseError(): AppError {
  return {
    type: 'parse_error',
    message: 'Unable to process response. Please try again.',
    retryable: true,
  };
}

export function getConsecutiveFailureMessage(failures: number): string | null {
  if (failures >= 3) {
    return 'Having trouble connecting. Try again later.';
  }
  return null;
}
