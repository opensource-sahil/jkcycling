'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteRideGroupAction } from '@/app/admin/groups/actions';
import styles from './Admin.module.css';

export default function DeleteGroupButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    startTransition(async () => {
      const res = await deleteRideGroupAction(id);
      if (!res.success) alert(res.message);
      router.refresh();
    });
  };

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className={styles.deleteBtn}>
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
