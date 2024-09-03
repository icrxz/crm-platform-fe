"use client";
import { removeDocumentSymbols } from "@/app/libs/parser";
import { fetchContractors } from "@/app/services/contractors";
import { fetchCustomers } from "@/app/services/customers";
import { brazilStates } from "@/app/types/address";
import { Case } from "@/app/types/case";
import { Contractor } from "@/app/types/contractor";
import { Customer } from "@/app/types/customer";
import { ServiceResponse } from "@/app/types/service";
import { roboto } from "@/app/ui/fonts";
import { InputMask } from "@react-input/mask";
import { InputNumberFormat } from "@react-input/number-format";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../common/button";

interface CaseFormProps {
  case?: Case;
  onSubmit: (_currentState: unknown, formData: FormData) => Promise<ServiceResponse<any>>;
  onClose: () => void;
  submitState?: Dispatch<SetStateAction<ServiceResponse<any> | null>>;
}

export default function CaseForm({ onSubmit, submitState, onClose }: CaseFormProps) {
  const [state, dispatch] = useFormState(onSubmit, null);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [userDocument, setUserDocument] = useState<string>("");
  const [searchingUser, setSearchingUser] = useState<boolean>(false);
  const [customer, setCustomer] = useState<Customer | undefined>();
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

  useEffect(() => {
    fetchContractors("active=true", 1, 1000).then(res => {
      setContractors(res.data?.result || []);
    });
  }, []);

  useEffect(() => {
    if (submitState) {
      submitState(state);
    }
  }, [state, submitState]);

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1">
        <h1 className={`${roboto.className} mb-5 text-2xl`}>
          Criar caso
        </h1>

        <div className="w-full">
          <div className="columns-2 mb-4">
            <div>
              <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="claim">
                Sinistro
              </label>

              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                id="first_name"
                type="text"
                name="claim"
                placeholder="Digite o sinistro"
                required
              />
            </div>

            <div>
              <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="contractor">
                Seguradora
              </label>

              <select className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500" id="contractor" name="contractor" required>
                <option value="">Selecione a seguradora</option>
                {contractors.map(contractor => (
                  <option key={contractor.contractor_id} value={contractor.contractor_id}>{contractor.company_name}</option>
                ))}
              </select>
            </div>
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
              />
            </div>
          </div>

          <div className="columns-1 mb-4">
            <div>
              <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="description">
                Descrição
              </label>

              <textarea
                className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                id="description"
                name="description"
                placeholder="Insira a descrição da seguradora"
                required
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
                />

                <button
                  type="button"
                  disabled={pending || searchingUser}
                  className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={customer?.shipping.state}
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
        </div>

        <div className="flex space-x-8 mt-6">
          <Button type="submit" className="w-32 items-center" aria-disabled={pending}>
            Criar
          </Button>

          <Button type="button" className="w-32 items-center" aria-disabled={pending} onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
}
