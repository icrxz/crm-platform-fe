"use server";
import PartnerDetails from "@/app/components/partners/details";
import { getPartnerByID } from "@/app/services/partners";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Page({params: { partnerID }}: {params: { partnerID: string }}) {
    const session = await getServerSession()

    if (!session) {
        redirect("/login");
    }

    const partner = await getPartnerByID(partnerID);

    return (
        <main>
            <Suspense fallback={<p>Carregando técnico...</p>}>
                {partner?.data && <PartnerDetails partner={partner.data} />}
            </Suspense>
        </main>
    );
}