import { Compass } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ButtonLink } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Misc';
import { tr } from '../../i18n';

export function NotFoundPage({ inApp }: { inApp?: boolean }) {
  const { pathname } = useLocation();
  const home = pathname.startsWith('/teacher') ? '/teacher/dashboard' : pathname.startsWith('/student') ? '/student/dashboard' : '/';
  return (
    <div className={inApp ? '' : 'container page-pad'}>
      <div className="empty-panel">
        <EmptyState
          icon={<Compass size={24} />}
          title={tr("Page not found", "Էջը չի գտնվել")}
          text={tr("The link may be incorrect or the page may have moved. Return to the home page to continue.", "Հղումը կարող է սխալ լինել կամ էջը տեղափոխվել է։ Վերադարձեք գլխավոր էջ և շարունակեք այնտեղից։")}
          action={<ButtonLink to={home} variant="primary">{inApp ? tr("Back to Dashboard", "Վերադառնալ վահանակ") : tr("Home", "Գլխավոր էջ")}</ButtonLink>}
        />
      </div>
    </div>
  );
}
