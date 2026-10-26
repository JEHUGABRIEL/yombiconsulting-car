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
        <div className="flex items-center gap-1 p-1 rounded-lg border border-line bg-sky">
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
              className={`px-3 py-1.5 rounded-md text-[12.5px] font-semibold transition-colors ${
                filter === item.key
                  ? 'bg-[#FCFDFE] text-ink shadow-[0_1px_2px_rgba(12,36,64,.08)]'
                  : 'text-mut hover:text-ink'
              }`}
            >
              {item.label}
              {item.key === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 text-blue">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            strokeWidth={1.8}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mut pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un nom, un sujet…"
            aria-label="Rechercher dans les messages"
            className="field pl-9"
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="text-[13px] text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-3.5 py-2.5 mb-4"
        >
          {error}
        </p>
      )}

      <div className="bg-[#FCFDFE] border border-line rounded-[12px] overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-[13.5px] text-mut">
            Aucun message ne correspond à cette vue.
          </p>
        ) : (
          <ul>
            {filtered.map((message) => {
              const isOpen = expanded === message.id;
              return (
                <li key={message.id} className="border-b border-line last:border-b-0">
                  <div className={`flex items-start gap-3 px-4 sm:px-5 py-4 ${isOpen ? 'bg-sky/50' : ''}`}>
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
                          message.read ? 'bg-line-2' : 'bg-blue'
                        }`}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span
                            className={`text-[13.5px] ${
                              message.read ? 'font-medium text-ink' : 'font-semibold text-ink'
                            }`}
                          >
                            {message.name}
                          </span>
                          {message.company && (
                            <span className="inline-flex items-center gap-1 text-[11.5px] text-mut">
                              <Building2 size={11} strokeWidth={1.8} />
                              {message.company}
                            </span>
                          )}
                        </span>
                        <span className="block text-[12.5px] text-mut mt-0.5 truncate">
                          <span className="text-ink/70">{message.subject}</span>
                          {' — '}
                          {message.body}
                        </span>
                      </span>
                    </button>

                    <span className="hidden sm:block text-[11.5px] text-mut shrink-0 pt-0.5">
                      {message.createdAt ? dateFormatter.format(new Date(message.createdAt)) : ''}
                    </span>

                    <span className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setRead(message, !message.read)}
                        disabled={busy === message.id}
                        title={message.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                        aria-label={message.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-mut hover:text-blue hover:bg-tint transition-colors disabled:opacity-50"
                      >
                        {message.read ? <RotateCcw size={14} /> : <Check size={15} />}
                      </button>
                      <button
                        onClick={() => remove(message)}
                        disabled={busy === message.id}
                        title="Supprimer"
                        aria-label="Supprimer le message"
                        className="w-8 h-8 rounded-md flex items-center justify-center text-mut hover:text-[#B42318] hover:bg-[#FEF3F2] transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => setExpanded(isOpen ? null : message.id)}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? 'Replier le message' : 'Déplier le message'}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-mut hover:text-ink hover:bg-sky transition-colors"
                      >
                        <ChevronDown
                          size={15}
                          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </span>
                  </div>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pl-10 sm:pl-11">
                      <p className="text-[13.5px] text-ink leading-relaxed whitespace-pre-line max-w-[70ch]">
                        {message.body}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[12.5px]">
                        {message.email && (
                          <a
                            href={`mailto:${message.email}?subject=${encodeURIComponent(
                              `Re : ${message.subject}`
                            )}`}
                            className="inline-flex items-center gap-1.5 font-semibold text-blue hover:underline"
                          >
                            <Mail size={13} strokeWidth={1.8} />
                            {message.email}
                          </a>
                        )}
                        {message.phone && (
                          <a
                            href={`tel:${message.phone.replace(/\s+/g, '')}`}
                            className="inline-flex items-center gap-1.5 font-semibold text-blue hover:underline"
                          >
                            <Phone size={13} strokeWidth={1.8} />
                            {message.phone}
                          </a>
                        )}
                        <span className="text-mut">
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

      <p className="text-[12px] text-mut mt-4">
        {filtered.length} message{filtered.length > 1 ? 's' : ''} affiché
        {filtered.length > 1 ? 's' : ''} · {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
      </p>
    </div>
  );
}
