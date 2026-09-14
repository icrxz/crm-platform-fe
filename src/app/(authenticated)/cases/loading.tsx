import { LoadingMarker } from '../../components/common/loading-marker';
import { CasesTableSkeleton } from '../../components/cases/table-skeleton';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <CasesTableSkeleton />
    </>
  );
}
