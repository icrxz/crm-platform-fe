import { LoadingMarker } from '../../components/common/loading-marker';
import { ProfileSkeleton } from '../../components/users/profile-skeleton';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <ProfileSkeleton />
    </>
  );
}
