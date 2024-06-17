import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '../../ui/fonts';
import { Card } from '../common/card';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = {
    numberOfInvoices: 1,
    numberOfCustomers: 2,
    totalPaidInvoices: 3,
    totalPendingInvoices: 4,
  };

  function getTitle(title: "collected" | "customers" | "pending" | "invoices"): React.ReactNode {
    const Icon = iconMap[title];
    return (
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
    )
  }

  return (
    <>
      <Card title={getTitle("collected")}>
        <p
          className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
        >
          {totalPaidInvoices}
        </p>
      </Card>

      <Card title={getTitle("pending")}>
        <p
          className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
        >
          {totalPendingInvoices}
        </p>
      </Card>

      <Card title={getTitle("invoices")}>
        <p
          className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
        >
          {numberOfInvoices}
        </p>
      </Card>


      <Card title={getTitle("customers")}>
        <p
          className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
        >
          {numberOfCustomers}
        </p>
      </Card>
    </>
  );
}


