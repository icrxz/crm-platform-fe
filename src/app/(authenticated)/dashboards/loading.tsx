import { LoadingMarker } from '../../components/common/loading-marker';
import { DashboardsPageSkeleton } from '../../components/dashboards/skeletons';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <DashboardsPageSkeleton />
    </>
  );
}
