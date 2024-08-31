"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { parseCurrencyToNumber } from "@/app/libs/parser";
import { changeStatus } from "@/app/services/cases";
import { createTransactions } from "@/app/services/transactions";
import { CaseFull, CaseStatus } from "@/app/types/case";
import { CreateTransaction, TransactionType } from "@/app/types/transaction";
import { InputNumberFormat } from "@react-input/number-format";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../../common/button";
import { Card } from "../../common/card";

interface TransactionStatusFormProps {
  crmCase: CaseFull;
}

type TransactionForm = {
  transaction_id: string,
  type: TransactionType,
  description: string,
  value: string,
}

const mappedTransactions: TransactionForm[] = [
  {
    transaction_id: "0",
    type: TransactionType.INCOMING,
    description: "Cobrado seguradora",
    value: "",
  },
  {
    transaction_id: "1",
    type: TransactionType.INCOMING,
    description: "Deslocamento",
    value: "",
  },
  {
    transaction_id: "2",
    type: TransactionType.OUTGOING,
    description: "MO",
    value: "",
  },
  {
    transaction_id: "3",
    type: TransactionType.OUTGOING,
    description: "Peças técnico",
    value: "",
  },
  {
    transaction_id: "4",
    type: TransactionType.OUTGOING,
    description: "Deslocamento Técnico",
    value: "",
  }
]

export function TransactionStatusForm({ crmCase }: TransactionStatusFormProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useFormState(onSubmit, null);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [caseTransactions, setCaseTransactions] = useState<TransactionForm[]>(mappedTransactions);

  async function onSubmit() {
    setLoadingSubmit(true);

    try {
      const transactions: CreateTransaction[] = caseTransactions.map((transaction) => {
        return {
          type: transaction.type,
          value: parseCurrencyToNumber(transaction.value),
          description: transaction.description,
        } as CreateTransaction;
      });

      const transactionResp = await createTransactions(crmCase.case_id, transactions);
      if (!transactionResp.success) {
        if (transactionResp.unauthorized) {
          signOut();
        }
        showSnackbar(transactionResp.message, 'error');
        return;
      }

      const statusResp = await changeStatus(crmCase.case_id, CaseStatus.RECEIPT);
      if (!statusResp.success) {
        if (statusResp.unauthorized) {
          signOut();
        }
        showSnackbar(statusResp.message, 'error');
        return;
      }

      showSnackbar(statusResp.message, 'success');
      refresh();
    } catch (ex) {
      console.error(ex);
      showSnackbar("erro ao adicionar transações!", 'error');
    } finally {
      setLoadingSubmit(false);
    }
  }

  const handleTransactionUpdate = (transactionID: string, e: React.FormEvent<HTMLInputElement>) => {
    const updatedTransactions = caseTransactions.map((transaction) => {
      if (transaction.transaction_id == transactionID) {
        transaction.value = e.currentTarget.value;
      }
      return transaction;
    })

    setCaseTransactions(updatedTransactions)
  }

  return (
    <Card title="Adicionar transações" titleSize="text-xl">
      <form action={dispatch} className="px-5">
        <div className="mb-4 w-full justify-evenly">
          {caseTransactions.map((transaction) => (
            <div key={transaction.transaction_id} className="flex gap-4 mb-2  items-center">
              <div className="flex gap-4 items-center">
                <label className="block text-sm font-medium text-gray-700" htmlFor="amount">
                  {transaction.description}:
                </label>

                <InputNumberFormat
                  className="peer block rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
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
                  onChange={(e) => handleTransactionUpdate(transaction.transaction_id, e)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pl-1">
          <Button disabled={loadingSubmit}>
            Concluir
          </Button>
        </div>
      </form>
    </Card>
  );
}
