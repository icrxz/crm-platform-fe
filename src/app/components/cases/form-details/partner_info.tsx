"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { changePartner } from "@/app/services/cases";
import { fetchPartners } from "@/app/services/partners";
import { CaseFull } from "@/app/types/case";
import { Partner } from "@/app/types/partner";
import { ExclamationCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { InputMask } from "@react-input/mask";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../../common/button";
import { Card } from "../../common/card";

interface PartnerInfoFormProps {
  crmCase: CaseFull;
}

export function PartnerInfoStatusForm({ crmCase }: PartnerInfoFormProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<string>();
  const [isPartnerInvalid, setIsPartnerInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useFormState(onSubmit, null);

  useEffect(() => {
    setLoadingPartners(true);
    try {
      const query = "active=true";
      fetchPartners(query, 1, 1000).then(response => {
        if (!response.success || !response.data) {
          if (response.unauthorized) {
            signOut();
          }
          setErrorMessage(response.message || "");
          return;
        }

        let partners = response.data.result;
        partners = partners.sort((a, b) => a.first_name.localeCompare(b.first_name));

        setPartners(partners);
      });
    } finally {
      setLoadingPartners(false);
    }
  }, []);

  async function onSubmit(_currentState: unknown, formData: FormData) {
    try {
      setIsLoading(true);
      setIsPartnerInvalid(false);

      if (!selectedPartner) {
        setIsPartnerInvalid(true);
        return;
      }

      formData.set("partner", selectedPartner?.toString() || '')

      changePartner(crmCase.case_id, formData).then(response => {
        if (!response.success) {
          if (response.unauthorized) {
            signOut();
          }
          setErrorMessage(response.message || "");
          return;
        }

        showSnackbar(response.message, 'success');
        refresh();
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card title="Atribuir técnico" titleSize="text-xl">
      <form action={dispatch} className="px-5">
        <div className="mb-4">
          <Autocomplete
            label="Técnico responsável"
            placeholder="Selecione um técnico"
            classNames={{
              listboxWrapper: "max-h-[320px]",
              selectorButton: "text-default-500",
              base: "text-sm font-medium text-gray-700",
            }}
            isRequired
            labelPlacement="outside"
            variant="bordered"
            radius="sm"
            inputProps={{
              classNames: {
                input: "border-none focus:ring-0",
                inputWrapper: "bg-white border border-gray-300",
              }
            }}
            startContent={<MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />}
            isLoading={loadingPartners}
            selectedKey={selectedPartner}
            onSelectionChange={(key) => {
              setIsPartnerInvalid(false);
              setSelectedPartner(key?.toString());
            }}
            defaultItems={partners}
            isInvalid={isPartnerInvalid}
            color={isPartnerInvalid ? 'danger' : 'default'}
            errorMessage="Selecione um técnico!"
          >
            {(item) => (
              <AutocompleteItem key={item.partner_id}>
                {`${item.first_name} ${item.last_name} - ${item.shipping.city} / ${item.shipping.state}`}
              </AutocompleteItem >
            )}
          </Autocomplete>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="target_date">
            Data de visita
          </label>

          <InputMask
            type="datetime-local"
            id="target_date"
            name="target_date"
            className="w-full h-10 p-2 border border-gray-300 rounded-md text-sm text-gray-600"
            required
            mask="__/__/____"
            replacement={{ _: /\d/ }}
          />
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

        <Button isLoading={isLoading}>Atribuir</Button>
      </form>
    </Card>
  );
}
