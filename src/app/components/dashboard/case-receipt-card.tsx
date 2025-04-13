"use client";
import { fetchCases } from '@/app/services/cases';
import { Case, CaseStatus } from '@/app/types/case';
import { SearchResponse } from '@/app/types/search_response';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { roboto } from '../../ui/fonts';
import { Card } from '../common/card';

async function getData(): Promise<SearchResponse<Case>> {
  const query = `status=${CaseStatus.RECEIPT}`;

  const { success, unauthorized, data } = await fetchCases(query, 1);
  if (!success || !data) {
    if (unauthorized) {
      redirect("/login");
    }
    return { result: [], paging: { limit: 10, offset: 0, total: 0 } };
  }

  return data;
}

export async function CaseReceiptsCard() {
  const data = await getData();

  function getTitle() {
    return (
      <div className="flex p-2">
        <BanknotesIcon className="h-5 w-5 text-gray-700" />
        <h3 className="ml-2 text-sm font-medium">Pagamentos</h3>
      </div>
    );
  }

  return (
    <Card title={getTitle()}>
      <p className={`${roboto.className} truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}>
        {data.paging.total}
      </p>

      <div className='mt-4 pl-1 flex items-center justify-start'>
        <Link
          href={`/cases?status=${CaseStatus.RECEIPT}&page=1`}
          className={`text-sm text-blue-400 ${roboto.className} hover:text-blue-500 hover:cursor-pointer`}
        >
          Exibir todos os casos
        </Link>
      </div>
    </Card>
  );
}