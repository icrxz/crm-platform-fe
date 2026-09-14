import { LoadingMarker } from '../../components/common/loading-marker';
import { PaymentsTableSkeleton } from '../../components/payments/table-skeleton';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <PaymentsTableSkeleton />
    </>
  );
}
