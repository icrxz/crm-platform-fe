import CaseDetails from '../../components/cases/details';
import { UserRole } from '../../types/user';
import { Shell } from '../shell';
import { caseDetailsFixture } from './fixture';

export default function Page() {
  return (
    <Shell>
      <CaseDetails crmCase={caseDetailsFixture} userRole={UserRole.ADMIN} />
    </Shell>
  );
}
