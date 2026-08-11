import 'server-only';
import { apiFetch } from './server-client';
import type { AuthUser, Role } from './types';

/** Agent-only on the backend; used to populate the assignee picker. */
export function listUsers(role?: Role): Promise<AuthUser[]> {
  return apiFetch<AuthUser[]>(`/users${role ? `?role=${role}` : ''}`);
}
