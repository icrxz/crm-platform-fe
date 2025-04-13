import { Contractor } from "@/app/types/contractor";
import { ServiceResponse } from "@/app/types/service";
import { roboto } from "@/app/ui/fonts";
import { InputMask } from "@react-input/mask";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../common/button";
import { parseDocument } from "@/app/libs/parser";

interface ContractorFormProps {
  contractor?: Contractor;
  onSubmit: (_currentState: unknown, formData: FormData) => Promise<ServiceResponse<any>>;
  onClose: () => void;
  submitState?: Dispatch<SetStateAction<ServiceResponse<any> | null>>;
}

export function ContractorForm({ onClose, onSubmit, contractor, submitState }: ContractorFormProps) {
  const [state, dispatch] = useFormState(onSubmit, null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (submitState) {
      submitState(state);
    }
  }, [state, submitState]);

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1 rounded-lg">
        <h1 className={`${roboto.className} mb-5 text-2xl`}>
          {contractor ? 'Edite a seguradora' : 'Cadastre a seguradora'}
          <input type="hidden" name="contractor_id" value={contractor?.contractor_id || ''} />
        </h1>

        <div className="w-full">
          <div className="columns-3 mb-4">
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="company_name"
              >
                Nome da empresa
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="company_name"
                  type="text"
                  name="company_name"
                  placeholder="Digite o nome da empresa"
                  required
                  defaultValue={contractor?.company_name || ''}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="legal_name"
              >
                Razão Social
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="legal_name"
                  type="text"
                  name="legal_name"
                  placeholder="Digite a razão social"
                  required
                  defaultValue={contractor?.legal_name || ''}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="document"
              >
                CNPJ
              </label>

              <div className="relative">
                <InputMask
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="document"
                  name="document"
                  placeholder="Digite o CNPJ da empresa"
                  required
                  mask="__.___.___/____-__"
                  replacement={{ _: /\d/ }}
                  defaultValue={parseDocument(contractor?.document || '')}
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
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="phone"
                  type="text"
                  name="phone"
                  placeholder="Digite o telefone do representante"
                  defaultValue={contractor?.business_contact?.phone_number || ''}
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
                  placeholder="Digite o email do representante"
                  defaultValue={contractor?.business_contact?.email || ''}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-8 mt-6">
          <Button type="submit" className="w-32 items-center" isLoading={pending} aria-disabled={pending}>
            {contractor ? 'Salvar' : 'Criar'}
          </Button>

          <Button type="button" className="w-32 items-center" isLoading={pending} aria-disabled={pending} onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
}
