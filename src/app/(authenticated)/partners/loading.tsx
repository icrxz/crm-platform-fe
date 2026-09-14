import { LoadingMarker } from '../../components/common/loading-marker';
import { ListTableSkeleton } from '../../components/common/list-table-skeleton';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <ListTableSkeleton
        title="Técnicos"
        columns={[
          'Nome',
          'Tipo',
          'Documento',
          'Cidade',
          'Estado',
          'Status',
          'Ações',
        ]}
      />
    </>
  );
}
