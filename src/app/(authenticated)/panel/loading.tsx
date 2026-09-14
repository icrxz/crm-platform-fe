import { LoadingMarker } from '../../components/common/loading-marker';
import { PanelSkeleton } from '../../components/panel/skeleton';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <PanelSkeleton />
    </>
  );
}
