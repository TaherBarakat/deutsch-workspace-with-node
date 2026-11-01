/**
 * Wraps an async route handler so rejected promises reach Express' error
 * middleware instead of crashing the process.
 */
export function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
