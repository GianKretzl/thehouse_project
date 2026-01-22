/**
 * Request deduplication utility
 * Prevents duplicate concurrent requests to the same endpoint
 */

const pendingRequests = new Map<string, Promise<any>>()

/**
 * Deduplicate concurrent requests
 * If a request is already in flight, return the existing promise
 */
export async function dedupe<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if request is already pending
  const pending = pendingRequests.get(key)
  if (pending) {
    return pending as Promise<T>
  }

  // Start new request
  const promise = fetcher()
    .finally(() => {
      // Clean up after request completes
      pendingRequests.delete(key)
    })

  pendingRequests.set(key, promise)
  return promise
}

/**
 * Clear all pending requests
 */
export function clearPendingRequests() {
  pendingRequests.clear()
}
