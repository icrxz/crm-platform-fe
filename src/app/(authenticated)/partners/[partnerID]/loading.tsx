import { LoadingMarker } from '../../../components/common/loading-marker';
import { PageSkeleton } from '../../../components/common/page-skeleton';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <PageSkeleton />
    </>
  );
}
