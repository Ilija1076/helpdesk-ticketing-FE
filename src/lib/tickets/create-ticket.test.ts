import { describe, expect, it } from 'vitest';
import { buildCreateTicketBody, createTicketSchema } from './create-ticket';

const valid = {
  title: 'VPN client will not connect',
  description: 'Error 809 since this morning on the laptop.',
};

describe('createTicketSchema', () => {
  it('accepts a well-formed ticket', () => {
    expect(createTicketSchema.safeParse(valid).success).toBe(true);
  });

  it('trims before measuring, so whitespace cannot pad a short title', () => {
    const result = createTicketSchema.safeParse({ ...valid, title: '  ab  ' });
    expect(result.success).toBe(false);
  });

  it('rejects a description that is too short', () => {
    const result = createTicketSchema.safeParse({ ...valid, description: 'broken' });
    expect(result.success).toBe(false);
  });

  it('rejects a priority outside the contract', () => {
    const result = createTicketSchema.safeParse({ ...valid, priority: 'CATASTROPHIC' });
    expect(result.success).toBe(false);
  });

  it('leaves priority absent rather than defaulting it', () => {
    // The backend applies MEDIUM itself; sending it explicitly would hide that.
    const result = createTicketSchema.parse(valid);
    expect(result.priority).toBeUndefined();
  });
});

describe('buildCreateTicketBody', () => {
  it('keeps the priority an agent chose', () => {
    const body = buildCreateTicketBody('AGENT', { ...valid, priority: 'URGENT' });
    expect(body.priority).toBe('URGENT');
  });

  /**
   * The rule this function exists for. Priority selects the SLA policy, so a client who
   * posts `URGENT` would be handing themselves a 30-minute response deadline. The backend
   * accepts it, so dropping it here is the only thing that stops it — which is why this is
   * a function rather than a hidden field in the form.
   */
  it('drops a priority a client tried to set', () => {
    const body = buildCreateTicketBody('CLIENT', { ...valid, priority: 'URGENT' });
    expect(body.priority).toBeUndefined();
    expect(body).toEqual({ title: valid.title, description: valid.description });
  });

  it('omits priority entirely when nobody chose one', () => {
    expect(buildCreateTicketBody('AGENT', valid)).not.toHaveProperty('priority');
  });
});
