import { LoadingMarker } from '../../components/common/loading-marker';
import { CardsSkeleton } from '../../components/dashboard/skeletons';
import { roboto } from '../../ui/fonts';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <main>
        <h1 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
          Dashboard
        </h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <CardsSkeleton count={4} />
        </div>
      </main>
    </>
  );
}
