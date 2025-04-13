import { brazilStates } from "@/app/types/address";
import { Customer } from "@/app/types/customer";
import { ServiceResponse } from "@/app/types/service";
import { InputMask } from "@react-input/mask";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { roboto } from "../../ui/fonts";
import { Button } from "../common/button";
import { parseDocument } from "@/app/libs/parser";

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (_currentState: unknown, formData: FormData) => Promise<ServiceResponse<any>>;
  onClose: () => void;
  submitState?: Dispatch<SetStateAction<ServiceResponse<any> | null>>;
}

export default function CustomerForm({ onClose, onSubmit, customer, submitState }: CustomerFormProps) {
  const [state, dispatch] = useFormState(onSubmit, null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (submitState) {
      submitState(state);
    }
  }, [state, submitState]);

  function getCustomerAddress(customer?: Customer) {
    return customer?.shipping?.address?.split(',')[0] || ''
  }

  function getCustomerAddressNumber(customer?: Customer) {
    return customer?.shipping?.address?.split(',')[1]?.split('-')[0] || ''
  }

  function getCustomerAddressComplement(customer?: Customer) {
    return customer?.shipping?.address?.split('-')[1] || ''
  }

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1">
        <h1 className={`${roboto.className} mb-5 text-2xl`}>
          {customer ? 'Edite o cliente' : 'Cadastre o cliente'}
          <input type="hidden" name="customer_id" value={customer?.customer_id || ''} />
        </h1>

        <div className="w-full">
          <div className="columns-3 mb-4">
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="first_name"
              >
                Nome
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="first_name"
                  type="text"
                  name="first_name"
                  placeholder="Digite o nome"
                  required
                  defaultValue={customer?.first_name || ''}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="last_name"
              >
                Sobrenome
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="last_name"
                  type="text"
                  name="last_name"
                  placeholder="Digite o sobrenome"
                  required
                  defaultValue={customer?.last_name || ''}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="document"
              >
                CPF
              </label>

              <div className="relative">
                <InputMask
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="document"
                  name="document"
                  placeholder="Digite o CPF"
                  mask="___.___.___-__"
                  replacement={{ _: /\d/ }}
                  required
                  defaultValue={parseDocument(customer?.document || '')}
                />
              </div>
            </div>
          </div>

          <hr />

          <div className="columns-3 my-4">
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="address"
              >
                Endereço
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="address"
                  type="text"
                  name="address"
                  placeholder="Digite o endereço"
                  defaultValue={getCustomerAddress(customer)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="number"
              >
                Número
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="number"
                  type="text"
                  name="number"
                  placeholder="Digite o número do endereço"
                  defaultValue={getCustomerAddressNumber(customer)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="complement"
              >
                Complemento
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="complement"
                  type="text"
                  name="complement"
                  placeholder="Digite o complemento, se houver"
                  defaultValue={getCustomerAddressComplement(customer)}
                />
              </div>
            </div>
          </div>

          <div className="columns-3 mb-4">
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="city"
              >
                Cidade
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="city"
                  type="text"
                  name="city"
                  placeholder="Digite a cidade"
                  required
                  defaultValue={customer?.shipping.city || ''}
                />
              </div>
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
                  defaultValue={customer?.shipping.state || ''}
                >
                  {brazilStates.map((state) => (
                    <option key={`state-${state}`} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="zip_code"
              >
                CEP
              </label>

              <div className="relative">
                <InputMask
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="zip_code"
                  name="zip_code"
                  placeholder="Digite o CEP"
                  mask="_____-___"
                  replacement={{ _: /\d/ }}
                  required
                  defaultValue={customer?.shipping.zip_code || ''}
                />
              </div>
            </div>
          </div>

          <hr />

          <div className="columns-2 my-4">
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="phone"
              >
                Telefone
              </label>

              <div className="relative">
                <InputMask
                  id="phone"
                  name="phone"
                  placeholder="Digite o telefone"
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  mask="+55 (__) _____-____"
                  replacement={{ _: /\d/ }}
                  defaultValue={customer?.personal_contact?.phone_number || ''}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="email"
              >
                Email
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Digite o email"
                  defaultValue={customer?.personal_contact?.email || ''}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-8 mt-6">
          <Button type="submit" className="w-32" isLoading={pending} aria-disabled={pending}>
            {customer ? 'Salvar' : 'Cadastrar'}
          </Button>

          <Button type="button" className="w-32" isLoading={pending} aria-disabled={pending} onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
}
