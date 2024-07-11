"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { parseToCurrency } from "@/app/libs/parser";
import { fetchTransactions } from "@/app/services/transactions";
import { CaseFull } from "@/app/types/case";
import { Transaction, TransactionType } from "@/app/types/transaction";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card } from "../../common/card";

interface ReceiptStatusFormProps {
  crmCase: CaseFull;
}

const transactionTypeTranslate: Record<string, string> = {
  [TransactionType.INCOMING]: "Entrada",
  [TransactionType.OUTGOING]: "Saída",
};

export function ReceiptStatusForm({ crmCase }: ReceiptStatusFormProps) {
  const { showSnackbar } = useSnackbar();

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

  useEffect(() => {
    searchTransactions();
  }, []);

  return (
    <Card title="Transações" titleSize="text-xl">
      {caseTransactions?.length > 0 && (
        <div className="mb-4 pl-6">
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
    </Card>
  );
}
