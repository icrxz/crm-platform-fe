"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { changePartner } from "@/app/services/cases";
import { fetchPartners } from "@/app/services/partners";
import { CaseFull } from "@/app/types/case";
import { Partner } from "@/app/types/partner";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
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

  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useFormState(onSubmit, null);

  useEffect(() => {
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
      partners = partners.
        filter(partner => partner.region == crmCase.region).
        sort((a, b) => a.first_name.localeCompare(b.first_name));

      setPartners(partners);
    });
  }, []);

  function onSubmit(_currentState: unknown, formData: FormData) {
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
  }

  return (
    <Card title="Atribuir técnico" titleSize="text-xl">
      <form action={dispatch} className="px-5">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="partner">
            Técnico responsável
          </label>

          <select
            className="w-full h-10 p-2 border border-gray-300 rounded-md"
            name="partner"
            id="partner"
            required
          >
            {partners.map(partner => {
              return <option key={partner.partner_id} value={partner.partner_id}>
                {`${partner.first_name} ${partner.last_name} - ${partner.shipping.city} / ${partner.shipping.state}`}
              </option>;
            })}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="target_date">
            Data de visita
          </label>

          <InputMask
            type="datetime-local"
            id="target_date"
            name="target_date"
            className="w-full h-10 p-2 border border-gray-300 rounded-md"
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

        <Button>Atribuir</Button>
      </form>
    </Card>
  );
}
