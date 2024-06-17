import { Contractor } from "@/app/types/contractor";
import { ContractorForm } from "./contractor-form";
import { Suspense, useEffect, useState } from "react";
import { ServiceResponse } from "@/app/types/service";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { editContractor, getContractorByID } from "@/app/services/contractors";
import ExclamationCircleIcon from "@heroicons/react/24/outline/esm/ExclamationCircleIcon";
import Modal from "../common/modal";
import { signOut } from "next-auth/react";

interface EditContractorModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractorID: string;
}

export default function EditContractorModal({ isOpen, onClose, contractorID }: EditContractorModalProps) {
    const [errorMessage, setErrorMessage] = useState("");
    const [state, setState] = useState<ServiceResponse<any> | null>(null);
    const [contractor, setContractor] = useState<Contractor | undefined>(undefined);

    const { showSnackbar } = useSnackbar();
    const { refresh } = useRouter();

    function handleClose() {
        setContractor(undefined);
        onClose();
    }

    useEffect(() => {
        async function getPartner() {
            const contractor = await getContractorByID(contractorID);
            if (!contractor.success) {
                showSnackbar(contractor.message, 'error')
                onClose();
            }

            setContractor(contractor.data);
        }

        getPartner();
    }, [contractorID])

    useEffect(() => {
        if (!state) {
            return;
        }

        if (state?.success) {
            showSnackbar(state.message, 'success')
            refresh();
            onClose();
        } else {
            if (state?.unauthorized) {
                signOut();
            }
            setErrorMessage(state?.message || "")
        }
    }, [state])

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div>
                <Suspense fallback={<div>Loading...</div>}>
                    {contractor && <ContractorForm onClose={handleClose} onSubmit={editContractor} submitState={setState} contractor={contractor} />}
                </Suspense>

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
    )
}