"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { parseCurrencyToNumber, parseToCurrency } from "@/app/libs/parser";
import { fetchTransactions, updateTransaction } from "@/app/services/transactions";
import { CaseFull } from "@/app/types/case";
import { Transaction, TransactionDescMap, TransactionForm, TransactionType } from "@/app/types/transaction";
import { InputNumberFormat } from "@react-input/number-format";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../common/button";
import { Card } from "../../common/card";

interface ReceiptStatusFormProps {
  crmCase: CaseFull;
}

export function ReceiptStatusForm({ crmCase }: ReceiptStatusFormProps) {
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();

  const [caseTransactions, setCaseTransactions] = useState<Transaction[]>([]);
  const [formTransactions, setFormTransactions] = useState<TransactionForm[]>([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [allowEdit, setAllowEdit] = useState(false);

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
        setFormTransactions(resp.data.map((tr) => {
          return {
            ...tr,
            description: tr.description || "",
            value: parseToCurrency(tr.value),
          };
          ;
        }));
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  useEffect(() => {
    searchTransactions();
  }, []);

  function handleEnableEdit() {
    setAllowEdit(true);
  }

  function handleConfimEdit() {
    setLoadingSubmit(true);

    try {
      formTransactions.forEach(tr => {
        updateTransaction(tr.transaction_id, parseCurrencyToNumber(tr.value)).then((resp) => {
          if (!resp.success) {
            if (resp.unauthorized) {
              signOut();
              showSnackbar(resp.message, 'error');
              return;
            }
          }
        })
      })

      showSnackbar("Transações atualizadas com sucesso!", 'success');

      refresh();
    } catch (ex) {
      showSnackbar("erro ao atualizar as transações!", 'error');
    } finally {
      setAllowEdit(false);
      setLoadingSubmit(false);
    }
  }

  function handleCancelEdit() {
    setAllowEdit(false);

    setFormTransactions(caseTransactions.map((tr) => {
      return {
        ...tr,
        description: tr.description || "",
        value: parseToCurrency(tr.value),
      };
    }));
  }

  const handleTransactionUpdate = (transactionID: string, e: React.FormEvent<HTMLInputElement>) => {
    const updatedTransactions = formTransactions.map((transaction) => {
      if (transaction.transaction_id == transactionID) {
        transaction.value = e.currentTarget.value;
      }
      return transaction;
    })

    setFormTransactions(updatedTransactions)
  }

  return (
    <Card title="Transações" titleSize="text-xl">
      <form className="px-5">
        <div className="mb-2">
          <h2>Técnico</h2>
          <div className="grid mt-2 mb-4 gap-4 grid-cols-3 w-full">
            {formTransactions?.filter((tr) => tr.type === TransactionType.OUTGOING).map((transaction) => (
              <div key={transaction.transaction_id} className="flex gap-4 items-center">
                <div className="gap-4 items-center">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="amount">
                    {TransactionDescMap[transaction.description as keyof typeof TransactionDescMap]}
                  </label>

                  <InputNumberFormat
                    className="peer disabled:bg-gray-300 disabled:cursor-not-allowed block rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                    id="amount"
                    name="amount"
                    placeholder="Digite o valor"
                    required
                    locales={"pt-BR"}
                    maximumFractionDigits={2}
                    format="currency"
                    currency="BRL"
                    min={0}
                    value={transaction.value}
                    disabled={!allowEdit}
                    onChange={(e) => handleTransactionUpdate(transaction.transaction_id, e)}
                  />
                </div>
              </div>
            ))}
          </div>
          <hr className="w-full" />
        </div>

        <div className="mb-4">
          <h2>Seguradora</h2>
          <div className="grid mt-2 gap-4 grid-cols-3">
            {formTransactions.filter((tr) => tr.type === TransactionType.INCOMING).map((transaction) => (
              <div key={transaction.transaction_id} className="flex gap-4 items-center">
                <div className="gap-4 items-center">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="amount">
                    {TransactionDescMap[transaction.description as keyof typeof TransactionDescMap]}
                  </label>

                  <InputNumberFormat
                    className="peer disabled:bg-gray-300 disabled:cursor-not-allowed block rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                    id="amount"
                    name="amount"
                    placeholder="Digite o valor"
                    required
                    locales={"pt-BR"}
                    maximumFractionDigits={2}
                    format="currency"
                    currency="BRL"
                    min={0}
                    value={transaction.value}
                    disabled={!allowEdit}
                    onChange={(e) => handleTransactionUpdate(transaction.transaction_id, e)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {!allowEdit && <div className="pl-1 flex">
          <Button isLoading={loadingSubmit} onClick={handleEnableEdit}>
            Editar
          </Button>
        </div>}

        {allowEdit && <div className="pl-1 flex gap-4">
          <Button isLoading={loadingSubmit} color="success" onClick={handleConfimEdit}>
            Confirmar
          </Button>

          <Button isLoading={loadingSubmit} color="error" onClick={handleCancelEdit}>
            Cancelar
          </Button>
        </div>}
      </form>
    </Card>
  );
}
