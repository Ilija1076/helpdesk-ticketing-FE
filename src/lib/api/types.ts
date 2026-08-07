import type { components, operations } from './schema';

type Schemas = components['schemas'];

export type Role = Schemas['AuthUserDto']['role'];
export type TicketStatus = Schemas['TicketDto']['status'];
export type TicketPriority = Schemas['TicketDto']['priority'];

export type AuthUser = Schemas['AuthUserDto'];
export type AuthResponse = Schemas['AuthResponseDto'];
export type LoginBody = Schemas['LoginDto'];
export type RegisterBody = Schemas['RegisterDto'];

export type TicketParty = Schemas['TicketPartyDto'];
export type SlaClock = Schemas['SlaClockDto'];
export type TicketStats = Schemas['TicketStatsDto'];
export type CreateTicketBody = Schemas['CreateTicketDto'];
export type UpdateTicketBody = Schemas['UpdateTicketDto'];
export type CreateCommentBody = Schemas['CreateCommentDto'];
export type Comment = Schemas['CommentDto'];

/**
 * The backend annotates `policyName` with a bare `@ApiPropertyOptional({ nullable: true })`,
 * so the spec emits an untyped object instead of a string. Narrow it back here until the
 * backend adds `type: String` to that decorator.
 */
export type TicketSla = Omit<Schemas['TicketSlaDto'], 'policyName'> & {
  policyName: string | null;
};

export type Ticket = Omit<Schemas['TicketDto'], 'sla'> & {
  sla: TicketSla;
};

export type PaginationMeta = Schemas['PaginationMetaDto'];

/**
 * `PaginatedDto` is generic in NestJS but Swagger erases the type argument, leaving
 * `data: Record<string, never>[]`. Every list endpoint returns this shape, so we declare
 * the generic ourselves rather than intersecting with the broken schema type.
 */
export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type TicketListQuery = NonNullable<
  operations['TicketsController_findMany']['parameters']['query']
>;

export type TicketSortField = NonNullable<TicketListQuery['sortBy']>;
export type SortOrder = NonNullable<TicketListQuery['sortOrder']>;

export const TICKET_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'priority',
  'resolutionDueAt',
] as const satisfies readonly TicketSortField[];

export const TICKET_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'WAITING_ON_CUSTOMER',
  'RESOLVED',
  'CLOSED',
] as const satisfies readonly TicketStatus[];

export const TICKET_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
] as const satisfies readonly TicketPriority[];

/**
 * Mirrors ALLOWED_TRANSITIONS in the backend. Kept here so the UI can disable impossible
 * status changes instead of letting the API reject them with a 400.
 */
export const ALLOWED_TRANSITIONS: Record<TicketStatus, readonly TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['OPEN', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED'],
  WAITING_ON_CUSTOMER: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['IN_PROGRESS', 'CLOSED'],
  CLOSED: [],
};
