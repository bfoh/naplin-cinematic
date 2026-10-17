/**
 * Runs `task` when the main thread is next idle (at the latest after
 * `timeout` ms), so set-up work for content below the fold stays out of the
 * hydration task. Returns a cancel function.
 */
export function whenIdle(task: () => void, timeout = 1000) {
  const hasIdle = 'requestIdleCallback' in window;
  if (hasIdle) {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 200);
  return () => window.clearTimeout(id);
}
