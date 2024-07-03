import { parseDocument } from "@/app/libs/parser";
import { Customer } from "@/app/types/customer";

interface CustomerDetailsProps {
  customer: Customer;
}

export default function CustomerDetails({ customer }: CustomerDetailsProps) {
  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Dados do cliente</h1>
      </div>

      <div className="mt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-500">Nome:</p>
            <p className="text-sm font-medium text-gray-900">{customer.first_name} {customer.last_name}</p>
          </div>

          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-500">Documento:</p>
            <p className="text-sm font-medium text-gray-900">{parseDocument(customer.document)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
