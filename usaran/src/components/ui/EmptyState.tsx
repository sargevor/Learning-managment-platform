import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cx } from '../../lib/format';

export function EmptyState({ icon, title, text, action, compact }: { icon?: ReactNode; title: string; text?: ReactNode; action?: ReactNode; compact?: boolean }) {
  return (
    <div className={cx('empty', compact && 'empty--compact')}>
      <div className="empty__icon" aria-hidden="true">{icon ?? <Inbox size={24} />}</div>
      <div className="empty__title">{title}</div>
      {text && <div className="empty__text">{text}</div>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
