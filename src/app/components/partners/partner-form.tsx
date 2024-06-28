import { brazilStates } from "@/app/types/address";
import { Partner } from "@/app/types/partner";
import { ServiceResponse } from "@/app/types/service";
import { lusitana } from "@/app/ui/fonts";
import { InputMask } from "@react-input/mask";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../common/button";

interface PartnerFormProps {
  partner?: Partner;
  onSubmit: (_currentState: unknown, formData: FormData) => Promise<ServiceResponse<any>>;
  onClose: () => void;
  submitState?: Dispatch<SetStateAction<ServiceResponse<any> | null>>;
}

export default function PartnerForm({ partner, onSubmit, submitState, onClose }: PartnerFormProps) {
  const [state, dispatch] = useFormState(onSubmit, null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (submitState) {
      submitState(state);
    }
  }, [state, submitState]);

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1">
        <h1 className={`${lusitana.className} mb-5 text-2xl`}>
          {partner ? 'Edite o técnico' : 'Cadastre o técnico'}
          <input type="hidden" name="partner_id" value={partner?.partner_id || ''} />
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
                  defaultValue={partner?.first_name || ''}
                  required
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
                  defaultValue={partner?.last_name || ''}
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="document"
              >
                Documento
              </label>

              <div className="relative">
                <InputMask
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="document"
                  name="document"
                  placeholder="Digite o CPF"
                  mask="___.___.___-__"
                  replacement={{ _: /\d/ }}
                  defaultValue={partner?.document || ''}
                  required
                />
              </div>
            </div>
          </div>

          <hr />

          <div className="columns-2 my-4">
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
                  defaultValue={partner?.shipping?.city || ''}
                  placeholder="Digite a cidade"
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
                  defaultValue={partner?.shipping?.state || ''}
                >
                  {brazilStates.map((state) => (
                    <option key={`state-${state}`} value={state}>{state}</option>
                  ))}
                </select>
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
                  defaultValue={partner?.personal_contact?.phone_number || ''}
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
                  defaultValue={partner?.personal_contact?.email || ''}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-8 mt-6">
            <Button type="submit" className="w-32 items-center" aria-disabled={pending}>
              {partner ? 'Editar' : 'Criar'}
            </Button>

            <Button type="button" className="w-32 items-center" aria-disabled={pending} onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
