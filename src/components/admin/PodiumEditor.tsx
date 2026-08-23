'use client';

import { useMemo, useState } from 'react';
import { Result } from '@/types/event';
import styles from './PodiumEditor.module.css';

const PLACES = [1, 2, 3] as const;
const PLACE_STYLE: Record<number, string> = {
  1: styles.gold,
  2: styles.silver,
  3: styles.bronze,
};

type Slot = { name: string; time: string; team: string; bib: string };

const emptySlot = (): Slot => ({ name: '', time: '', team: '', bib: '' });
const slotKey = (category: string, position: number) => `${category}|${position}`;

function initialSlots(results: Result[]): Record<string, Slot> {
  const slots: Record<string, Slot> = {};
  for (const result of results) {
    if (result.position < 1 || result.position > 3) continue;
    slots[slotKey(result.category || 'General', result.position)] = {
      name: result.name ?? '',
      time: result.time ?? '',
      team: result.team ?? '',
      bib: result.bib ?? '',
    };
  }
  return slots;
}

/**
 * Top-three entry per race category, serialised into a hidden `results` field
 * for the enclosing form. Full field results live in the results PDF.
 *
 * Categories already carrying results are always shown, even if unchecked on
 * the event, so stored placings can never be dropped without being seen.
 */
export default function PodiumEditor({
  categories,
  initialResults = [],
}: {
  categories: string[];
  initialResults?: Result[];
}) {
  const [slots, setSlots] = useState<Record<string, Slot>>(() => initialSlots(initialResults));

  const storedCategories = useMemo(
    () => initialResults.map((r) => r.category || 'General'),
    [initialResults],
  );

  const groups = useMemo(
    () => Array.from(new Set([...categories, ...storedCategories])),
    [categories, storedCategories],
  );

  const rows = useMemo(() => {
    const collected: Result[] = [];
    for (const category of groups) {
      for (const position of PLACES) {
        const slot = slots[slotKey(category, position)];
        const name = slot?.name.trim();
        if (!name) continue;

        const row: Result = { position, name, time: slot.time.trim(), category };
        const team = slot.team.trim();
        if (team) row.team = team;
        const bib = slot.bib.trim();
        if (bib) row.bib = bib;
        collected.push(row);
      }
    }
    return collected;
  }, [groups, slots]);

  const update = (category: string, position: number, field: keyof Slot, value: string) => {
    const key = slotKey(category, position);
    setSlots((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? emptySlot()), [field]: value },
    }));
  };

  const clearGroup = (category: string) => {
    setSlots((prev) => {
      const next = { ...prev };
      for (const position of PLACES) delete next[slotKey(category, position)];
      return next;
    });
  };

  const filled = rows.length;

  return (
    <div className={styles.editor}>
      <input type="hidden" name="results" value={JSON.stringify(rows)} />

      <p className={styles.hint}>
        {filled === 0
          ? 'Leave blank to publish results by PDF only.'
          : `${filled} ${filled === 1 ? 'placing' : 'placings'} will be published.`}
      </p>

      {groups.length === 0 && (
        <p className={styles.empty}>
          Select at least one race category above to enter placings.
        </p>
      )}

      {groups.map((category) => {
        const isUnselected = !categories.includes(category);
        return (
          <div key={category} className={styles.group}>
            <div className={styles.groupHeader}>
              <h3 className={styles.groupTitle}>
                {category}
                {isUnselected && (
                  <span className={styles.unselected}> — category no longer selected</span>
                )}
              </h3>
              <button type="button" onClick={() => clearGroup(category)} className={styles.clearBtn}>
                Clear
              </button>
            </div>

            {PLACES.map((position) => {
              const slot = slots[slotKey(category, position)] ?? emptySlot();
              return (
                <div key={position} className={styles.row}>
                  <span className={`${styles.position} ${PLACE_STYLE[position]}`}>{position}</span>
                  <div className={styles.fields}>
                    <input
                      value={slot.name}
                      onChange={(e) => update(category, position, 'name', e.target.value)}
                      placeholder="Rider name"
                      aria-label={`${category} position ${position} rider name`}
                      className={styles.input}
                    />
                    <input
                      value={slot.time}
                      onChange={(e) => update(category, position, 'time', e.target.value)}
                      placeholder="2:15:30"
                      aria-label={`${category} position ${position} time`}
                      className={styles.input}
                    />
                    <input
                      value={slot.team}
                      onChange={(e) => update(category, position, 'team', e.target.value)}
                      placeholder="Team (optional)"
                      aria-label={`${category} position ${position} team`}
                      className={styles.input}
                    />
                    <input
                      value={slot.bib}
                      onChange={(e) => update(category, position, 'bib', e.target.value)}
                      placeholder="Bib"
                      aria-label={`${category} position ${position} bib number`}
                      className={styles.input}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
