'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteEventAction } from '@/app/admin/actions';
import styles from './Admin.module.css';

export default function DeleteEventButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    startTransition(async () => {
      const res = await deleteEventAction(id);
      if (!res.success) alert(res.message);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={styles.deleteBtn}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
