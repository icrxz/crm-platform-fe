import { LoadingMarker } from '../../components/common/loading-marker';
import { ListTableSkeleton } from '../../components/common/list-table-skeleton';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <ListTableSkeleton
        title="Seguradoras"
        columns={[
          'Nome',
          'Razão social',
          'Documento',
          'Data de criação',
          'Status',
          'Ações',
        ]}
      />
    </>
  );
}
