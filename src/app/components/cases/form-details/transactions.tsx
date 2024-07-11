"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { parseToCurrency } from "@/app/libs/parser";
import { changeStatus } from "@/app/services/cases";
import { createTransaction, fetchTransactions } from "@/app/services/transactions";
import { CaseFull, CaseStatus } from "@/app/types/case";
import { Transaction, TransactionType } from "@/app/types/transaction";
import { InputNumberFormat } from "@react-input/number-format";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../../common/button";
import { Card } from "../../common/card";

interface TransactionStatusFormProps {
  crmCase: CaseFull;
}

const transactionTypeTranslate: Record<string, string> = {
  [TransactionType.INCOMING]: "Entrada",
  [TransactionType.OUTGOING]: "Saída",
};

export function TransactionStatusForm({ crmCase }: TransactionStatusFormProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useFormState(onSubmit, null);
  const { pending } = useFormStatus();

  const [loadingFinalize, setLoadingFinalize] = useState(false);
  const [caseTransactions, setCaseTransactions] = useState<Transaction[]>([]);

  function searchTransactions() {
    fetchTransactions(`case_id=${crmCase.case_id}`).then((resp) => {
      if (!resp.success) {
        if (resp.unauthorized) {
          signOut();
        }
        showSnackbar(resp.message, 'error');
        return;
      }

      if (resp.data) {
        setCaseTransactions(resp.data);
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  function onSubmit(_currentState: unknown, formData: FormData) {
    createTransaction(crmCase.case_id, formData).then((resp) => {
      if (!resp.success) {
        if (resp.unauthorized) {
          signOut();
        }
        showSnackbar(resp.message, 'error');
        return;
      }

      showSnackbar(resp.message, 'success');
      searchTransactions();
    }).catch((error) => {
      console.error(error);
      showSnackbar("erro ao adicionar transação!", 'error');
    });
  }

  function onFinalize() {
    setLoadingFinalize(true);

    const caseStatus = caseTransactions
      .filter((transaction) => transaction.type === TransactionType.OUTGOING).length > 0 ? CaseStatus.RECEIPT : CaseStatus.CLOSED;

    changeStatus(crmCase.case_id, caseStatus).then((resp) => {
      if (!resp.success) {
        if (resp.unauthorized) {
          signOut();
        }
        showSnackbar(resp.message, 'error');
        return;
      }

      showSnackbar(resp.message, 'success');
      refresh();
    }).catch((error) => {
      console.error(error);
      showSnackbar("erro ao finalizar caso!", 'error');
    }).finally(() => {
      setLoadingFinalize(false);
    });
  }

  useEffect(() => {
    searchTransactions();
  }, []);

  return (
    <Card title="Adicionar transações" titleSize="text-xl">
      <form action={dispatch} className="px-5">
        <div className="mb-4 flex gap-4 w-full items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="amount">
              Valor
            </label>

            <InputNumberFormat
              className="peer block rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500 w-32"
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
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="transaction_type">
              Tipo
            </label>

            <select
              className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="transaction_type"
              name="transaction_type"
              required
            >
              <option value={TransactionType.INCOMING}>Entrada</option>
              <option value={TransactionType.OUTGOING}>Saída</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
              Descrição
            </label>

            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="description"
              name="description"
            />
          </div>

          <div className="mt-6 ml-2">
            <Button disabled={pending || loadingFinalize} className="h-8 px-4 si">
              Adicionar
            </Button>
          </div>
        </div>

        {caseTransactions?.length > 0 && (
          <div className="mb-4 pl-2">
            <h3 className="text-lg font-semibold mb-2">Transações</h3>

            <div className="container">
              {caseTransactions.map((transaction) => (
                <div
                  key={transaction.transaction_id}
                  className="flex gap-4"
                >
                  <div className="w-1/4">
                    <p className="text-sm text-gray-500">
                      Valor
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {parseToCurrency(transaction.value)}
                    </p>
                  </div>

                  <div className="w-1/4">
                    <p className="block text-sm text-gray-500">
                      Tipo da transação
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {transactionTypeTranslate[transaction.type]}
                    </p>
                  </div>

                  <div className="w-1/4">
                    <p className="block text-sm text-gray-500">
                      Descrição
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description || '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pl-1">
          <Button type="button" onClick={onFinalize} disabled={pending || loadingFinalize}>
            Concluir
          </Button>
        </div>
      </form>
    </Card>
  );
}
