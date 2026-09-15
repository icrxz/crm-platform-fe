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

  const total = Math.ceil(Number((paging?.total || 1) / (paging?.limit || 1)));
  const currentPage = Number(page || 1);

  return (
    <div className={className ? className : 'mt-1'}>
      {/* siblings={3} overflows horizontally on phone-width screens (10+
          page buttons); shown/hidden by breakpoint instead of a resize
          listener since HeroUI's own page-button count isn't reactive to
          prop changes mid-render either way. */}
      <div className="hidden md:block">
        <HeroPagination
          onChange={handleChangePage}
          siblings={3}
          showControls
          total={total}
          page={currentPage}
        />
      </div>
      <div className="md:hidden">
        <HeroPagination
          onChange={handleChangePage}
          siblings={0}
          showControls
          total={total}
          page={currentPage}
        />
      </div>
    </div>
  );
}
