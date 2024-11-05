"use client"
import { updateUser } from "@/app/services/user";
import { UpdateUser } from "@/app/types/user";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../common/button";
import { ErrorMessage } from "../common/error-message";
import Modal from "../common/modal";

interface FirstLoginModalProps {
  userId: string;
}

export default function FirstLoginModal({ userId }: FirstLoginModalProps) {
  const [state, dispatch] = useFormState(onSubmit, null);
  const { refresh } = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  async function onSubmit(_: any, formData: FormData) {
    setIsLoading(true);
    setErrorMessage(undefined);
    try {
      const newPassword = formData.get("new_password")?.toString();
      const confirmPassword = formData.get("confirm_password")?.toString();
      const email = formData.get("email")?.toString();

      if (newPassword != confirmPassword) {
        setErrorMessage("As senhas devem corresponder!");
        return;
      }

      if (!newPassword || !email) {
        setErrorMessage("Os campos não podem estar vazios!");
        return;
      }

      const updateFormData: UpdateUser = {
        updated_by: "",
        email: email,
        password: newPassword,
        first_login_completed: true,
      };

      const resp = await updateUser(userId, updateFormData);
      if (!resp.success) {
        if (resp.unauthorized) {
          signOut();
        }
        setErrorMessage(resp.message);
        return;
      }

      refresh();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} closable={false}>
      <form action={dispatch} className="px-4 py-2">
        <div>
          <h3 className="text-xl text-gray-900 font-bold">Alterar dados</h3>
          <p className="text-xs text-gray-500">Altere seus dados de login no primeiro acesso</p>
        </div>

        <div className="mt-4 space-y-2">
          <label
            className="block text-xs font-medium text-gray-900"
            htmlFor="email"
          >
            Email
          </label>

          <input
            className="peer block w-full rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500"
            id="email"
            type="email"
            name="email"
            placeholder="Coloque seu endereço de email"
            required
          />
        </div>

        <div className="mt-4 space-y-2">
          <label
            className="block text-xs font-medium text-gray-900"
            htmlFor="new_password"
          >
            Nova senha
          </label>

          <input
            className="peer block w-full rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500"
            id="new_password"
            type="password"
            name="new_password"
            placeholder="Digite sua nova senha"
            required
            minLength={6}
          />
        </div>

        <div className="mt-4 space-y-2">
          <label
            className="block text-xs font-medium text-gray-900"
            htmlFor="confirm_password"
          >
            Confirme sua senha
          </label>

          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500"
              id="confirm_password"
              type="password"
              name="confirm_password"
              placeholder="Confime sua nova senha"
              required
              minLength={6}
            />
          </div>
        </div>

        {errorMessage && (
          <ErrorMessage message={errorMessage} />
        )}


        <div className="mt-4">
          <Button type="submit" disabled={isLoading} size="md">Confirmar</Button>
        </div>
      </form>
    </Modal>
  )
}