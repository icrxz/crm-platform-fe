import { LoadingMarker } from '../../components/common/loading-marker';
import { ListTableSkeleton } from '../../components/common/list-table-skeleton';

export default function Loading() {
  return (
    <>
      <LoadingMarker />
      <ListTableSkeleton
        title="Clientes"
        columns={['Nome', 'Email', 'Documento', 'Data de criação', 'Ações']}
      />
    </>
  );
}
