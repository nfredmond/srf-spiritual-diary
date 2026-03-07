export interface OperationsStatus {
  ok: boolean;
  runDate: string;
  imageExists: boolean;
  image?: {
    provider?: string;
    status?: string;
    created_at?: string;
  } | null;
}

export const STATUS_STALE_THRESHOLD_MINUTES = 15;

export function mapOpsErrorToFriendlyMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Daily operations status is temporarily unavailable. You can continue reading while we reconnect.';
  }

  const lower = error.message.toLowerCase();

  if (lower.includes('status api failed')) {
    return 'Daily operations status is temporarily unavailable. You can continue reading while we reconnect.';
  }

  if (lower.includes('json') || lower.includes('unexpected token')) {
    return 'The status service returned an unexpected response. Please try again in a moment.';
  }

  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Network connection issue while checking today’s status. Please try again.';
  }

  return 'Unable to load operations status right now. You can continue using the diary normally.';
}

export function getStatusFreshness(
  lastCheckedAt: Date | null,
  now: Date = new Date(),
  staleAfterMinutes: number = STATUS_STALE_THRESHOLD_MINUTES,
): { minutesSinceCheck: number | null; isStale: boolean } {
  if (!lastCheckedAt) {
    return { minutesSinceCheck: null, isStale: false };
  }

  const diffMs = Math.max(0, now.getTime() - lastCheckedAt.getTime());
  const minutesSinceCheck = Math.floor(diffMs / 60_000);

  return {
    minutesSinceCheck,
    isStale: diffMs >= staleAfterMinutes * 60_000,
  };
}

export function formatStatusRelativeAge(minutesSinceCheck: number | null): string {
  if (minutesSinceCheck === null) {
    return 'not checked yet';
  }

  if (minutesSinceCheck < 1) {
    return 'just now';
  }

  if (minutesSinceCheck === 1) {
    return '1 minute ago';
  }

  return `${minutesSinceCheck} minutes ago`;
}

export function formatStatusTimestamp(timestamp: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}

export function getOperationsRefreshButtonAriaLabel(input: {
  loading: boolean;
  lastCheckedAt: Date | null;
  minutesSinceCheck: number | null;
  isStale: boolean;
}): string {
  if (input.loading) {
    return 'Refreshing operations status. Please wait.';
  }

  if (!input.lastCheckedAt) {
    return 'Refresh operations status now. Status checks are read-only and do not change your diary entries.';
  }

  const freshness = formatStatusRelativeAge(input.minutesSinceCheck);
  const staleSentence = input.isStale ? ' The current status may be outdated.' : '';

  return `Refresh operations status now. Last checked ${freshness}.${staleSentence} Status checks are read-only and do not change your diary entries.`;
}

export function getOperationsStatusAnnouncement(input: {
  loading: boolean;
  error: string | null;
  status: OperationsStatus | null;
  lastCheckedAt: Date | null;
}): string {
  if (input.loading) {
    return 'Checking daily operations status.';
  }

  if (input.error) {
    return `Status check failed. ${input.error}`;
  }

  if (input.status && input.lastCheckedAt) {
    return `Status updated at ${formatStatusTimestamp(input.lastCheckedAt)}. Quote API is ${input.status.ok ? 'healthy' : 'degraded'}.`;
  }

  return 'Operations status panel ready.';
}
