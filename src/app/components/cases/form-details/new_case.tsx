"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { assignOwner } from "@/app/services/cases";
import { fetchUsers } from "@/app/services/user";
import { CaseFull } from "@/app/types/case";
import { User } from "@/app/types/user";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../../common/button";
import { Card } from "../../common/card";

interface NewCaseStatusFormProps {
  crmCase: CaseFull;
}

export function NewCaseStatusForm({ crmCase }: NewCaseStatusFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useFormState(onSubmit, null);

  function onSubmit(_currentState: unknown, formData: FormData) {
    assignOwner(formData, crmCase.case_id).then(response => {
      if (!response.success) {
        if (response.unauthorized) {
          signOut();
        }
        setErrorMessage(response.message || "");
        return;
      }

      showSnackbar(response.message, 'success');
      refresh();
    }).catch(error => {
      setErrorMessage(error);
    });
  }

  useEffect(() => {
    const query = "active=true&role=operator&role=admin_operator";
    fetchUsers(query, 1, 1000).then(response => {
      if (!response.success || !response.data) {
        if (response.unauthorized) {
          signOut();
        }
        return;
      }

      setUsers(response.data.result || []);
    }).catch(error => {
      console.error(error);
    });
  }, []);

  return (
    <Card title="Novo caso" titleSize="text-xl">
      <form action={dispatch} className="px-5">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="owner">
            Usuário responsável
          </label>

          <select
            className="w-full h-10 p-2 border border-gray-300 rounded-md"
            name="owner"
            id="owner"
          >
            <option value="0">Selecione um usuário</option>
            {users.map(user => (
              <option key={user.user_id} value={user.user_id}>
                {`${user.first_name} ${user.last_name}`}
              </option>
            ))}
          </select>
        </div>

        {errorMessage && (
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">{errorMessage}</p>
          </div>
        )}

        <Button>Atribuir</Button>
      </form>
    </Card>
  );
}
