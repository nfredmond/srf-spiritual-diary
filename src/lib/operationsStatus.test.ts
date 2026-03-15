import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATUS_STALE_THRESHOLD_MINUTES,
  formatStatusRelativeAge,
  getOperationsRefreshButtonAriaLabel,
  getOperationsStatusAnnouncement,
  getStatusFreshness,
  mapOpsErrorToFriendlyMessage,
} from './operationsStatus.ts';

test('mapOpsErrorToFriendlyMessage handles network and unknown errors', () => {
  const networkMessage = mapOpsErrorToFriendlyMessage(new Error('Failed to fetch'));
  assert.equal(
    networkMessage,
    'Network connection issue while checking today’s status. Please try again.',
  );

  const unknownMessage = mapOpsErrorToFriendlyMessage(new Error('boom'));
  assert.equal(
    unknownMessage,
    'Unable to load operations status right now. You can continue using the diary normally.',
  );

  const nonErrorMessage = mapOpsErrorToFriendlyMessage({ reason: 'down' });
  assert.equal(
    nonErrorMessage,
    'Daily operations status is temporarily unavailable. You can continue reading while we reconnect.',
  );
});

test('getStatusFreshness marks stale data after threshold', () => {
  const now = new Date('2026-03-06T20:00:00.000Z');
  const freshCheck = new Date('2026-03-06T19:50:00.000Z');
  const staleCheck = new Date('2026-03-06T19:30:00.000Z');

  const fresh = getStatusFreshness(freshCheck, now);
  assert.equal(fresh.minutesSinceCheck, 10);
  assert.equal(fresh.isStale, false);

  const stale = getStatusFreshness(staleCheck, now);
  assert.equal(stale.minutesSinceCheck, 30);
  assert.equal(stale.isStale, true);

  const noCheck = getStatusFreshness(null, now, STATUS_STALE_THRESHOLD_MINUTES);
  assert.deepEqual(noCheck, { minutesSinceCheck: null, isStale: false });
});

test('formatStatusRelativeAge returns human-readable labels', () => {
  assert.equal(formatStatusRelativeAge(null), 'not checked yet');
  assert.equal(formatStatusRelativeAge(0), 'just now');
  assert.equal(formatStatusRelativeAge(1), '1 minute ago');
  assert.equal(formatStatusRelativeAge(7), '7 minutes ago');
});

test('getOperationsRefreshButtonAriaLabel adds trust + freshness context', () => {
  const loadingLabel = getOperationsRefreshButtonAriaLabel({
    loading: true,
    lastCheckedAt: null,
    minutesSinceCheck: null,
    isStale: false,
  });
  assert.match(loadingLabel, /Refreshing operations status/);

  const firstCheckLabel = getOperationsRefreshButtonAriaLabel({
    loading: false,
    lastCheckedAt: null,
    minutesSinceCheck: null,
    isStale: false,
  });
  assert.match(firstCheckLabel, /read-only/);
  assert.match(firstCheckLabel, /do not change your diary entries/);

  const staleLabel = getOperationsRefreshButtonAriaLabel({
    loading: false,
    lastCheckedAt: new Date('2026-03-06T20:00:00.000Z'),
    minutesSinceCheck: 21,
    isStale: true,
  });
  assert.match(staleLabel, /Last checked 21 minutes ago/);
  assert.match(staleLabel, /may be outdated/);
});

test('getOperationsStatusAnnouncement narrates loading, error, and success states', () => {
  const loadingMessage = getOperationsStatusAnnouncement({
    loading: true,
    error: null,
    status: null,
    lastCheckedAt: null,
  });
  assert.equal(loadingMessage, 'Checking daily operations status.');

  const errorMessage = getOperationsStatusAnnouncement({
    loading: false,
    error: 'Network connection issue while checking today’s status. Please try again.',
    status: null,
    lastCheckedAt: null,
  });
  assert.match(errorMessage, /Status check failed\./);

  const successMessage = getOperationsStatusAnnouncement({
    loading: false,
    error: null,
    status: {
      ok: true,
      runDate: '2026-03-06',
      imageExists: true,
      image: {
        provider: 'gemini',
        status: 'completed',
        created_at: '2026-03-06T10:00:00.000Z',
      },
    },
    lastCheckedAt: new Date('2026-03-06T20:00:00.000Z'),
  });
  assert.match(successMessage, /Status updated at/);
  assert.match(successMessage, /Quote API is healthy\./);
});
