import CaseDetails from '../../components/cases/details';
import { CaseFull } from '../../types/case';
import { UserRole } from '../../types/user';
import {
  ONGOING_FLOW_VERSION_METADATA_KEY,
  ONGOING_FLOW_VERSION_V2_VALUE,
} from '../../utils/case_metadata';
import { caseDetailsFixture } from '../case-details/fixture';
import { Shell } from '../shell';

// Same case as /qa-fixtures/case-details, stamped for the v2 wizard. The
// fixture's Resolution comment already carries a photo and the service
// order, so the baseline shows both "Enviado" and "Pendente" steps.
const crmCase = {
  ...caseDetailsFixture,
  metadata: {
    ...caseDetailsFixture.metadata,
    [ONGOING_FLOW_VERSION_METADATA_KEY]: ONGOING_FLOW_VERSION_V2_VALUE,
  },
} as CaseFull;

export default function Page() {
  return (
    <Shell>
      <CaseDetails crmCase={crmCase} userRole={UserRole.ADMIN} />
    </Shell>
  );
}
