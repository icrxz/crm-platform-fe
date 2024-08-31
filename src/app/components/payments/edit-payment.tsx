"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { parseCurrencyToNumber } from "@/app/libs/parser";
import { TransactionItem } from "@/app/types/transaction";
import { updateTransaction } from "@/app/services/transactions";
import { roboto } from "@/app/ui/fonts";
import { InputNumberFormat } from "@react-input/number-format";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../common/button";
import { ErrorMessage } from "../common/error-message";
import Modal from "../common/modal";
import { signOut } from "next-auth/react";

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: TransactionItem;
}

export function EditPaymentModal({ isOpen, onClose, transaction }: EditPaymentModalProps) {
  const [_, dispatch] = useFormState(onSubmit, null);
  const { pending } = useFormStatus();
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(_: unknown, formData: FormData) {
    try {
      const transactions = []

      const transactionMO = {
        transactionID: formData.get("transaction_id_mo")?.toString() || "",
        value: parseCurrencyToNumber(formData.get("amount_mo")?.toString() || ''),
      }
      transactions.push(transactionMO)

      const transactionTransport = {
        transactionID: formData.get("transaction_id_transport")?.toString() || "",
        value: parseCurrencyToNumber(formData.get("amount_transport")?.toString() || ''),
      }
      transactions.push(transactionTransport)

      const transactionParts = {
        transactionID: formData.get("transaction_id_parts")?.toString() || "",
        value: parseCurrencyToNumber(formData.get("amount_parts")?.toString() || ''),
      }
      transactions.push(transactionParts)

      transactions.forEach(tr => {
        updateTransaction(tr.transactionID, tr.value).then((resp) => {
          if (!resp.success) {
            if (resp.unauthorized) {
              signOut();
              showSnackbar(resp.message, 'error');
              return;
            }
          }
        })
      })
      
      refresh();
      onClose();
    } catch (ex) {
      showSnackbar("erro alterando as transações", 'error');
    }
  }

  function parseValueToMask(transactionValue?: number): string {
    const parsedValue = transactionValue || 0;

    return `R$ ${String(parsedValue.toFixed(2)).replace('.', ',')}`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form action={dispatch} className="space-y-4">
        <h1 className={`${roboto.className} my-5 mx-5 text-xl`}>
          Alterar dados dos pagamentos?
        </h1>

        <div className="flex flex-col gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="amount_mo">Mão de Obra</label>
            <InputNumberFormat
              className="peer block rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="amount_mo"
              name="amount_mo"
              placeholder="Digite o valor"
              required
              locales={"pt-BR"}
              maximumFractionDigits={2}
              format="currency"
              currency="BRL"
              min={0}
              defaultValue={parseValueToMask(transaction?.mo.value)}
            />
            <input type="hidden" id="transaction_id_mo" name="transaction_id_mo" value={transaction?.mo.transaction_id} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="amount_transport">Deslocamento</label>
            <InputNumberFormat
              className="peer block rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="amount_transport"
              name="amount_transport"
              placeholder="Digite o valor"
              required
              locales={"pt-BR"}
              maximumFractionDigits={2}
              format="currency"
              currency="BRL"
              min={0}
              defaultValue={parseValueToMask(transaction?.transport.value)}
            />
            <input type="hidden" id="transaction_id_transport" name="transaction_id_transport" value={transaction?.transport.transaction_id} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="amount_parts">Peças</label>
            <InputNumberFormat
              className="peer block rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="amount_parts"
              name="amount_parts"
              placeholder="Digite o valor"
              required
              locales={"pt-BR"}
              maximumFractionDigits={2}
              format="currency"
              currency="BRL"
              min={0}
              defaultValue={parseValueToMask(transaction?.parts.value)}
            />
            <input type="hidden" id="transaction_id_parts" name="transaction_id_parts" value={transaction?.parts.transaction_id} />
          </div>
        </div>

        {errorMessage && (
          <ErrorMessage message={errorMessage} />
        )}

        <div className="flex justify-center space-x-8">
          <Button type="submit" className="min-w-24 place-content-center" aria-disabled={pending} disabled={pending}>Confirmar</Button>
          <Button onClick={onClose} className="min-w-24 place-content-center" aria-disabled={pending} disabled={pending}>Cancelar</Button>
        </div>
      </form>
    </Modal>
  );
}