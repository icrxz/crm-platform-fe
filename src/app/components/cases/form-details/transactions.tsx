"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { CaseFull } from "@/app/types/case";
import { InputNumberFormat } from "@react-input/number-format";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../../common/button";
import { Card } from "../../common/card";

interface TransactionStatusFormProps {
  crmCase: CaseFull;
}

export function TransactionStatusForm({ crmCase }: TransactionStatusFormProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useFormState(onSubmit, null);
  const { pending } = useFormStatus();

  function onSubmit(_currentState: unknown, formData: FormData) {
    try {
      console.log("transaction", formData);
    } catch (ex) {
      showSnackbar("erro ao adicionar transação!", 'error');
    }
  }

  return (
    <Card title="Adicionar transações" titleSize="text-xl">
      <form action={dispatch} className="px-5">
        <div className="mb-8 flex row gap-4 w-full align-bottom">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="amount">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="amount">
              Tipo da transação
            </label>

            <select
              className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="transaction_type"
              name="transaction_type"
              required
            >
              <option value="INPUT">Entrada</option>
              <option value="OUTPUT">Saída</option>
            </select>
          </div>

          <div className="mt-6">
            <Button
              disabled={pending}
              className="ml-4"
            >
              Adicionar transação
            </Button>
          </div>
        </div>

        <div>
          <Button
            type="button"
          >
            Concluir
          </Button>
        </div>
      </form>
    </Card>
  );
}
