import { lusitana } from "@/app/ui/fonts";
import { Button } from "../common/button";
import Modal from "../common/modal";
import { useFormState, useFormStatus } from "react-dom";
import { deleteContractor } from "@/app/services/contractors";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { useRouter } from "next/navigation";

interface DeleteContractorModalProps {
    isOpen: boolean;
    contractorID: string;
    onClose: () => void;
}

export function DeleteContractorModal({ isOpen, onClose, contractorID }: DeleteContractorModalProps) {
    const [state, dispatch] = useFormState(deleteContractor, null)
    const { pending } = useFormStatus();
    const { showSnackbar } = useSnackbar();
    const { refresh } = useRouter();

    useEffect(() => {
        if (!state) {
            return;
        }

        if (state.success) {
            showSnackbar(state.message, 'success')
            refresh();
            onClose();
        } else {
            if (state?.unauthorized) {
                signOut();
            }
            showSnackbar(state?.message || "", 'error')
        }
    }, [state])

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form action={dispatch} className="space-y-3">
                <h1 className={`${lusitana.className} my-5 mx-5 text-xl`}>
                    Tem certeza que deseja desativar a seguradora?
                </h1>

                <input type="hidden" name="contractor_id" value={contractorID} />

                <div className="flex justify-center space-x-2">
                    <Button type="submit" aria-disabled={pending}>Sim</Button>
                    <Button onClick={onClose} aria-disabled={pending}>Não</Button>
                </div>
            </form>
        </Modal>
    )
}
