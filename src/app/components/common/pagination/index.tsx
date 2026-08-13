'use client';

import { Pagination as HeroPagination } from '@heroui/pagination';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
  paging?: { total: number; limit: number };
  page?: number;
  className?: string;
}

export function Pagination({ paging, page, className }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChangePage(value: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', value.toString());

    router.push(pathname + '?' + params.toString());
  }

  return (
    <div className={className ? className : 'mt-2'}>
      <HeroPagination
        onChange={handleChangePage}
        siblings={3}
        showControls
        total={Math.ceil(Number((paging?.total || 1) / (paging?.limit || 1)))}
        page={Number(page || 1)}
      />
    </div>
  );
}
