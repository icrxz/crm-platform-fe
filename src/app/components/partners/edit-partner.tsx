import { signOut } from "next-auth/react";
import Modal from "../common/modal";
import { editPartner, getPartnerByID } from "../../services/partners";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Suspense, useEffect, useState } from "react";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import PartnerForm from "./partner-form";
import { ServiceResponse } from "@/app/types/service";
import { Partner } from "@/app/types/partner";
import { useRouter } from "next/navigation";

interface EditPartnerModalProps {
    isOpen: boolean;
    partnerID: string;
    onClose: () => void;
}

export default function EditPartnerModal({ isOpen, onClose, partnerID }: EditPartnerModalProps) {
    const [errorMessage, setErrorMessage] = useState("");
    const [state, setState] = useState<ServiceResponse<any> | null>(null);
    const [partner, setPartner] = useState<Partner | undefined>(undefined);

    const { showSnackbar } = useSnackbar();
    const { refresh } = useRouter();

    const handleClose = () => {
        setPartner(undefined);
        onClose();
    }

    useEffect(() => {
        async function getPartner() {
            const partner = await getPartnerByID(partnerID);
            if (!partner.success) {
                showSnackbar(partner.message, 'error')
                onClose();
            }

            setPartner(partner.data);
        }

        getPartner();
    }, [partnerID])

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
                <Suspense fallback={<div>Carregando...</div>} >
                    {partner && <PartnerForm onSubmit={editPartner} submitState={setState} onClose={handleClose} partner={partner} />}
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
    );
}