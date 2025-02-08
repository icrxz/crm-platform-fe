"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { createCaseBatch } from "@/app/services/cases";
import { roboto } from "@/app/ui/fonts";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../common/button";
import { ErrorMessage } from "../common/error-message";
import Modal from "../common/modal";
import { Contractor } from "@/app/types/contractor";
import { fetchContractors } from "@/app/services/contractors";

interface CreateCaseBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCaseBatchModal({ isOpen, onClose }: CreateCaseBatchModalProps) {
  const [_, dispatch] = useFormState(onSubmit, null);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const { pending } = useFormStatus();
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(_: unknown, formData: FormData) {
    createCaseBatch(formData).then(resp => {
      if (!resp.success) {
        if (resp.unauthorized) {
          signOut();
          showSnackbar(resp.message, 'error');
          return;
        }
      }
      refresh();
      onClose();
      showSnackbar("casos criados com sucesso!", 'success');
    }).catch((ex) => {
      console.error(ex)
      showSnackbar("algo de errado aconteceu, contate o suporte!", 'error');
    })
  }

  useEffect(() => {
      fetchContractors("active=true", 1, 1000).then(res => {
        setContractors(res.data?.result || []);
      });
    }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form action={dispatch} className="space-y-4">
        <h1 className={`${roboto.className} my-5 mx-5 text-xl`}>
          Criar casos em lote
        </h1>

        <div>
          <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor="company">
            Seguradora
          </label>

          <select className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500" id="company" name="company" required>
            <option value="">Selecione a seguradora</option>
            {contractors.map(contractor => (
              <option key={contractor.contractor_id} value={contractor.company_name}>{contractor.company_name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <label>Adicione o documento nos formatos .csv, .xlsx</label>
          <input type="file" id="file" name="file" accept=".csv,.xls,.xlsx" />
        </div>

        {errorMessage && (
          <ErrorMessage message={errorMessage} />
        )}

        <div className="flex justify-center space-x-8">
          <Button type="submit" className="min-w-24 place-content-center" aria-disabled={pending} isLoading={pending}>Confirmar</Button>
          <Button onClick={onClose} className="min-w-24 place-content-center" aria-disabled={pending} isLoading={pending}>Cancelar</Button>
        </div>
      </form>
    </Modal>
  );
}