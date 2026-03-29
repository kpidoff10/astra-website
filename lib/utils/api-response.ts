/**
 * Standardized API response format
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  message?: string
): ApiSuccess<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  code?: string,
  details?: Record<string, unknown>
): ApiError {
  return {
    success: false,
    error,
    ...(code && { code }),
    ...(details && { details }),
  };
}

/**
 * Create a 400 Bad Request response
 */
export function badRequest(
  error: string,
  details?: Record<string, unknown>
) {
  return new Response(
    JSON.stringify(errorResponse(error, 'BAD_REQUEST', details)),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorized(error: string = 'Unauthorized') {
  return new Response(JSON.stringify(errorResponse(error, 'UNAUTHORIZED')), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create a 403 Forbidden response
 */
export function forbidden(error: string = 'Forbidden') {
  return new Response(JSON.stringify(errorResponse(error, 'FORBIDDEN')), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create a 404 Not Found response
 */
export function notFound(error: string = 'Not found') {
  return new Response(JSON.stringify(errorResponse(error, 'NOT_FOUND')), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create a 409 Conflict response
 */
export function conflict(error: string) {
  return new Response(JSON.stringify(errorResponse(error, 'CONFLICT')), {
    status: 409,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create a 500 Internal Server Error response
 */
export function internalError(error: string = 'Internal server error') {
  return new Response(JSON.stringify(errorResponse(error, 'INTERNAL_ERROR')), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create a successful JSON response
 */
export function jsonResponse<T>(
  data: T,
  status: number = 200,
  message?: string
) {
  return new Response(JSON.stringify(successResponse(data, message)), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
