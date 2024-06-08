import { signOut } from "next-auth/react";
import { Button } from "../common/button";
import Modal from "../common/modal";
import { createPartner } from "../../services/partners";
import { lusitana } from "../../ui/fonts";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useSnackbar } from "@/app/context/SnackbarProvider";

interface CreatePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePartnerModal({ isOpen, onClose }: CreatePartnerModalProps) {
  const [state, dispatch] = useFormState(createPartner, null)
  const { pending } = useFormStatus();
  const [errorMessage, setErrorMessage] = useState("");
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (state?.success) {
      showSnackbar(state.message, 'success')
      onClose();
    } else {
      if (state?.unauthorized) {
        signOut();
      }
      setErrorMessage(state?.message || "")
    }
  }, [onClose, state])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form action={dispatch} className="space-y-3">
        <div className="flex-1 rounded-lg">
          <h1 className={`${lusitana.className} mb-3 text-2xl`}>
            Cadastre o técnico
          </h1>

          <div className="w-full">
            <div>
              <div>
                <label
                  className="mb-3 mt-5 block text-xs font-medium text-gray-900"
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
                  />
                </div>
              </div>

              <div className="w-full">
                <div>
                  <label
                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
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
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                    htmlFor="document"
                  >
                    Documento
                  </label>

                  <div className="relative">
                    <input
                      className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                      id="document"
                      type="text"
                      name="document"
                      placeholder="Digite o cpf"
                      required
                    />
                  </div>
                </div>
              </div>

              <hr />

              <div>
                <div>
                  <label
                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
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
                      placeholder="Digite a cidade do técnico"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                    htmlFor="state"
                  >
                    Estado
                  </label>

                  <div className="relative">
                    <input
                      className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                      id="state"
                      type="text"
                      name="state"
                      placeholder="Digite o estado do técnico"
                    />
                  </div>
                </div>
              </div>

              <hr />

              <div>
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
                      placeholder="Digite o telefone do técnico"
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
                      placeholder="Digite o email do técnico"
                    />
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
        </div>
      </form>
    </Modal>
  )
}