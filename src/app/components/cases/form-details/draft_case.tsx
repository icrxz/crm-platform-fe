"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { removeDocumentSymbols } from "@/app/libs/parser";
import { publishCase } from "@/app/services/cases";
import { fetchCustomers } from "@/app/services/customers";
import { brazilStates } from "@/app/types/address";
import { CaseFull } from "@/app/types/case";
import { Customer } from "@/app/types/customer";
import { InputMask } from "@react-input/mask";
import { InputNumberFormat } from "@react-input/number-format";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../../common/button";
import { Card } from "../../common/card";

interface DraftStatusFormProps {
  crmCase: CaseFull;
}

export function DraftStatusForm({ crmCase }: DraftStatusFormProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useFormState(onSubmit, null);

  const [userDocument, setUserDocument] = useState<string>("");
  const [customer, setCustomer] = useState<Customer | undefined>();
  const [searchingUser, setSearchingUser] = useState<boolean>(false);
  const [hasSearchedCustomer, setHasSearchedCustomer] = useState<boolean>(false);

  const { pending } = useFormStatus();

  function handleSearchUser() {
    setSearchingUser(true);
    const document = removeDocumentSymbols(userDocument);

    fetchCustomers(`document=${document}`, 1, 1000).then((res) => {
      if (res.success && res.data) {
        setCustomer(res.data.result[0]);
      }
    }).finally(() => {
      setSearchingUser(false);
      setHasSearchedCustomer(true);
    });
  }

  async function onSubmit(_currentState: unknown, formData: FormData) {
    console.log(customer)
    formData.set("customer_id", customer?.customer_id || '');
    formData.set("product_id", crmCase.product?.product_id || '');

    await publishCase(_currentState, crmCase.case_id, formData).then(response => {
      if (!response.success) {
        if (response.unauthorized) {
          signOut();
        }
        showSnackbar(response.message, 'error');
        return;
      }

      showSnackbar(response.message, 'success');
      refresh();
    }).catch((ex) => {
      showSnackbar(ex, 'error');
    });
  }

  useEffect(() => {
    if (crmCase.customer) {
      setCustomer(crmCase.customer);
      setUserDocument(crmCase.customer.document);
      setHasSearchedCustomer(true);
    }
  }, [crmCase.customer]);

  return (
    <Card title="Complete os dados do caso" titleSize="text-xl">
      <form action={dispatch} className="px-5 gap-4">
        <div className="my-4">
          <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="subject">
            Descrição
          </label>

          <textarea
            id="subject"
            name="subject"
            className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
            disabled={!!crmCase.subject}
            defaultValue={crmCase.subject}
            placeholder="Digite o resumo do caso"
            required
          />
        </div>

        <hr />

        <div className="columns-3 my-4">
          <div>
            <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="brand">
              Marca
            </label>

            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="brand"
              type="text"
              name="brand"
              placeholder="Digite a marca"
              required
              defaultValue={crmCase.product?.brand}
              disabled={!!crmCase.product?.brand}
            />
          </div>

          <div>
            <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="model">
              Modelo
            </label>

            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="model"
              type="text"
              name="model"
              placeholder="Digite o modelo"
              required
              defaultValue={crmCase.product?.model}
              disabled={!!crmCase.product?.model}
            />
          </div>

          <div>
            <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="amount">
              Valor
            </label>

            <InputNumberFormat
              className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="amount"
              name="amount"
              placeholder="Digite o valor"
              required
              locales={"pt-BR"}
              maximumFractionDigits={2}
              format="currency"
              currency="BRL"
              min={0}
              defaultValue={crmCase.product?.value}
              disabled={!!crmCase.product?.value}
            />
          </div>
        </div>

        <hr />

        <div className="columns-1 my-4">
          <div>
            <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="document">
              Documento
            </label>

            <div className="flex">
              <InputMask
                className="peer block w-1/2 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                id="document"
                type="text"
                name="document"
                placeholder="Digite o documento do cliente"
                required
                mask="___.___.___-__"
                replacement={{ _: /\d/ }}
                onChange={(e) => setUserDocument(e.target.value)}
                defaultValue={crmCase.customer?.document}
                disabled={!!crmCase.customer?.document}
              />

              <button
                type="button"
                disabled={pending || searchingUser || hasSearchedCustomer}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-200"
                onClick={handleSearchUser}
              >
                Buscar
              </button>
              <input type="hidden" name="customer_id" value={customer?.customer_id || ''} />
            </div>
          </div>
        </div>

        <div className="columns-2 my-4">
          <div>
            <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="first_name">
              Nome
            </label>

            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              id="first_name"
              type="text"
              name="first_name"
              placeholder="Digite o nome do cliente"
              required
              disabled={!hasSearchedCustomer || !!customer}
              defaultValue={customer?.first_name || ''}
            />
          </div>

          <div>
            <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="last_name">
              Sobrenome
            </label>

            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              id="last_name"
              type="text"
              name="last_name"
              placeholder="Digite o sobrenome do cliente"
              required
              disabled={!hasSearchedCustomer || !!customer}
              defaultValue={customer?.last_name || ''}
            />
          </div>
        </div>

        <div className="columns-2 my-4">
          <div>
            <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="first_name">
              Cidade
            </label>

            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              id="city"
              type="text"
              name="city"
              placeholder="Digite a cidade"
              required
              disabled={!hasSearchedCustomer || !!customer}
              defaultValue={customer?.shipping.city || ''}
            />
          </div>

          <div>
            <label
              className="mb-3 block text-xs font-medium text-gray-900"
              htmlFor="state"
            >
              Estado
            </label>

            <div className="relative">
              <select
                className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                id="state"
                name="state"
                defaultValue={customer?.shipping.state}
                required
                disabled={!hasSearchedCustomer || !!customer}
              >
                {brazilStates.map((state) => (
                  <option key={`state-${state}`} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex space-x-8 mt-6">
          <Button type="submit" className="w-22 items-center" aria-disabled={pending}>
            Salvar
          </Button>
        </div>
      </form>
    </Card>
  );
}
