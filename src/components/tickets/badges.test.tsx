// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SlaBadge, StatusBadge } from './badges';
import type { SlaClock } from '@/lib/api/types';

const NOW = Date.parse('2026-08-11T12:00:00.000Z');

const clock = (overrides: Partial<SlaClock> = {}): SlaClock => ({
  dueAt: null,
  metAt: null,
  breachedAt: null,
  ...overrides,
});

describe('SlaBadge', () => {
  it('names a breach outright', () => {
    render(
      <SlaBadge
        clock={clock({ breachedAt: '2026-08-10T09:00:00Z' })}
        label="Resolution"
        now={NOW}
      />,
    );
    expect(screen.getByText('Breached')).toBeInTheDocument();
  });

  it('says overdue, not breached, before the sweeper has recorded it', () => {
    render(
      <SlaBadge clock={clock({ dueAt: '2026-08-11T11:00:00Z' })} label="Resolution" now={NOW} />,
    );

    expect(screen.getByText('Overdue 1h')).toBeInTheDocument();
    expect(screen.queryByText('Breached')).not.toBeInTheDocument();
  });

  it('shows the remaining time while the deadline is ahead', () => {
    render(
      <SlaBadge clock={clock({ dueAt: '2026-08-11T14:30:00Z' })} label="Resolution" now={NOW} />,
    );
    expect(screen.getByText('2h 30m')).toBeInTheDocument();
  });

  it('renders a dash when no deadline was stamped', () => {
    render(<SlaBadge clock={clock()} label="First response" now={NOW} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('StatusBadge', () => {
  it('carries the status as text, so colour is never the only channel', () => {
    render(<StatusBadge status="WAITING_ON_CUSTOMER" />);
    expect(screen.getByText('Waiting on customer')).toBeInTheDocument();
  });
});
