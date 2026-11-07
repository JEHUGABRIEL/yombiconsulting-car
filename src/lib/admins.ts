import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { query } from './db';
import { hashPassword, passwordProblem } from './password';
import type {
  AdminRole,
  AdminStatus,
  InvitationLookup,
  InvitationState,
  PendingInvitation,
  TeamMember,
} from './admin-team-shared';

/**
 * Équipe administrative : liste, invitations, rôles et blocage.
 *
 * Le jeton d'invitation n'est jamais stocké en clair : la base garde son
 * empreinte SHA-256, et le lien complet n'est montré qu'une fois au superadmin
 * qui vient de le créer. Perdu, il faut révoquer l'invitation et en refaire une.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[a-zA-Z0-9._-]{3,32}$/;
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{32,128}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_NAME = 80;

/** Durée de validité d'un lien d'invitation. */
export const INVITATION_TTL_DAYS = 7;

const iso = (value: unknown): string =>
  value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : '';

const str = (value: unknown): string => (typeof value === 'string' ? value : '');

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export function isAdminRole(value: unknown): value is AdminRole {
  return value === 'admin' || value === 'superadmin';
}

export function isAdminStatus(value: unknown): value is AdminStatus {
  return value === 'active' || value === 'blocked';
}

function toMember(row: Record<string, unknown>): TeamMember {
  return {
    id: str(row.id),
    email: str(row.email),
    username: row.username === null || row.username === undefined ? null : str(row.username),
    displayName: str(row.display_name),
    jobTitle: str(row.job_title),
    avatarUrl: str(row.avatar_url),
    role: str(row.role) === 'superadmin' ? 'superadmin' : 'admin',
    status: str(row.status) === 'blocked' ? 'blocked' : 'active',
    createdAt: iso(row.created_at),
    lastLoginAt: iso(row.last_login_at),
    mfaEnabled: Boolean(row.totp_enabled_at),
  };
}

const MEMBER_COLUMNS = `id, email, username, display_name, job_title, avatar_url,
                        role, status, created_at, last_login_at, totp_enabled_at`;

/** Tous les comptes, superadmins d'abord, puis par ancienneté. */
export async function listTeam(): Promise<TeamMember[]> {
  const rows = await query(
    `SELECT ${MEMBER_COLUMNS} FROM admins
      ORDER BY (role = 'superadmin') DESC, created_at ASC`
  );
  return rows.map(toMember);
}

/** Invitations encore utilisables ou expirées, mais pas consommées ni révoquées. */
export async function listInvitations(): Promise<PendingInvitation[]> {
  const rows = await query(
    `SELECT i.id, i.email, i.role, i.expires_at, i.created_at, a.email AS invited_by_email
       FROM admin_invitations i
       LEFT JOIN admins a ON a.id = i.invited_by
      WHERE i.accepted_at IS NULL AND i.revoked_at IS NULL
      ORDER BY i.created_at DESC
      LIMIT 50`
  );

  const now = Date.now();
  return rows.map((row) => ({
    id: str(row.id),
    email: str(row.email),
    role: str(row.role) === 'superadmin' ? 'superadmin' : 'admin',
    invitedBy: str(row.invited_by_email),
    createdAt: iso(row.created_at),
    expiresAt: iso(row.expires_at),
    expired: new Date(iso(row.expires_at)).getTime() <= now,
  }));
}

export type CreateInvitationResult =
  | { token: string; invitation: PendingInvitation }
  | { error: string; status: number };

/**
 * Crée une invitation et renvoie le jeton en clair (une seule fois).
 * Une invitation en attente pour la même adresse est révoquée au passage.
 */
export async function createInvitation({
  email,
  role,
  invitedBy,
}: {
  email: string;
  role: string;
  invitedBy: { id: string; email: string };
}): Promise<CreateInvitationResult> {
  const address = email.trim().toLowerCase();

  if (!address || address.length > 254 || !EMAIL.test(address)) {
    return { error: 'Adresse e-mail invalide.', status: 422 };
  }
  if (!isAdminRole(role)) {
    return { error: 'Rôle invalide.', status: 422 };
  }

  const existing = await query<{ id: string }>(
    'SELECT id FROM admins WHERE lower(email) = $1',
    address
  );
  if (existing.length > 0) {
    return {
      error: 'Un compte utilise déjà cette adresse. Modifiez son rôle ou débloquez-le.',
      status: 409,
    };
  }

  // Une invitation en attente ne doit pas rester valide en parallèle.
  await query(
    `UPDATE admin_invitations
        SET revoked_at = now()
      WHERE lower(email) = $1 AND accepted_at IS NULL AND revoked_at IS NULL`,
    address
  );

  const token = randomBytes(32).toString('base64url');
  const rows = await query(
    `INSERT INTO admin_invitations (email, role, token_hash, invited_by, expires_at)
     VALUES ($1, $2, $3, $4::uuid, now() + make_interval(days => $5::int))
     RETURNING id, email, role, created_at, expires_at`,
    address,
    role,
    hashToken(token),
    invitedBy.id,
    INVITATION_TTL_DAYS
  );

  const row = rows[0];
  if (!row) return { error: 'Invitation impossible.', status: 500 };

  return {
    token,
    invitation: {
      id: str(row.id),
      email: str(row.email),
      role: str(row.role) === 'superadmin' ? 'superadmin' : 'admin',
      invitedBy: invitedBy.email,
      createdAt: iso(row.created_at),
      expiresAt: iso(row.expires_at),
      expired: false,
    },
  };
}

/** État d'un lien d'invitation, sans révéler autre chose que son porteur. */
export async function findInvitation(token: string): Promise<InvitationLookup> {
  const empty: InvitationLookup = { state: 'unknown', email: '', role: 'admin', expiresAt: '' };
  if (!TOKEN_SHAPE.test(token)) return empty;

  const rows = await query<{
    email: string;
    role: string;
    expires_at: string;
    accepted_at: string | null;
    revoked_at: string | null;
  }>(
    `SELECT email, role, expires_at, accepted_at, revoked_at
       FROM admin_invitations WHERE token_hash = $1`,
    hashToken(token)
  );

  const row = rows[0];
  if (!row) return empty;

  let state: InvitationState = 'valid';
  if (row.accepted_at) state = 'used';
  else if (row.revoked_at) state = 'revoked';
  else if (new Date(row.expires_at).getTime() <= Date.now()) state = 'expired';

  return {
    state,
    email: str(row.email),
    role: str(row.role) === 'superadmin' ? 'superadmin' : 'admin',
    expiresAt: iso(row.expires_at),
  };
}

export type AcceptInvitationResult =
  | {
      admin: {
        id: string;
        email: string;
        role: AdminRole;
        sessionVersion: number;
        passwordChangedAt: string;
      };
    }
  | { error: string; status: number };

/**
 * Consomme l'invitation et crée le compte en une seule instruction SQL :
 * si la création échoue (adresse déjà prise), la consommation est annulée.
 */
export async function acceptInvitation({
  token,
  displayName,
  username,
  password,
}: {
  token: string;
  displayName: string;
  username: string;
  password: string;
}): Promise<AcceptInvitationResult> {
  if (!TOKEN_SHAPE.test(token)) {
    return { error: 'Ce lien d’invitation n’est plus valide.', status: 404 };
  }

  const lookup = await findInvitation(token);
  if (lookup.state === 'unknown') {
    return { error: 'Ce lien d’invitation n’est plus valide.', status: 404 };
  }
  if (lookup.state === 'used') {
    return { error: 'Cette invitation a déjà été utilisée.', status: 409 };
  }
  if (lookup.state === 'revoked') {
    return { error: 'Cette invitation a été révoquée.', status: 409 };
  }
  if (lookup.state === 'expired') {
    return { error: 'Cette invitation a expiré. Demandez-en une nouvelle.', status: 410 };
  }

  const name = displayName.trim();
  if (name.length > MAX_NAME) {
    return { error: `Le nom affiché est limité à ${MAX_NAME} caractères.`, status: 422 };
  }

  const handle = username.trim().toLowerCase();
  if (handle && !USERNAME.test(handle)) {
    return {
      error:
        'Identifiant invalide : 3 à 32 caractères, lettres, chiffres, point, tiret ou souligné.',
      status: 422,
    };
  }

  const problem = passwordProblem(password, lookup.email);
  if (problem) return { error: problem, status: 422 };

  try {
    const hash = await hashPassword(password);

    const rows = await query(
      `WITH claim AS (
         UPDATE admin_invitations
            SET accepted_at = now()
          WHERE token_hash = $1
            AND accepted_at IS NULL
            AND revoked_at IS NULL
            AND expires_at > now()
        RETURNING email, role
       ), created AS (
         INSERT INTO admins
           (email, username, display_name, password_hash, role, status,
            password_changed_at, last_login_at)
         SELECT claim.email, $3, $4, $2, claim.role, 'active', now(), now()
           FROM claim
        RETURNING id, email, role, session_version, password_changed_at
       )
       SELECT id, email, role, session_version, password_changed_at FROM created`,
      hashToken(token),
      hash,
      handle || null,
      name
    );

    const row = rows[0];
    if (!row) {
      return { error: 'Ce lien d’invitation n’est plus valide.', status: 404 };
    }

    return {
      admin: {
        id: str(row.id),
        email: str(row.email),
        role: str(row.role) === 'superadmin' ? 'superadmin' : 'admin',
        sessionVersion: Number(row.session_version ?? 0),
        passwordChangedAt: iso(row.password_changed_at),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/duplicate key|unique constraint/i.test(message)) {
      return {
        error: 'Un compte utilise déjà cette adresse ou cet identifiant.',
        status: 409,
      };
    }
    throw err;
  }
}

export type UpdateMemberResult =
  | { member: TeamMember }
  | { error: string; status: number };

/**
 * Change le rôle et/ou le statut d'un compte.
 * Garde-fous : on ne touche pas à son propre compte, et l'équipe conserve
 * toujours au moins un superadministrateur actif.
 */
export async function updateTeamMember({
  actorId,
  targetId,
  role,
  status,
}: {
  actorId: string;
  targetId: string;
  role?: string;
  status?: string;
}): Promise<UpdateMemberResult> {
  if (!UUID.test(targetId)) return { error: 'Administrateur introuvable.', status: 404 };

  const rows = await query<{
    id: string;
    email: string;
    role: string;
    status: string;
  }>('SELECT id, email, role, status FROM admins WHERE id = $1', targetId);

  const target = rows[0];
  if (!target) return { error: 'Administrateur introuvable.', status: 404 };

  if (target.id === actorId) {
    return {
      error: 'Vous ne pouvez pas modifier votre propre rôle ou votre statut ici.',
      status: 409,
    };
  }

  if (role !== undefined && !isAdminRole(role)) {
    return { error: 'Rôle invalide.', status: 422 };
  }
  if (status !== undefined && !isAdminStatus(status)) {
    return { error: 'Statut invalide.', status: 422 };
  }

  const nextRole: AdminRole = isAdminRole(role)
    ? role
    : target.role === 'superadmin'
      ? 'superadmin'
      : 'admin';
  const nextStatus: AdminStatus = isAdminStatus(status)
    ? status
    : target.status === 'blocked'
      ? 'blocked'
      : 'active';

  if (nextRole === target.role && nextStatus === target.status) {
    const [member] = (await listTeam()).filter((item) => item.id === target.id);
    return member ? { member } : { error: 'Administrateur introuvable.', status: 404 };
  }

  const wasActiveSuperadmin = target.role === 'superadmin' && target.status === 'active';
  const staysActiveSuperadmin = nextRole === 'superadmin' && nextStatus === 'active';

  if (wasActiveSuperadmin && !staysActiveSuperadmin) {
    const others = await query<{ total: number }>(
      `SELECT count(*)::int AS total FROM admins
        WHERE role = 'superadmin' AND status = 'active' AND id <> $1`,
      target.id
    );
    if (Number(others[0]?.total ?? 0) === 0) {
      return {
        error: 'Il doit rester au moins un superadministrateur actif dans l’équipe.',
        status: 409,
      };
    }
  }

  const updated = await query(
    `UPDATE admins
        SET role = $2,
            status = $3,
            session_version = CASE WHEN $3 = 'blocked' THEN session_version + 1
                                   ELSE session_version END
      WHERE id = $1
      RETURNING ${MEMBER_COLUMNS}`,
    target.id,
    nextRole,
    nextStatus
  );

  const row = updated[0];
  if (!row) return { error: 'Administrateur introuvable.', status: 404 };
  return { member: toMember(row) };
}

/** Révoque une invitation en attente. `null` si elle est déjà consommée. */
export async function revokeInvitation(
  id: string
): Promise<{ email: string; role: AdminRole } | null> {
  if (!UUID.test(id)) return null;

  const rows = await query<{ email: string; role: string }>(
    `UPDATE admin_invitations
        SET revoked_at = now()
      WHERE id = $1::uuid AND accepted_at IS NULL AND revoked_at IS NULL
      RETURNING email, role`,
    id
  );

  const row = rows[0];
  if (!row) return null;
  return {
    email: str(row.email),
    role: str(row.role) === 'superadmin' ? 'superadmin' : 'admin',
  };
}
