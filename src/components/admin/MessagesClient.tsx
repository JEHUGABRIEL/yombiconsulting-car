'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Mail, Phone, RotateCcw, Search, Trash2, Building2 } from 'lucide-react';

export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const filters = [
  { key: 'all', label: 'Tous' },
  { key: 'unread', label: 'Non lus' },
  { key: 'read', label: 'Lus' },
] as const;

type FilterKey = (typeof filters)[number]['key'];

export default function MessagesClient({ initial }: { initial: AdminMessage[] }) {
  const [messages, setMessages] = useState(initial);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const unreadCount = messages.filter((m) => !m.read).length;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return messages.filter((m) => {
      if (filter === 'unread' && m.read) return false;
      if (filter === 'read' && !m.read) return false;
      if (!needle) return true;
      return [m.name, m.email, m.phone, m.company, m.subject, m.body]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [messages, filter, query]);

  async function setRead(message: AdminMessage, read: boolean) {
    setError(null);
    setBusy(message.id);
    const previous = messages;
    setMessages((list) => list.map((m) => (m.id === message.id ? { ...m, read } : m)));
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setMessages(previous);
      setError('La mise à jour a échoué. Réessayez.');
    } finally {
      setBusy(null);
    }
  }

  async function remove(message: AdminMessage) {
    if (!window.confirm(`Supprimer définitivement le message de ${message.name} ?`)) return;
    setError(null);
    setBusy(message.id);
    const previous = messages;
    setMessages((list) => list.filter((m) => m.id !== message.id));
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      if (expanded === message.id) setExpanded(null);
    } catch {
      setMessages(previous);
      setError('La suppression a échoué. Réessayez.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1 p-1 rounded-[9px] border border-white/[0.07] bg-white/[0.03]">
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
              className={`px-3 py-1.5 rounded-[7px] text-[12px] font-semibold transition-colors ${
                filter === item.key
                  ? 'bg-white/[0.09] text-white'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {item.label}
              {item.key === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 text-blue-soft">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            strokeWidth={1.8}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un nom, un sujet…"
            aria-label="Rechercher dans les messages"
            className="w-full rounded-[9px] bg-white/[0.03] border border-white/[0.07] pl-9 pr-3.5 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-blue/60 focus:bg-white/[0.05] transition-colors"
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="text-[12.5px] text-red-300 bg-red-500/10 border border-red-500/25 rounded-[9px] px-3.5 py-2.5 mb-4"
        >
          {error}
        </p>
      )}

      <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-5 py-14 text-center text-[13px] text-white/35">
            Aucun message ne correspond à cette vue.
          </p>
        ) : (
          <ul>
            {filtered.map((message) => {
              const isOpen = expanded === message.id;
              return (
                <li key={message.id} className="border-b border-white/[0.05] last:border-b-0">
                  <div
                    className={`flex items-start gap-3 px-4 sm:px-5 py-3.5 transition-colors ${
                      isOpen ? 'bg-white/[0.035]' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setExpanded(isOpen ? null : message.id);
                        if (!message.read) setRead(message, true);
                      }}
                      aria-expanded={isOpen}
                      className="flex-1 min-w-0 text-left flex items-start gap-3"
                    >
                      <span
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                          message.read ? 'bg-white/15' : 'bg-blue-soft'
                        }`}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span
                            className={`text-[13px] ${
                              message.read ? 'text-white/60' : 'text-white font-medium'
                            }`}
                          >
                            {message.name}
                          </span>
                          {message.company && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-white/30">
                              <Building2 size={11} strokeWidth={1.8} />
                              {message.company}
                            </span>
                          )}
                        </span>
                        <span className="block text-[12px] text-white/35 mt-0.5 truncate">
                          <span className="text-white/50">{message.subject}</span>
                          {' — '}
                          {message.body}
                        </span>
                      </span>
                    </button>

                    <span className="hidden sm:block text-[10.5px] text-white/25 shrink-0 pt-1">
                      {message.createdAt ? dateFormatter.format(new Date(message.createdAt)) : ''}
                    </span>

                    <span className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setRead(message, !message.read)}
                        disabled={busy === message.id}
                        title={message.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                        aria-label={message.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                        className="w-8 h-8 rounded-[7px] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.07] transition-colors disabled:opacity-40"
                      >
                        {message.read ? <RotateCcw size={14} /> : <Check size={15} />}
                      </button>
                      <button
                        onClick={() => remove(message)}
                        disabled={busy === message.id}
                        title="Supprimer"
                        aria-label="Supprimer le message"
                        className="w-8 h-8 rounded-[7px] flex items-center justify-center text-white/35 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => setExpanded(isOpen ? null : message.id)}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? 'Replier le message' : 'Déplier le message'}
                        className="w-8 h-8 rounded-[7px] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.07] transition-colors"
                      >
                        <ChevronDown
                          size={15}
                          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </span>
                  </div>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pl-10 sm:pl-11">
                      <p className="text-[13px] text-white/75 leading-relaxed whitespace-pre-line max-w-[70ch]">
                        {message.body}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[12px]">
                        {message.email && (
                          <a
                            href={`mailto:${message.email}?subject=${encodeURIComponent(
                              `Re : ${message.subject}`
                            )}`}
                            className="inline-flex items-center gap-1.5 font-medium text-blue-soft hover:underline"
                          >
                            <Mail size={13} strokeWidth={1.8} />
                            {message.email}
                          </a>
                        )}
                        {message.phone && (
                          <a
                            href={`tel:${message.phone.replace(/\s+/g, '')}`}
                            className="inline-flex items-center gap-1.5 font-medium text-blue-soft hover:underline"
                          >
                            <Phone size={13} strokeWidth={1.8} />
                            {message.phone}
                          </a>
                        )}
                        <span className="text-white/25">
                          Reçu le{' '}
                          {message.createdAt
                            ? dateFormatter.format(new Date(message.createdAt))
                            : '—'}
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-[11.5px] text-white/25 mt-4">
        {filtered.length} message{filtered.length > 1 ? 's' : ''} affiché
        {filtered.length > 1 ? 's' : ''} · {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
      </p>
    </div>
  );
}
