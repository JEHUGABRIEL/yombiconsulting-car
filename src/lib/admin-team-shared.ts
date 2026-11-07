/**
 * Types de l'équipe administrative, importables côté client.
 * Aucun code serveur ici : seul le typage est partagé avec les formulaires.
 */

export type AdminRole = 'admin' | 'superadmin';
export type AdminStatus = 'active' | 'blocked';

export type TeamMember = {
  id: string;
  email: string;
  username: string | null;
  displayName: string;
  jobTitle: string;
  avatarUrl: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: string;
  lastLoginAt: string;
  /** Second facteur TOTP actif sur ce compte. */
  mfaEnabled: boolean;
};

export type PendingInvitation = {
  id: string;
  email: string;
  role: AdminRole;
  /** E-mail du superadmin qui a créé l'invitation (vide s'il a été supprimé). */
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
};

export type InvitationState = 'valid' | 'expired' | 'used' | 'revoked' | 'unknown';

export type InvitationLookup = {
  state: InvitationState;
  email: string;
  role: AdminRole;
  expiresAt: string;
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: 'Superadministrateur',
  admin: 'Administrateur',
};

export const ROLE_HINTS: Record<AdminRole, string> = {
  superadmin: 'Tout le back-office, dont la gestion de l’équipe et des invitations.',
  admin: 'Contenus, messages et profil. Sans accès à la gestion de l’équipe.',
};
