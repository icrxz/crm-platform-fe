import { useSnackbar } from "@/app/context/SnackbarProvider";
import { createCase } from "@/app/services/cases";
import { ServiceResponse } from "@/app/types/service";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "../common/modal";
import CaseForm from "./case-form";

interface CreateCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateCaseModal({ isOpen, onClose }: CreateCaseModalProps) {
    const [errorMessage, setErrorMessage] = useState("");
    const [state, setState] = useState<ServiceResponse<any> | null>(null);
    const { showSnackbar } = useSnackbar();
    const { refresh } = useRouter();

    useEffect(() => {
        if (!state) {
            return;
        }

        if (state?.success) {
            showSnackbar(state.message, 'success');
            refresh();
            onClose();
        } else {
            if (state?.unauthorized) {
                signOut();
            }
            setErrorMessage(state?.message || "");
        }
    }, [state]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div>
                <CaseForm onClose={onClose} submitState={setState} onSubmit={createCase} />

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
            </div>
        </Modal>
    );
}
