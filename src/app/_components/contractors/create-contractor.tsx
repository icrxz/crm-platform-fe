import { Button } from "@/app/_components/common/button";
import Modal from "@/app/_components/common/modal";
import { createContractor } from "@/app/_services/contractors";
import { lusitana } from "@/app/_ui/fonts";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

interface CreateContractorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateContractorModal({ isOpen, onClose }: CreateContractorModalProps) {
  const [state, dispatch] = useFormState(createContractor, undefined)
  const { pending } = useFormStatus();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (state?.success) {
      onClose();
    } else {
      if (state?.unauthorized) {
        // signOut();
      }
      setErrorMessage(state?.message)
    }
  }, [state])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form action={dispatch} className="space-y-3">
        <div className="flex-1 rounded-lg">
          <h1 className={`${lusitana.className} mb-3 text-2xl`}>
            Crie a seguradora
          </h1>

          <div className="w-full">
            <div>
              <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="legal_name"
              >
                Nome da seguradora
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="legal_name"
                  type="text"
                  name="legal_name"
                  placeholder="Digite o nome da empresa"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                htmlFor="document"
              >
                CNPJ
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="document"
                  type="text"
                  name="document"
                  placeholder="Digite o CNPJ da empresa"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
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
                  placeholder="Digite o telefone do representante da empresa"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 mt-5 block text-xs font-medium text-gray-900"
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
                />
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


          {errorMessage ? (
            <div
              className="flex h-8 items-end space-x-1"
              aria-live="polite"
              aria-atomic="true"
            >
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </div>
          ) : <></>}
        </div>
      </form>
    </Modal>
  )
}