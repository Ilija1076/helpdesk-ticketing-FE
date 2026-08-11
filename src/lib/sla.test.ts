import { describe, expect, it } from 'vitest';
import { formatDuration, isBreached, slaState } from './sla';
import type { SlaClock, Ticket } from './api/types';

const NOW = Date.parse('2026-08-11T12:00:00.000Z');

const clock = (overrides: Partial<SlaClock> = {}): SlaClock => ({
  dueAt: null,
  metAt: null,
  breachedAt: null,
  ...overrides,
});

describe('slaState', () => {
  it('reports breached ahead of everything else', () => {
    // A ticket can be both met and breached across its two clocks; for one clock the
    // breach is the fact that matters, so it must win regardless of the other fields.
    const state = slaState(
      clock({
        dueAt: '2026-08-11T09:00:00.000Z',
        metAt: '2026-08-11T08:00:00.000Z',
        breachedAt: '2026-08-11T10:00:00.000Z',
      }),
      NOW,
    );

    expect(state).toEqual({ kind: 'breached', at: new Date('2026-08-11T10:00:00.000Z') });
  });

  it('reports met when the clock was stopped in time', () => {
    const state = slaState(
      clock({ dueAt: '2026-08-11T14:00:00.000Z', metAt: '2026-08-11T11:00:00.000Z' }),
      NOW,
    );

    expect(state).toEqual({ kind: 'met', at: new Date('2026-08-11T11:00:00.000Z') });
  });

  it('has no state when no deadline was ever stamped', () => {
    expect(slaState(clock(), NOW)).toEqual({ kind: 'none' });
  });

  it('counts down while the deadline is ahead', () => {
    const state = slaState(clock({ dueAt: '2026-08-11T14:30:00.000Z' }), NOW);

    expect(state).toEqual({
      kind: 'due',
      dueAt: new Date('2026-08-11T14:30:00.000Z'),
      minutesLeft: 150,
    });
  });

  /**
   * The distinction this whole module exists for. The backend stamps `breachedAt` from a
   * job that sweeps on an interval, so between the deadline passing and the next sweep a
   * ticket is past due but not yet recorded as breached. Calling that "breached" would
   * assert something the API has not said.
   */
  it('separates overdue from breached while the sweeper has not run', () => {
    const state = slaState(clock({ dueAt: '2026-08-11T11:00:00.000Z' }), NOW);

    expect(state).toEqual({
      kind: 'overdue',
      dueAt: new Date('2026-08-11T11:00:00.000Z'),
      minutesOver: 60,
    });
  });

  it('treats the exact deadline as overdue rather than due', () => {
    const state = slaState(clock({ dueAt: '2026-08-11T12:00:00.000Z' }), NOW);

    expect(state.kind).toBe('overdue');
  });
});

describe('isBreached', () => {
  const ticket = (sla: Partial<Ticket['sla']>): Ticket =>
    ({
      sla: { firstResponse: clock(), resolution: clock(), ...sla },
    }) as Ticket;

  it('is true when either clock has breached', () => {
    expect(
      isBreached(ticket({ firstResponse: clock({ breachedAt: '2026-08-01T00:00:00Z' }) })),
    ).toBe(true);
    expect(isBreached(ticket({ resolution: clock({ breachedAt: '2026-08-01T00:00:00Z' }) }))).toBe(
      true,
    );
  });

  it('is false when neither has', () => {
    expect(isBreached(ticket({}))).toBe(false);
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '0m'],
    [45, '45m'],
    [60, '1h'],
    [150, '2h 30m'],
    [1440, '1d'],
    [1500, '1d 1h'],
  ])('formats %i minutes as %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });

  it('ignores the sign so callers can label the direction themselves', () => {
    expect(formatDuration(-150)).toBe('2h 30m');
  });
});
