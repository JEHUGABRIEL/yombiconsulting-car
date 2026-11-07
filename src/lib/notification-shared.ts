/**
 * Types partagés entre le serveur et la cloche du back-office.
 * Aucun import serveur ici : ce module est embarqué dans le bundle client.
 */

export type NotificationTone = 'info' | 'success' | 'warn' | 'danger';

export type NotificationSource = 'admin' | 'public';

export type NotificationItem = {
  id: string;
  action: string;
  label: string;
  tone: NotificationTone;
  href: string;
  detail: string;
  actor: string;
  source: NotificationSource;
  read: boolean;
  createdAt: string;
};
