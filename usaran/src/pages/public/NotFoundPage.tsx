import { Compass } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ButtonLink } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Misc';

export function NotFoundPage({ inApp }: { inApp?: boolean }) {
  const { pathname } = useLocation();
  const home = pathname.startsWith('/teacher') ? '/teacher/dashboard' : pathname.startsWith('/student') ? '/student/dashboard' : '/';
  return (
    <div className={inApp ? '' : 'container page-pad'}>
      <div className="card">
        <EmptyState
          icon={<Compass size={24} />}
          title="Էջը չի գտնվել"
          text="Հղումը կարող է սխալ լինել կամ էջը տեղափոխվել է։ Վերադարձեք գլխավոր էջ և շարունակեք այնտեղից։"
          action={<ButtonLink to={home} variant="primary">{inApp ? 'Վերադառնալ վահանակ' : 'Գլխավոր էջ'}</ButtonLink>}
        />
      </div>
    </div>
  );
}
