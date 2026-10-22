import { Search, X } from 'lucide-react';
import { cx } from '../../lib/format';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  onSubmit?: () => void;
}

export function SearchBar({ value, onChange, placeholder = "Search…", className, label = "Search", onSubmit }: Props) {
  return (
    <div className={cx('search', className)} role="search">
      <Search aria-hidden="true" />
      <input
        className="input"
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit?.();
        }}
      />
      {value && (
        <button type="button" className="search__clear" aria-label="Clear search" onClick={() => onChange('')}>
          <X />
        </button>
      )}
    </div>
  );
}
