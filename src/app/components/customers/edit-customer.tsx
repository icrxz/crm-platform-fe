import { signOut } from "next-auth/react";
import Modal from "../common/modal";
import { editCustomer, getCustomerByID } from "../../services/customers";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Suspense, useEffect, useState } from "react";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import CustomerForm from "./customer-form";
import { ServiceResponse } from "@/app/types/service";
import { useRouter } from "next/navigation";
import { Customer } from "@/app/types/customer";

interface EditCustomerModalProps {
    isOpen: boolean;
    customerID: string;
    onClose: () => void;
}

export default function EditCustomerModal({ isOpen, onClose, customerID }: EditCustomerModalProps) {
    const [errorMessage, setErrorMessage] = useState("");
    const [state, setState] = useState<ServiceResponse<any> | null>(null);
    const [customer, setCustomer] = useState<Customer | undefined>(undefined);

    const { showSnackbar } = useSnackbar();
    const { refresh } = useRouter();

    const handleClose = () => {
        setCustomer(undefined);
        onClose();
    }

    useEffect(() => {
        async function getCustomer() {
            const customer = await getCustomerByID(customerID);
            if (!customer.success) {
                showSnackbar(customer.message, 'error')
                onClose();
            }

            setCustomer(customer.data);
        }

        getCustomer();
    }, [customerID])

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
                    {customer && <CustomerForm onSubmit={editCustomer} submitState={setState} onClose={handleClose} customer={customer} />}
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