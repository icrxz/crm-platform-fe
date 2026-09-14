import { LoadingMarker } from '../../components/common/loading-marker';
import { ListTableSkeleton } from '../../components/common/list-table-skeleton';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <ListTableSkeleton
        title="Usuários"
        columns={['Nome', 'Username', 'Email', 'Cargo', 'Status', 'Ações']}
      />
    </>
  );
}
