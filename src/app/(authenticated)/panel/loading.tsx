import { LoadingMarker } from '../../components/common/loading-marker';
import DashboardSkeleton from '../../components/dashboard/skeletons';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <DashboardSkeleton />
    </>
  );
}
