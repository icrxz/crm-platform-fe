"use client";
import { fetchPartners } from "@/app/services/partners";
import { CaseFull } from "@/app/types/case";
import { Partner } from "@/app/types/partner";
import { InputMask } from "@react-input/mask";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "../../common/button";
import { Card } from "../../common/card";

interface PartnerInfoFormProps {
    crmCase: CaseFull;
}

export function PartnerInfoStatusForm({ crmCase }: PartnerInfoFormProps) {
    const [partners, setPartners] = useState<Partner[]>([]);

    useEffect(() => {
        const query = "active=true";
        fetchPartners(query).then(response => {
            if (!response.success || !response.data) {
                if (response.unauthorized) {
                    signOut();
                }
                return;
            }

            setPartners(response.data);
        }).catch(error => {
            console.error(error);
        });
    }, []);

    return (
        <Card title="Atribuir técnico" titleSize="text-xl">
            <form className="px-5">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="partner">
                        Técnico responsável
                    </label>

                    <select
                        className="w-full h-10 p-2 border border-gray-300 rounded-md"
                        name="partner"
                        id="partner"
                    >
                        <option value="0">Selecione um técnico</option>
                        {partners.map(partner => {
                            return <option key={partner.partner_id} value={partner.partner_id}>
                                {`${partner.first_name} ${partner.last_name} - ${partner.shipping.city} / ${partner.shipping.state}`}
                            </option>;
                        })}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="visit_date">
                        Data de visita
                    </label>

                    <InputMask
                        type="date"
                        id="visit_date"
                        name="visit_date"
                        className="w-full h-10 p-2 border border-gray-300 rounded-md"
                        required
                        mask="__/__/____"
                        replacement={{ _: /\d/ }}
                    />
                </div>

                <Button>Atribuir</Button>
            </form>
        </Card>
    );
}
