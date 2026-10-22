import { Compass } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ButtonLink } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Misc';

export function NotFoundPage({ inApp }: { inApp?: boolean }) {
  const { pathname } = useLocation();
  const home = pathname.startsWith('/teacher') ? '/teacher/dashboard' : pathname.startsWith('/student') ? '/student/dashboard' : '/';
  return (
    <div className={inApp ? '' : 'container page-pad'}>
      <div className="empty-panel">
        <EmptyState
          icon={<Compass size={24} />}
          title="Page not found"
          text="The link may be incorrect or the page may have moved. Return to the home page to continue."
          action={<ButtonLink to={home} variant="primary">{inApp ? "Back to Dashboard" : "Home"}</ButtonLink>}
        />
      </div>
    </div>
  );
}
