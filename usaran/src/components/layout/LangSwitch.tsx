import { Languages } from 'lucide-react';
import { LANGS, lang, setLang, tr } from '../../i18n';
import { cx } from '../../lib/format';

/** Two-button Armenian / English switch. Switching reloads the page in the chosen language. */
export function LangSwitch({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <div className={cx('lang-switch', tone === 'dark' && 'lang-switch--dark', className)} role="group" aria-label={tr('Interface language', "Միջերեսի լեզու")}>
      <Languages className="lang-switch__icon" aria-hidden="true" />
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={lang === l.code}
          aria-label={l.label}
          title={l.label}
          onClick={() => setLang(l.code)}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
