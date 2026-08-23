'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { notifyEventAction } from '@/app/admin/actions';
import { EventStatus } from '@/types/event';
import styles from './Admin.module.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Fixed UTC format, so the server and client markup always agree. */
function shortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

export default function NotifyButton({
  id,
  title,
  status,
  notifiedAt,
}: {
  id: string;
  title: string;
  status: EventStatus;
  notifiedAt?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Only upcoming races are worth announcing.
  if (status !== 'UPCOMING') return null;

  const alreadySent = Boolean(notifiedAt);
  const sentOn = notifiedAt ? shortDate(notifiedAt) : '';

  const handleClick = () => {
    const prompt = alreadySent
      ? `"${title}" was already announced on ${sentOn}. Email all confirmed subscribers again?`
      : `Email all confirmed subscribers about "${title}"? This cannot be undone.`;
    if (!window.confirm(prompt)) return;

    // Second gate on a re-send: subscribers would get a duplicate.
    if (alreadySent && !window.confirm('Are you sure? Subscribers will receive a second email about this event.')) {
      return;
    }

    startTransition(async () => {
      const res = await notifyEventAction(id, { resend: alreadySent });
      alert(res.message);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={alreadySent ? `Announced on ${sentOn}` : 'Email confirmed subscribers'}
      className={styles.notifyBtn}
    >
      {isPending ? 'Sending...' : alreadySent ? `Notified ${sentOn}` : 'Notify'}
    </button>
  );
}
